# Demo Pages

GitHub Pages 公開用の静的デモです。

## Routes

- `/` : デモトップ
- `/sender` : 送信モード
- `/reciever` : 受信モード
- `/receiver` : `/reciever` へのリダイレクト

## Local Preview

```bash
npm run build:pages
node scripts/static-server.mjs --port 4173 --root site
```

ブラウザで `http://127.0.0.1:4173/` を開いて確認してください。
