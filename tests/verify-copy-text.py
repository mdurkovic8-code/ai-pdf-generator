import sys

from pypdf import PdfReader


def main() -> None:
    if len(sys.argv) not in (2, 3):
        raise SystemExit(
            "Usage: verify-copy-text.py <regression-pdf> [long|edge]"
        )

    reader = PdfReader(sys.argv[1])
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    mode = sys.argv[2] if len(sys.argv) == 3 else "long"

    if mode == "long":
        short_code = 'def hello():\n    print("ahoj")\n'
        long_code = "\n".join(
            (" " * ((index % 3) * 4)) + f'print("riadok {index + 1}")'
            for index in range(90)
        ) + "\n"

        assert short_code in text, (
            "Short code block lost line breaks or indentation."
        )
        assert long_code in text, (
            "Long code block lost line breaks or indentation."
        )
    elif mode == "edge":
        assert 'print("jeden")\n' in text, "Single-line code block changed."
        normalized_text = "\n".join(
            "" if not line.strip() else line for line in text.splitlines()
        ) + "\n"
        assert (
            'if True:\n    print("prvý")\n\n    print("druhý")\n'
            in normalized_text
        ), "Blank line or indentation changed."
    else:
        raise AssertionError(f"Unknown verification mode: {mode}")

    assert len(reader.outline) == 2, "Expected PDF bookmarks were not preserved."

    print(f"copy-text-ok pages={len(reader.pages)} outlines={len(reader.outline)}")


if __name__ == "__main__":
    main()
