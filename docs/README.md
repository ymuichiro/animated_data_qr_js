# Demo Pages

Static demo files for the GitHub Pages site.

The Pages site is the public demo for the `animated-data-qr-js` library. It demonstrates browser-to-browser transfer over animated QR codes for:

- text and binary payloads
- single-file transfer
- folder transfer with internal archive packing and extracted restore on the receiver

The Pages demo now supports:

- single-file transfer
- folder transfer with internal archive packing
- extracted-folder save on supported browsers
- ZIP fallback download for restored folders

## Routes

- `/` : demo home
- `/sender` : sender mode
- `/receiver` : receiver mode
- `/reciever` : compatibility redirect to `/receiver`

## Local Preview

```bash
npm run build:pages
node scripts/static-server.mjs --port 4173 --root site
```

Then open `http://127.0.0.1:4173/` in the browser.

The demo pages import the built SDK from `site/dist/` and are intended to validate the public library API, not a parallel app-only implementation.

The published Pages artifact includes:

- `dist/animated-data-qr.esm.js`
- `dist/animated-data-qr.umd.min.js`
- `dist/animated-data-qr.decoder.worker.js`
- `dist/zxing_reader.wasm`
