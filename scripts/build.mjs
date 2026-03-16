import { mkdir, readFile, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgJsonPath = resolve(rootDir, "package.json");
const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));

const banner = `/*! ${pkg.name} v${pkg.version} | MIT */`;
const sharedConfig = {
  entryPoints: [resolve(rootDir, "src/index.js")],
  bundle: true,
  sourcemap: true,
  target: ["es2019"],
  platform: "browser",
  banner: { js: banner }
};

await mkdir(resolve(rootDir, "dist"), { recursive: true });

function getModuleUrlBanner(format) {
  if (format === "esm") {
    return `${banner}\nconst __ADQ_MODULE_URL__ = import.meta.url;`;
  }
  if (format === "iife") {
    return `${banner}\nconst __ADQ_MODULE_URL__ = (typeof document !== "undefined" && document.currentScript && document.currentScript.src) || "";`;
  }
  return `${banner}\nconst __ADQ_MODULE_URL__ = "";`;
}

await Promise.all([
  build({
    ...sharedConfig,
    format: "esm",
    banner: { js: getModuleUrlBanner("esm") },
    outfile: resolve(rootDir, "dist/animated-data-qr.esm.js")
  }),
  build({
    ...sharedConfig,
    format: "cjs",
    banner: { js: getModuleUrlBanner("cjs") },
    outfile: resolve(rootDir, "dist/animated-data-qr.cjs.js")
  }),
  build({
    ...sharedConfig,
    format: "iife",
    globalName: "AnimatedDataQR",
    banner: { js: getModuleUrlBanner("iife") },
    outfile: resolve(rootDir, "dist/animated-data-qr.umd.js")
  }),
  build({
    ...sharedConfig,
    format: "iife",
    globalName: "AnimatedDataQR",
    minify: true,
    banner: { js: getModuleUrlBanner("iife") },
    outfile: resolve(rootDir, "dist/animated-data-qr.umd.min.js")
  }),
  build({
    entryPoints: [resolve(rootDir, "src/decoder.worker.js")],
    bundle: true,
    sourcemap: true,
    target: ["es2019"],
    platform: "browser",
    format: "iife",
    banner: { js: banner },
    outfile: resolve(rootDir, "dist/animated-data-qr.decoder.worker.js")
  })
]);

await copyFile(
  resolve(rootDir, "src/index.d.ts"),
  resolve(rootDir, "dist/index.d.ts")
);

await copyFile(
  resolve(rootDir, "node_modules/zxing-wasm/dist/reader/zxing_reader.wasm"),
  resolve(rootDir, "dist/zxing_reader.wasm")
);
