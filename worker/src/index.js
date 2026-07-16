import puppeteer from "@cloudflare/puppeteer";

const MAX_REQUEST_BYTES = 1_500_000;
const ALLOWED_ORIGINS = new Set([
  "https://mdurkovic8-code.github.io",
  "http://127.0.0.1:8011",
  "http://localhost:8011",
  "null"
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";

  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://mdurkovic8-code.github.io",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(request, status, error) {
  return Response.json({ error }, {
    status,
    headers: corsHeaders(request)
  });
}

function sanitizeFilename(value) {
  const filename = String(value || "ucebne-skripta.pdf")
    .replace(/[\\/:*?"<>|\r\n]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120);

  return filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    if (request.method !== "POST" || url.pathname !== "/pdf") {
      return jsonResponse(request, 404, "Požadovaná služba neexistuje.");
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse(request, 403, "Táto stránka nemá povolený prístup ku generátoru.");
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);

    if (contentLength > MAX_REQUEST_BYTES) {
      return jsonResponse(request, 413, "Dokument je príliš veľký.");
    }

    let payload;

    try {
      payload = await request.json();
    } catch (_) {
      return jsonResponse(request, 400, "Odoslaný dokument nemá správny formát.");
    }

    if (typeof payload.html !== "string" || !payload.html.trim()) {
      return jsonResponse(request, 400, "Dokument neobsahuje žiadny text.");
    }

    if (new TextEncoder().encode(payload.html).byteLength > MAX_REQUEST_BYTES) {
      return jsonResponse(request, 413, "Dokument je príliš veľký.");
    }

    let browser;

    try {
      browser = await puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();

      await page.setContent(payload.html, {
        waitUntil: "networkidle0",
        timeout: 30_000
      });
      await page.emulateMediaType("print");
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        tagged: true,
        outline: true
      });
      const filename = sanitizeFilename(payload.filename);

      return new Response(pdf, {
        headers: {
          ...corsHeaders(request),
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store"
        }
      });
    } catch (error) {
      console.error("PDF generation failed", error);
      return jsonResponse(request, 500, "PDF sa momentálne nepodarilo vytvoriť. Skús to znova alebo použi pôvodný export.");
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
};
