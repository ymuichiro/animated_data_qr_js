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

await Promise.all([
  build({
    ...sharedConfig,
    format: "esm",
    outfile: resolve(rootDir, "dist/animated-data-qr.esm.js")
  }),
  build({
    ...sharedConfig,
    format: "cjs",
    outfile: resolve(rootDir, "dist/animated-data-qr.cjs.js")
  }),
  build({
    ...sharedConfig,
    format: "iife",
    globalName: "AnimatedDataQR",
    outfile: resolve(rootDir, "dist/animated-data-qr.umd.js")
  }),
  build({
    ...sharedConfig,
    format: "iife",
    globalName: "AnimatedDataQR",
    minify: true,
    outfile: resolve(rootDir, "dist/animated-data-qr.umd.min.js")
  })
]);

await copyFile(
  resolve(rootDir, "src/index.d.ts"),
  resolve(rootDir, "dist/index.d.ts")
);
