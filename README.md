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
- able to send either a single file or a whole folder
- sender and receiver stages shown in focused modals
- full-width mobile scan modal for the receiver camera
- extracted-folder save or ZIP fallback on the receiver for folder transfers
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
- secure folder transfer via an internal `SARC1` archive container
- folder restore as extracted files or standard ZIP fallback
- ZXing/WASM receiver decoding with worker-first execution
- automatic fallback to main-thread ZXing when a worker cannot start

## Install

```bash
npm install animated-data-qr-js
```

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/animated-data-qr-js@0.1.0/dist/animated-data-qr.umd.min.js"></script>
```

The receiver auto-loads these adjacent files from the same directory:

- `animated-data-qr.decoder.worker.js`
- `zxing_reader.wasm`

## ESM

```js
import {
  AnimatedQrSender,
  AnimatedQrReceiver,
  createArchive,
  extractArchive,
  createArchiveZipBlob,
  saveExtractedArchiveToDirectory,
  createDownloadLink
} from "animated-data-qr-js";
```

If your asset pipeline moves the worker or WASM files away from the main bundle, pass
`decoderAssetBaseUrl` when creating the receiver.

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
- `stageStyle`: `guided`

### `TRANSFER_PRESETS`

- `compatibility`: `220 bytes`, `250ms`, `EC=M`, `parityBlockDataChunks=4`
- `balanced`: `384 bytes`, `250ms`, `EC=M`, `symbolsPerFrame=2`, `parityBlockDataChunks=6`
- `throughput`: `512 bytes`, `250ms`, `EC=L`, `symbolsPerFrame=4`
- `resilient`: `220 bytes`, `250ms`, `EC=M`, `symbolsPerFrame=2`, `parityBlockDataChunks=4`

### `estimateTransferStats({ fileSize, chunkByteSize, frameIntervalMs, symbolsPerFrame })`

Returns estimated chunk count, display frames, loop duration, and approximate bytes/sec.

### `new AnimatedQrReceiver(options?)`

Main methods:

- `startCamera()`
- `start()`
- `stop()`
- `stopCamera()`
- `ingestFrameText(text)` for testing and custom inputs

Notable options:

- `scanMaxDimension`: caps the internal processing resolution used for decoding
- `decoderAssetBaseUrl`: overrides where the receiver looks for `animated-data-qr.decoder.worker.js` and `zxing_reader.wasm`
- `guidedCalibration`: enables sender-stage locking, perspective rectification, and fixed-cell decode
- `cameraOptimization`: applies supported camera constraints after `getUserMedia()`
- `preferBarcodeDetector`: deprecated and ignored
- `tileScanGridSizes`: deprecated and ignored

### `createArchive(inputs, options?)`

Builds an internal `SARC1` archive from a folder-like file list.
Use this before `sender.prepare(...)` when the user selected a folder.

### `extractArchive(archive, options?)`

Validates and extracts a received `SARC1` archive inside the browser.

### `createArchiveZipBlob(extractedArchive)`

Builds a standard ZIP fallback from extracted folder contents.

### `saveExtractedArchiveToDirectory(extractedArchive, directoryHandle, options?)`

Writes extracted files into a fresh child directory under a user-selected parent directory.
The helper never writes outside the chosen directory and avoids colliding with an existing folder name by allocating a unique subdirectory.

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
- the sender renders a guided stage frame by default so the receiver can lock onto known corner fiducials
- the sender can choose a single file or a whole folder
- folder selections are packed into an internal transfer archive before QR encoding
- the receiver starts camera scanning as soon as you open the scan stage
- the receiver scan modal shows a calibration overlay and live calibration status
- live receive progress stays inside the receiver modal while the main page remains compact
- when a single file completes, the receiver modal closes automatically and the page highlights a clear download button
- when a folder completes, the receiver extracts the internal archive in-browser and highlights either a direct folder-save action or a ZIP fallback

## Folder Transfer

Folder transfer is intentionally exposed as a browser-friendly workflow instead of asking the user to handle a custom archive manually.

- sender side: the selected folder is packed into an internal `SARC1` archive
- transfer phase: QR frames carry only the packed archive bytes
- receiver side: the browser validates and extracts the archive automatically
- user output: extracted-folder save on supported browsers, or standard ZIP download everywhere else

Security-oriented checks in the archive pipeline include:

- relative-path sanitization with traversal rejection
- per-file, per-block, and total-size limits
- block and file SHA-256 verification during extraction
- unique output subdirectory allocation when writing restored folders
- standard ZIP fallback generation only after extraction succeeds

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
- the sender can render a guided stage with deterministic QR cell placement
- the receiver uses ZXing/WASM for guided-stage rectified decode plus legacy full-frame fallback
- the receiver can optimize supported camera tracks and uses a single in-flight scan loop
- the sender rotates multi-QR placement across display frames and shifts chunk groupings across loops to avoid persistent blind spots and repeated weak pairings
- the demo presets package these tradeoffs into simple choices

Because the transport is one-way and loops continuously, transfers naturally slow down near the end: once most chunks are already captured, each successful scan is more likely to be a duplicate than a new chunk. Smaller parity blocks help reduce this tail by reconstructing one missing chunk without waiting for the exact QR to reappear in a later loop.

Current preset guidance:

- `Compatibility`: default and most forgiving, now with short parity blocks to reduce late-stage waiting
- `Balanced`: faster when two QR symbols read cleanly, with light parity recovery, but still validate on your real devices before making it your default
- `Throughput`: experimental and best suited to bright screens with newer cameras
- `Resilient`: stronger parity recovery for unstable capture conditions and long end-of-transfer tails

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

The generated `site/dist/` directory includes the main bundles plus:

- `animated-data-qr.decoder.worker.js`
- `zxing_reader.wasm`

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
