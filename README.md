# QR Maker & Reader

Generate and decode QR codes **entirely on your own machine** — no website sign-ups, no forced redirects, no tracking. Also available as a browser app (see below).

## What's here

| Path | What it is |
|---|---|
| [qr_cli.py](qr_cli.py) | Command-line tool: generate QR images (`generate`) and decode them (`read`) |
| [QRMaker.ipynb](QRMaker.ipynb) | The original Jupyter notebook workflow (still works) |
| [website/](website/) | Free web app — hostable on **Vercel** in one click, works fully client-side |

## Install

```bash
pip install -r requirements.txt
```

`opencv-python` can decode QR codes by itself; installing `pyzbar` additionally lets `read` detect more barcode types (on Windows it needs the [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)).

## Generate a QR code

```bash
python qr_cli.py generate "https://example.com" -o link.png
```

Options:

```bash
python qr_cli.py generate "Hello, world!" \
    --fill black --back white --box 10 --border 4 --ec M \
    -o hello.png
```

- `--fill` / `--back` — dot and background colours (names or hex like `#1a1a2e`)
- `--box` — pixels per module (higher = bigger, sharper image)
- `--border` — quiet-zone width in modules (4 is the QR spec minimum)
- `--ec {L,M,Q,H}` — error-correction level; `H` survives ~30% damage/covering

## Read a QR code

```bash
python qr_cli.py read link.png
# ✅ QR Code Data: https://example.com
```

Prints one line per QR code found in the image (multiple codes are supported with `pyzbar` installed).

## Web app (Vercel)

A fast, ad-free QR generator + scanner built with plain HTML/JS:

1. Push this repo to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repo.
3. Set **Root Directory** to `website` and deploy.

The app is 100% client-side — camera images and generated QRs never leave the browser, which also makes it instant and free to host on Vercel's static tier.

## License

MIT — see [LICENSE](LICENSE).
