# Demo Pages

Static demo files for the GitHub Pages site.

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
