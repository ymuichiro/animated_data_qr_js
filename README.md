# animated-data-qr-js

ブラウザ間でファイルをオフライン転送する JavaScript ライブラリです。  
送信側はファイルを分割して animated QR を表示し、受信側はカメラ読み取りで復元します。

## Demo (GitHub Pages)

GitHub Pages で以下のルートを公開できます。

- `/sender` : 送信モード
- `/reciever` : 受信モード
- `/receiver` : `/reciever` への互換リダイレクト

公開 URL 例:

- `https://<your-github-username>.github.io/animated_data_qr_js/`
- `https://<your-github-username>.github.io/animated_data_qr_js/sender/`
- `https://<your-github-username>.github.io/animated_data_qr_js/reciever/`

Pages 用ファイルは [`docs/`](./docs) にあります。

## Features

- サーバー不要
- WebRTC / WebSocket 不要
- 光学的な一方向転送のみ
- npm / jsDelivr / UMD / ESM で利用可能

## Install

```bash
npm install animated-data-qr-js
```

## CDN (jsDelivr)

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

## API

### `createTransferFrames(fileLike, options?)`

ファイルから転送フレーム列（manifest + chunk）を生成します。

### `new AnimatedQrSender(options?)`

- `prepare(fileLike, options?)`
- `start()`
- `stop()`
- `renderFrameAt(index)`

### `new AnimatedQrReceiver(options?)`

- `startCamera()`
- `start()`
- `stop()`
- `stopCamera()`
- `ingestFrameText(text)`（テスト/独自入力向け）

### `createDownloadLink(result, anchorElement?)`

受信完了結果からダウンロードリンクを作成します。

## Development

```bash
npm install
npx playwright install chromium
npm test
npm run test:e2e
npm run build
```

## GitHub Pages Deploy

このリポジトリには GitHub Actions ワークフロー  
[`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) を含めています。

`main` ブランチへの push または manual dispatch で Pages を自動デプロイします。

ローカルで Pages artifact を作る場合:

```bash
npm run build:pages
node scripts/static-server.mjs --port 4173 --root site
```

## Publishing (npm)

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
- Issues: `https://github.com/ymuichiro/animated_data_qr_js/issues`
