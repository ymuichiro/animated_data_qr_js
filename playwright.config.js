import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true
  },
  webServer: {
    command: "node scripts/static-server.mjs --port 4173 --root .",
    url: "http://127.0.0.1:4173/examples/index.html",
    reuseExistingServer: true,
    timeout: 30_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium"
      }
    }
  ]
});
