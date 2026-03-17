# Demo Pages

Static demo files for the GitHub Pages site.

The Pages demo now supports:

- single-file transfer
- folder transfer with internal archive packing
- extracted-folder save on supported browsers
- ZIP fallback download for restored folders

## Routes

- `/` : demo home
- `/sender` : sender mode
- `/reciever` : receiver mode
- `/receiver` : compatibility redirect to `/reciever`

## Local Preview

```bash
npm run build:pages
node scripts/static-server.mjs --port 4173 --root site
```

Then open `http://127.0.0.1:4173/` in the browser.

The published Pages artifact includes:

- `dist/animated-data-qr.esm.js`
- `dist/animated-data-qr.umd.min.js`
- `dist/animated-data-qr.decoder.worker.js`
- `dist/zxing_reader.wasm`
