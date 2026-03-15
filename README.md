# animated-data-qr-js

A JavaScript library for fully offline browser-to-browser file transfer over animated QR codes.
The sender splits a file into chunks, renders them as a looping QR sequence, and the receiver reconstructs the file from camera scans in the browser.

## Live Demo

GitHub Pages is published here:

- [Demo home](https://ymuichiro.github.io/animated_data_qr_js/)
- [Sender demo](https://ymuichiro.github.io/animated_data_qr_js/sender/)
- [Receiver demo](https://ymuichiro.github.io/animated_data_qr_js/reciever/)

Demo routes:

- `/sender`: sender mode
- `/reciever`: receiver mode
- `/receiver`: compatibility redirect to `/reciever`

The current demo UI is designed to be:

- preset-first, with low-level transfer tuning hidden by default
- mobile-friendly and responsive
- easy to operate during live demos
- sender and receiver stages shown in focused modals
- full-width mobile scan modal for the receiver camera
- suitable for GitHub Pages hosting

GitHub Pages source files live in [`docs/`](./docs).

## Features

- fully offline optical one-way transfer
- no server upload
- no WebRTC, WebSocket, Bluetooth, or direct network transport
- browser-only sender and receiver flows
- npm, jsDelivr, UMD, and ESM distribution
- default frame interval of `250ms`
- default `binary` payload encoding
- multi-symbol transfer with `symbolsPerFrame`
- XOR parity recovery with `parityBlockDataChunks`

## Install

```bash
npm install animated-data-qr-js
```

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/animated-data-qr-js@0.1.0/dist/animated-data-qr.umd.min.js"></script>
```

## ESM

```js
import {
  AnimatedQrSender,
  AnimatedQrReceiver,
  createDownloadLink
} from "animated-data-qr-js";
```

## Core API

### `createTransferFrames(fileLike, options?)`

Builds the transfer frame sequence for a file, including the manifest and chunk frames.

### `new AnimatedQrSender(options?)`

Main methods:

- `prepare(fileLike, options?)`
- `start()`
- `stop()`
- `renderFrameAt(index)`

Important defaults:

- `frameIntervalMs`: `250`
- `chunkByteSize`: `220`
- `payloadEncoding`: `binary`
- `symbolsPerFrame`: `1`

### `TRANSFER_PRESETS`

- `compatibility`: `220 bytes`, `250ms`, `EC=M`
- `balanced`: `384 bytes`, `250ms`, `EC=M`, `symbolsPerFrame=2`
- `throughput`: `512 bytes`, `250ms`, `EC=L`, `symbolsPerFrame=4`
- `resilient`: `220 bytes`, `250ms`, `EC=M`, `symbolsPerFrame=2`, `parityBlockDataChunks=8`

### `estimateTransferStats({ fileSize, chunkByteSize, frameIntervalMs, symbolsPerFrame })`

Returns estimated chunk count, display frames, loop duration, and approximate bytes/sec.

### `new AnimatedQrReceiver(options?)`

Main methods:

- `startCamera()`
- `start()`
- `stop()`
- `stopCamera()`
- `ingestFrameText(text)` for testing and custom inputs

### `createDownloadLink(result, anchorElement?)`

Creates a download link from a completed receive result.

## Demo UX

The sample app intentionally exposes only a preset selector.
Chunk size, frame interval, QR density, and parity behavior are derived from the selected preset so that the public demo stays approachable.

Each preset shows supplemental guidance in the UI:

- what kind of environment it fits
- how aggressively it pushes throughput
- how much recovery protection it applies

The sender and receiver pages also include a help button that explains the operational flow in the browser.

Current demo flow:

- the sender prepares the transfer automatically when you open the QR stage
- the receiver starts camera scanning as soon as you open the scan stage
- live receive progress stays inside the receiver modal while the main page remains compact

## Transfer Tuning

Large files can still take significant time because the transport is strictly optical and one-way.
The biggest performance levers, in order, are:

1. increase payload per display frame
2. avoid Base64 inflation by using binary payloads
3. reduce QR error correction where the environment allows it
4. show multiple QR symbols per frame
5. add parity or stronger FEC so missed reads do not require extra loops

This library already applies several of these improvements:

- `binary` payload is the default
- `symbolsPerFrame` supports multi-QR transfer
- `parityBlockDataChunks` adds XOR parity recovery
- the demo presets package these tradeoffs into simple choices

## Development

```bash
npm install
npx playwright install chromium
npm test
npm run test:e2e
npm run build
```

## GitHub Pages Deploy

The repository includes [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml).

- pushes to `main` deploy GitHub Pages automatically
- the workflow builds with Node.js `24`
- the built site is published to the `gh-pages` branch
- this avoids the deprecated Pages artifact actions that were emitting Node 20 warnings

To build the Pages artifact locally:

```bash
npm run build:pages
node scripts/static-server.mjs --port 4173 --root site
```

## Publishing to npm

```bash
npm run build
npm test
npm publish --access public
```

## OSS Information

- License: [MIT](./LICENSE)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Security Policy: [SECURITY.md](./SECURITY.md)
- Issues: [GitHub Issues](https://github.com/ymuichiro/animated_data_qr_js/issues)
