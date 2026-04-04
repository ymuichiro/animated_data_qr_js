import { test, expect } from "@playwright/test";

async function stubCanvasCamera(page) {
  await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 640;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const stream = canvas.captureStream(1);
    window.__demoCameraStream = stream;
    const mediaDevices = navigator.mediaDevices || {};
    navigator.mediaDevices = {
      ...mediaDevices,
      getUserMedia: async () => stream
    };
  });
}

test("high-level sender and receiver APIs complete a file transfer", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { createQrSender, createQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderTarget = document.createElement("div");
    senderTarget.style.width = "420px";
    document.body.appendChild(senderTarget);

    const receiverTarget = document.createElement("div");
    receiverTarget.style.width = "420px";
    document.body.appendChild(receiverTarget);

    const payloadText = Array.from({ length: 120 }, (_, index) => `line-${index.toString().padStart(3, "0")}`)
      .join("\n");

    const sender = createQrSender(senderTarget, {
      frameIntervalMs: 80,
      chunkByteSize: 64,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 10
      }
    });
    const summary = await sender.loadText(payloadText, {
      fileName: "e2e-payload.txt"
    });
    await sender.start();

    const stream = sender.getState().elements.canvas.captureStream(30);
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async () => stream;

    const receiver = createQrReceiver(receiverTarget, {
      scanIntervalMs: 45,
      scanMaxDimension: 480,
      maxSymbolsPerFrame: 1,
      autoStopOnComplete: true
    });

    const completed = await receiver.start();
    const restoredText = await completed.blob.text();

    sender.stop();
    receiver.stop();
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      fileName: completed.fileName,
      mimeType: completed.mimeType,
      totalChunks: completed.totalChunks,
      summaryKind: summary.inputKind
    };
  });

  expect(result.summaryKind).toBe("text");
  expect(result.actual).toBe(result.expected);
  expect(result.fileName).toBe("e2e-payload.txt");
  expect(result.mimeType).toBe("text/plain;charset=utf-8");
  expect(result.totalChunks).toBeGreaterThan(1);
});

test("folder transfer resolves as a folder result through the high-level API", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { createQrSender, createQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderTarget = document.createElement("div");
    senderTarget.style.width = "440px";
    document.body.appendChild(senderTarget);

    const receiverTarget = document.createElement("div");
    receiverTarget.style.width = "440px";
    document.body.appendChild(receiverTarget);

    function createFolderFile(path, contents, type = "text/plain") {
      const file = new File([contents], path.split("/").pop(), { type });
      Object.defineProperty(file, "webkitRelativePath", {
        configurable: true,
        value: path
      });
      return file;
    }

    const sender = createQrSender(senderTarget, {
      frameIntervalMs: 80,
      chunkByteSize: 72,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 10
      }
    });

    const summary = await sender.loadFolder([
      createFolderFile("sample-folder/docs/readme.md", "# Folder transfer\n"),
      createFolderFile("sample-folder/src/index.js", "export const hello = 'world';\n", "text/javascript")
    ], {
      rootName: "sample-folder"
    });
    await sender.start();

    const stream = sender.getState().elements.canvas.captureStream(30);
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async () => stream;

    const receiver = createQrReceiver(receiverTarget, {
      scanIntervalMs: 45,
      scanMaxDimension: 480,
      maxSymbolsPerFrame: 1,
      autoStopOnComplete: true
    });

    const completed = await receiver.start();

    sender.stop();
    receiver.stop();
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      summaryKind: summary.inputKind,
      receiveKind: completed.kind,
      archiveFileName: completed.archiveFileName,
      rootName: completed.extracted.rootName,
      paths: completed.extracted.files.map((file) => file.path).sort(),
      fileTexts: Object.fromEntries(await Promise.all(
        completed.extracted.files.map(async (file) => [file.path, await file.blob.text()])
      ))
    };
  });

  expect(result.summaryKind).toBe("folder");
  expect(result.receiveKind).toBe("folder");
  expect(result.archiveFileName).toBe("sample-folder.sarc1");
  expect(result.rootName).toBe("sample-folder");
  expect(result.paths).toEqual([
    "docs/readme.md",
    "src/index.js"
  ]);
  expect(result.fileTexts["docs/readme.md"]).toBe("# Folder transfer\n");
  expect(result.fileTexts["src/index.js"]).toBe("export const hello = 'world';\n");
});

test("sender demo mounts and broadcasts through createQrSender", async ({ page }) => {
  await page.goto("/docs/sender/index.html");
  await page.locator("#fileInput").setInputFiles({
    name: "demo.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("sender demo payload")
  });

  await page.getByRole("button", { name: "Open QR stage" }).click();
  await expect(page.locator("#qrCanvas")).toBeVisible();
  await expect(page.locator("#statusTitle")).toHaveText(/Transfer prepared/);

  await page.getByRole("button", { name: "Start broadcast" }).click();
  await expect(page.locator("#statusTitle")).toHaveText(/Broadcast running/);
});

test("receiver demo mounts its managed video element and opens a full scan stage on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/receiver/index.html");
  await stubCanvasCamera(page);

  await page.getByRole("button", { name: "Open scan stage" }).click();
  await expect(page.locator("#video")).toBeVisible();

  const box = await page.locator(".video-frame--modal").boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThan(320);
});

test("UMD build exposes the high-level DOM API", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const script = document.createElement("script");
    script.src = "/dist/animated-data-qr.umd.min.js";
    document.head.appendChild(script);
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load UMD bundle"));
    });

    const { createQrSender, createQrReceiver } = window.AnimatedDataQR;
    const senderTarget = document.createElement("div");
    const receiverTarget = document.createElement("div");
    document.body.appendChild(senderTarget);
    document.body.appendChild(receiverTarget);

    const sender = createQrSender(senderTarget, { frameIntervalMs: 80, chunkByteSize: 64 });
    await sender.loadText("umd payload", { fileName: "umd.txt" });
    await sender.start();

    const stream = sender.getState().elements.canvas.captureStream(30);
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async () => stream;

    const receiver = createQrReceiver(receiverTarget, {
      scanIntervalMs: 45,
      scanMaxDimension: 480,
      maxSymbolsPerFrame: 1,
      autoStopOnComplete: true
    });
    const result = await receiver.start();

    sender.stop();
    receiver.stop();
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      hasCreateQrSender: typeof createQrSender === "function",
      hasCreateQrReceiver: typeof createQrReceiver === "function",
      kind: result.kind,
      fileName: result.fileName
    };
  });

  expect(result.hasCreateQrSender).toBe(true);
  expect(result.hasCreateQrReceiver).toBe(true);
  expect(result.kind).toBe("file");
  expect(result.fileName).toBe("umd.txt");
});
