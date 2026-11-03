#!/usr/bin/env python3
"""QR Maker & Reader — command-line tool.

Generate QR codes and decode them, entirely on your own machine.
No website, no uploads, no tracking.

Usage:
    python qr_cli.py generate "https://example.com" -o out.png
    python qr_cli.py read out.png

Options for `generate`:
    -o, --output FILE     Output image path (.png, .jpg, .svg) [default: qr.png]
    --fill COLOR          Module (dot) colour, name or hex [default: black]
    --back COLOR          Background colour [default: white]
    --box INT             Pixels per module [default: 10]
    --border INT          Quiet-zone size in modules [default: 4]
    --ec {L,M,Q,H}        Error-correction level [default: M]

Read decodes every QR code found in the image and prints one per line.
"""

import argparse
import sys
from pathlib import Path


def generate(args: argparse.Namespace) -> None:
    import qrcode

    try:
        qr = qrcode.QRCode(
            error_correction=getattr(
                __import__("qrcode.constants", fromlist=["x"]),
                f"ERROR_CORRECT_{args.ec}",
            ),
            box_size=args.box,
            border=args.border,
        )
        qr.add_data(args.data)
        qr.make(fit=True)

        img = qr.make_image(fill_color=args.fill, back_color=args.back)
        img.save(args.output)
    except OSError as exc:
        sys.exit(f"Error saving image: {exc}")

    print(f"✅ QR code saved as: {Path(args.output).resolve()}")


def read(args: argparse.Namespace) -> None:
    import cv2

    path = args.image
    if not Path(path).exists():
        sys.exit(f"Error: the file '{path}' was not found.")

    img = cv2.imread(str(path))
    if img is None:
        sys.exit(f"Error: could not read image '{path}'.")

    results = []

    try:
        from pyzbar.pyzbar import decode
    except ImportError:
        decode = None

    if decode is not None:
        for obj in decode(img):
            results.append(obj.data.decode("utf-8", errors="replace"))

    if not results:
        detector = cv2.QRCodeDetector()
        try:
            ok, texts, _, _ = detector.detectAndDecodeMulti(img)
        except cv2.error:
            ok, texts = False, []
        if not ok:
            text, _, _ = detector.detectAndDecode(img)
            texts = [text] if text else []
        results.extend(t for t in texts if t)

    if not results:
        sys.exit("⚠️  No QR code found in the image.")

    for data in results:
        print(f"✅ QR Code Data: {data}")


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(
        prog="qr_cli",
        description="Generate and read QR codes locally — no website, no uploads.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    gen = sub.add_parser("generate", help="Generate a QR code image")
    gen.add_argument("data", help="Link or text to encode")
    gen.add_argument("-o", "--output", default="qr.png", help="Output image path")
    gen.add_argument("--fill", default="black", help="Dot colour")
    gen.add_argument("--back", default="white", help="Background colour")
    gen.add_argument("--box", type=int, default=10, help="Pixels per module")
    gen.add_argument("--border", type=int, default=4, help="Quiet-zone modules")
    gen.add_argument("--ec", choices=["L", "M", "Q", "H"], default="M",
                     help="Error-correction level")
    gen.set_defaults(func=generate)

    rd = sub.add_parser("read", help="Decode QR code(s) in an image")
    rd.add_argument("image", help="Path to the image file")
    rd.set_defaults(func=read)

    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
