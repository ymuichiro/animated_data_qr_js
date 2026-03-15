import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = process.cwd();
const siteDir = resolve(rootDir, "site");

await rm(siteDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });
await cp(resolve(rootDir, "docs"), siteDir, { recursive: true });

await mkdir(resolve(siteDir, "dist"), { recursive: true });
await copyFile(
  resolve(rootDir, "dist/animated-data-qr.esm.js"),
  resolve(siteDir, "dist/animated-data-qr.esm.js")
);
await copyFile(
  resolve(rootDir, "dist/animated-data-qr.umd.min.js"),
  resolve(siteDir, "dist/animated-data-qr.umd.min.js")
);

console.log("GitHub Pages artifact generated at ./site");
