const fs = require("fs");
const path = require("path");
const vm = require("vm");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error("Usage: node tests/inspect-pdf-structure.cjs <pdf-path>");
  process.exit(1);
}

const sandbox = {
  clearTimeout,
  setTimeout,
  TextDecoder,
  TextEncoder
};

vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(
    path.join(__dirname, "..", "assets", "vendor", "pdf-lib.min.js"),
    "utf8"
  ),
  sandbox
);

const { PDFArray, PDFDict, PDFDocument, PDFName, PDFRef } = sandbox.PDFLib;

function resolve(object, context) {
  return object instanceof PDFRef ? context.lookup(object) : object;
}

function decodePdfText(object, context) {
  const resolved = resolve(object, context);

  return typeof resolved?.decodeText === "function" ? resolved.decodeText() : "";
}

function summarizeChildren(object, context, depth = 0) {
  const resolved = resolve(object, context);

  if (resolved instanceof PDFArray) {
    return Array.from({ length: resolved.size() }, (_, index) =>
      summarizeChildren(resolved.get(index), context, depth)
    );
  }

  if (!(resolved instanceof PDFDict)) {
    return resolved?.toString?.() || null;
  }

  const role = resolve(resolved.get(PDFName.of("S")), context);
  const result = {
    role: role?.toString?.() || null
  };
  const alt = decodePdfText(resolved.get(PDFName.of("Alt")), context);

  if (alt) {
    result.alt = alt;
  }

  const page = resolved.get(PDFName.of("Pg"));

  if (page) {
    result.page = page.toString();
  }

  const mcid = resolve(resolved.get(PDFName.of("MCID")), context);

  if (mcid) {
    result.mcid = mcid.toString();
  }

  if (depth < 8) {
    result.children = summarizeChildren(
      resolved.get(PDFName.of("K")),
      context,
      depth + 1
    );
  }

  return result;
}

(async () => {
  sandbox.inputPdfBytes = Array.from(fs.readFileSync(pdfPath));
  const inputPdfBytes = vm.runInContext(
    "Uint8Array.from(inputPdfBytes)",
    sandbox
  );
  const pdfDocument = await PDFDocument.load(inputPdfBytes);
  const structureRoot = pdfDocument.catalog.get(PDFName.of("StructTreeRoot"));

  console.log(JSON.stringify({
    pages: pdfDocument.getPageCount(),
    structure: summarizeChildren(structureRoot, pdfDocument.context)
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
