import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

function parseArgs(argv) {
  const args = {
    port: 4173,
    root: "."
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--port") {
      args.port = Number.parseInt(argv[index + 1], 10);
      index += 1;
    } else if (token === "--root") {
      args.root = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function contentTypeByExt(pathname) {
  const ext = extname(pathname).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
    case ".mjs":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".map":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

const { port, root } = parseArgs(process.argv.slice(2));
const rootDir = resolve(process.cwd(), root);

const server = createServer(async (req, res) => {
  try {
    const requestPath = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
    const safePath = normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
    let filePath = resolve(rootDir, `.${safePath}`);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    let fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, "index.html");
      fileStat = await stat(filePath);
    }

    res.writeHead(200, {
      "Content-Type": contentTypeByExt(filePath),
      "Content-Length": fileStat.size
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Not Found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static server: http://127.0.0.1:${port}`);
});
