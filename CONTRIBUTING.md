# Contributing

このプロジェクトへの貢献を歓迎します。

## 開発環境

```bash
npm install
npx playwright install chromium
```

## 主要コマンド

```bash
npm test
npm run test:e2e
npm run build
npm run build:pages
```

## Pull Request ガイドライン

1. 変更内容に対応するテストを追加または更新してください。
2. `npm test` と `npm run test:e2e` が通る状態で提出してください。
3. 破壊的変更は PR 説明に明記してください。
4. 仕様変更時は README と docs も更新してください。

## バグ報告

GitHub Issues で再現手順・期待結果・実際結果・実行環境を記載してください。
