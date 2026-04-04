# animated-data-qr-js

Offline browser-to-browser transfer over animated QR codes.
The package is published as a JavaScript library first. The GitHub Pages app is only a thin demo built on the same public API.

## Live Demo

- [Demo home](https://ymuichiro.github.io/animated_data_qr_js/)
- [Sender demo](https://ymuichiro.github.io/animated_data_qr_js/sender/)
- [Receiver demo](https://ymuichiro.github.io/animated_data_qr_js/receiver/)

Routes:

- `/sender`
- `/receiver`
- `/reciever` redirects to `/receiver`

## Install

```bash
npm install animated-data-qr-js
```

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/animated-data-qr-js@0.1.0/dist/animated-data-qr.umd.min.js"></script>
```

The receiver also needs these adjacent assets from the same directory:

- `animated-data-qr.decoder.worker.js`
- `zxing_reader.wasm`

## Public API

### ESM import

```js
import {
  createQrSender,
  createQrReceiver,
  resolveTransferPreset,
  estimateTransferStats,
  createArchive,
  extractArchive,
  createArchiveZipBlob,
  saveExtractedArchiveToDirectory,
  createDownloadLink
} from "animated-data-qr-js";
```

### Sender

```js
import { createQrSender, resolveTransferPreset } from "animated-data-qr-js";

const mount = document.querySelector("#sender-stage");
const sender = createQrSender(mount);
const preset = resolveTransferPreset("compatibility");

const summary = await sender.loadText("hello from animated qr", {
  fileName: "message.txt",
  chunkByteSize: preset.chunkByteSize,
  frameIntervalMs: preset.frameIntervalMs,
  payloadEncoding: preset.payloadEncoding,
  symbolsPerFrame: preset.symbolsPerFrame,
  parityBlockDataChunks: preset.parityBlockDataChunks
});

console.log(summary.totalChunks, summary.estimatedStats.loopDurationMs);
await sender.start();
```

`createQrSender(target, options?)` mounts an internal `<canvas>` into the provided container and returns a controller with:

- `loadText(text, options?)`
- `loadBytes(bytes, options?)`
- `loadBlob(blob, options?)`
- `loadFolder(fileListLike, options?)`
- `start()`
- `stop()`
- `clear()`
- `destroy()`
- `getState()`

`loadFolder()` uses the internal archive pipeline automatically.

### Receiver

```js
import {
  createQrReceiver,
  createArchiveZipBlob,
  saveExtractedArchiveToDirectory,
  createDownloadLink
} from "animated-data-qr-js";

const mount = document.querySelector("#receiver-stage");
const receiver = createQrReceiver(mount, {
  onManifest(manifest) {
    console.log(manifest.fileName, manifest.totalChunks);
  },
  onProgress(progress) {
    console.log(progress.receivedChunks, progress.totalChunks);
  }
});

const result = await receiver.start();

if (result.kind === "file") {
  const { anchor } = createDownloadLink(result);
  document.body.appendChild(anchor);
  anchor.textContent = `Download ${result.fileName}`;
} else {
  if (typeof window.showDirectoryPicker === "function") {
    const parent = await window.showDirectoryPicker();
    await saveExtractedArchiveToDirectory(result.extracted, parent);
  } else {
    const zipArtifact = await createArchiveZipBlob(result.extracted);
    const { anchor } = createDownloadLink({
      blob: zipArtifact.blob,
      fileName: zipArtifact.fileName
    });
    document.body.appendChild(anchor);
    anchor.textContent = `Download ${zipArtifact.fileName}`;
  }
}
```

`createQrReceiver(target, options?)` mounts an internal `<video>` into the provided container and returns a controller with:

- `start()`
- `stop()`
- `reset()`
- `destroy()`
- `getState()`

`start()` is Promise-first and resolves to:

- `{ kind: "file", ... }` for normal file payloads
- `{ kind: "folder", ... }` for folder transfers after automatic archive extraction

Receiver callbacks are observational only:

- `onManifest`
- `onProgress`
- `onDiagnostics`
- `onError`
- `onCameraStart`
- `onCameraStop`

## Presets and Estimates

Use `resolveTransferPreset(name)` to get a stable preset object:

- `compatibility`
- `balanced`
- `throughput`
- `resilient`

Use `estimateTransferStats(...)` to estimate chunk count, frame count, loop duration, and approximate bytes/sec.

Current preset intent:

- `compatibility`: default and most forgiving
- `balanced`: faster when two QR symbols read cleanly on the real devices in use
- `throughput`: experimental
- `resilient`: stronger parity recovery for unstable capture conditions

## Folder Transfer

Folder transfer is part of the public library API.

Flow:

1. sender receives a folder-like `FileList` or `ArrayLike<File>`
2. the library packs it into an internal `SARC1` archive
3. QR transfer carries only the archive bytes
4. receiver reconstructs the archive
5. receiver extracts it automatically before resolving `start()`
6. consumer saves the extracted folder directly or downloads a standard ZIP fallback

Security checks in the archive pipeline include:

- path sanitization with traversal rejection
- per-file, per-block, and total-size limits
- block and file SHA-256 verification during extraction
- safe subdirectory creation when restoring to a chosen directory

## Demo App

The demo pages are intentionally simpler than the library surface:

- preset-first UI
- file or folder selection
- sender and receiver stages shown in modals
- receiver auto-closes the scan stage on completion
- clear save actions for both file and folder results

The demo imports only the public wrapper API from the built package.

## Development

```bash
npm install
npx playwright install chromium
npm run build
npm test
npm run test:e2e
```

## GitHub Pages

The repository publishes Pages through `.github/workflows/deploy-pages.yml`.

- pushes to `main` build the site with Node.js `24`
- the built site is published to the `gh-pages` branch
- the generated `site/dist/` directory includes the worker and WASM assets required by the receiver

Local Pages build:

```bash
npm run build:pages
node scripts/static-server.mjs --port 4173 --root site
```

## Publishing

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
