import { test, expect } from "@playwright/test";

test("animated QR transfer completes in browser runtime", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { AnimatedQrSender, AnimatedQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "420px";
    document.body.appendChild(senderCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "420px";
    document.body.appendChild(receiverVideo);

    const payloadText = Array.from({ length: 120 }, (_, index) => `line-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-payload.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 80,
      chunkByteSize: 64,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 10
      }
    });

    await sender.prepare(file);
    await sender.start();

    const stream = senderCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 45,
      scanMaxDimension: 480,
      maxSymbolsPerFrame: 1,
      autoStopOnComplete: true
    });

    receiver.stream = stream;

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for transfer completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const restoredText = await completed.blob.text();

    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      fileName: completed.fileName,
      mimeType: completed.mimeType,
      totalChunks: completed.totalChunks
    };
  });

  expect(result.actual).toBe(result.expected);
  expect(result.fileName).toBe("e2e-payload.txt");
  expect(result.mimeType).toBe("text/plain");
  expect(result.totalChunks).toBeGreaterThan(1);
});

test("folder archive transfer completes and extracts in browser runtime", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const {
      AnimatedQrSender,
      AnimatedQrReceiver,
      createArchive,
      extractArchive
    } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "440px";
    document.body.appendChild(senderCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "440px";
    document.body.appendChild(receiverVideo);

    function createFolderFile(path, contents, type = "text/plain") {
      const file = new File([contents], path.split("/").pop(), { type });
      Object.defineProperty(file, "webkitRelativePath", {
        configurable: true,
        value: path
      });
      return file;
    }

    const archive = await createArchive([
      createFolderFile("sample-folder/docs/readme.md", "# Folder transfer\n"),
      createFolderFile("sample-folder/src/index.js", "export const hello = 'world';\n", "text/javascript")
    ]);

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 80,
      chunkByteSize: 72,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 10
      }
    });

    await sender.prepare(new File([archive.blob], archive.fileName, {
      type: archive.blob.type
    }));
    await sender.start();

    const stream = senderCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 45,
      scanMaxDimension: 480,
      maxSymbolsPerFrame: 1,
      autoStopOnComplete: true
    });

    receiver.stream = stream;

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for folder transfer completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const extracted = await extractArchive(completed.blob);
    const fileTexts = {};
    for (const file of extracted.files) {
      fileTexts[file.path] = await file.blob.text();
    }

    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      fileName: completed.fileName,
      mimeType: completed.mimeType,
      rootName: extracted.rootName,
      paths: extracted.files.map((file) => file.path).sort(),
      fileTexts
    };
  });

  expect(result.fileName).toBe("sample-folder.sarc1");
  expect(result.mimeType).toBe("application/vnd.animated-data-qr.sarc1");
  expect(result.rootName).toBe("sample-folder");
  expect(result.paths).toEqual([
    "docs/readme.md",
    "src/index.js"
  ]);
  expect(result.fileTexts["docs/readme.md"]).toBe("# Folder transfer\n");
  expect(result.fileTexts["src/index.js"]).toBe("export const hello = 'world';\n");
});

test("multi-QR transfer completes in browser runtime", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { AnimatedQrSender, AnimatedQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "640px";
    senderCanvas.style.height = "640px";
    document.body.appendChild(senderCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "640px";
    document.body.appendChild(receiverVideo);

    const payloadText = Array.from({ length: 400 }, (_, index) => `multi-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-multi.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 120,
      chunkByteSize: 48,
      symbolsPerFrame: 4,
      qrOptions: {
        errorCorrectionLevel: "L",
        margin: 1,
        scale: 6
      }
    });

    await sender.prepare(file);
    await sender.start();

    const stream = senderCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 80,
      autoStopOnComplete: true,
      maxSymbolsPerFrame: 4
    });

    receiver.stream = stream;

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for multi-QR transfer completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const restoredText = await completed.blob.text();

    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      fileName: completed.fileName,
      mimeType: completed.mimeType,
      totalChunks: completed.totalChunks
    };
  });

  expect(result.actual).toBe(result.expected);
  expect(result.fileName).toBe("e2e-multi.txt");
  expect(result.mimeType).toBe("text/plain");
  expect(result.totalChunks).toBeGreaterThan(1);
});

test("multi-QR transfer completes when the sender stage does not fill the camera frame", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { AnimatedQrSender, AnimatedQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "640px";
    senderCanvas.style.height = "640px";
    document.body.appendChild(senderCanvas);

    const stageCanvas = document.createElement("canvas");
    stageCanvas.width = 960;
    stageCanvas.height = 960;
    const stageContext = stageCanvas.getContext("2d");
    document.body.appendChild(stageCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "640px";
    document.body.appendChild(receiverVideo);

    const payloadText = Array.from({ length: 320 }, (_, index) => `offset-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-offset-multi.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 150,
      chunkByteSize: 48,
      symbolsPerFrame: 4,
      qrOptions: {
        errorCorrectionLevel: "L",
        margin: 1,
        scale: 6
      }
    });

    await sender.prepare(file);
    await sender.start();

    let keepDrawing = true;
    const drawStage = () => {
      if (!keepDrawing) {
        return;
      }

      stageContext.fillStyle = "#0f1623";
      stageContext.fillRect(0, 0, stageCanvas.width, stageCanvas.height);
      stageContext.fillStyle = "#d7dee8";
      stageContext.fillRect(90, 120, 780, 720);
      stageContext.drawImage(senderCanvas, 140, 170, 680, 680);
      requestAnimationFrame(drawStage);
    };
    drawStage();

    const stream = stageCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 80,
      autoStopOnComplete: true,
      maxSymbolsPerFrame: 4,
      scanMaxDimension: 720
    });

    receiver.stream = stream;

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for offset multi-QR transfer completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const restoredText = await completed.blob.text();

    keepDrawing = false;
    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      fileName: completed.fileName,
      mimeType: completed.mimeType
    };
  });

  expect(result.actual).toBe(result.expected);
  expect(result.fileName).toBe("e2e-offset-multi.txt");
  expect(result.mimeType).toBe("text/plain");
});

test("guided calibration falls back to legacy scanning when sender markers are unavailable", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { AnimatedQrSender, AnimatedQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "420px";
    senderCanvas.style.height = "420px";
    document.body.appendChild(senderCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "420px";
    document.body.appendChild(receiverVideo);

    const payloadText = Array.from({ length: 180 }, (_, index) => `plain-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-plain-stage.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      stageStyle: "plain",
      frameIntervalMs: 90,
      chunkByteSize: 64,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 10
      }
    });

    await sender.prepare(file);
    await sender.start();

    const stream = senderCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 45,
      scanMaxDimension: 480,
      maxSymbolsPerFrame: 1,
      autoStopOnComplete: true
    });

    receiver.stream = stream;

    const calibrationStates = [];
    receiver.on("calibration-state", ({ state }) => {
      calibrationStates.push(state);
    });

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for plain-stage fallback completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const restoredText = await completed.blob.text();

    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      calibrationStates
    };
  });

  expect(result.actual).toBe(result.expected);
  expect(result.calibrationStates).not.toContain("locked");
});

test("guided calibration completes under moderate perspective distortion", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    const { AnimatedQrSender, AnimatedQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "640px";
    senderCanvas.style.height = "640px";
    document.body.appendChild(senderCanvas);

    const stageCanvas = document.createElement("canvas");
    stageCanvas.width = 960;
    stageCanvas.height = 760;
    const stageContext = stageCanvas.getContext("2d");
    document.body.appendChild(stageCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "640px";
    document.body.appendChild(receiverVideo);

    const payloadText = Array.from({ length: 320 }, (_, index) => `perspective-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-perspective.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 120,
      chunkByteSize: 48,
      symbolsPerFrame: 2,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 8
      }
    });

    await sender.prepare(file);
    await sender.start();

    const corners = {
      topLeft: { x: 160, y: 78 },
      topRight: { x: 804, y: 40 },
      bottomLeft: { x: 108, y: 664 },
      bottomRight: { x: 868, y: 706 }
    };

    let keepDrawing = true;
    const drawPerspective = () => {
      if (!keepDrawing) {
        return;
      }

      stageContext.setTransform(1, 0, 0, 1, 0, 0);
      stageContext.clearRect(0, 0, stageCanvas.width, stageCanvas.height);
      stageContext.fillStyle = "#0f1623";
      stageContext.fillRect(0, 0, stageCanvas.width, stageCanvas.height);

      const sourceWidth = senderCanvas.width;
      const sourceHeight = senderCanvas.height;
      const stripHeight = 6;

      for (let sourceY = 0; sourceY < sourceHeight; sourceY += stripHeight) {
        const nextSourceY = Math.min(sourceHeight, sourceY + stripHeight);
        const t0 = sourceY / sourceHeight;
        const t1 = nextSourceY / sourceHeight;
        const leftTop = {
          x: corners.topLeft.x + ((corners.bottomLeft.x - corners.topLeft.x) * t0),
          y: corners.topLeft.y + ((corners.bottomLeft.y - corners.topLeft.y) * t0)
        };
        const rightTop = {
          x: corners.topRight.x + ((corners.bottomRight.x - corners.topRight.x) * t0),
          y: corners.topRight.y + ((corners.bottomRight.y - corners.topRight.y) * t0)
        };
        const leftBottom = {
          x: corners.topLeft.x + ((corners.bottomLeft.x - corners.topLeft.x) * t1),
          y: corners.topLeft.y + ((corners.bottomLeft.y - corners.topLeft.y) * t1)
        };

        stageContext.setTransform(
          (rightTop.x - leftTop.x) / sourceWidth,
          (rightTop.y - leftTop.y) / sourceWidth,
          (leftBottom.x - leftTop.x) / (nextSourceY - sourceY),
          (leftBottom.y - leftTop.y) / (nextSourceY - sourceY),
          leftTop.x,
          leftTop.y
        );
        stageContext.drawImage(
          senderCanvas,
          0,
          sourceY,
          sourceWidth,
          nextSourceY - sourceY,
          0,
          0,
          sourceWidth,
          nextSourceY - sourceY
        );
      }

      stageContext.setTransform(1, 0, 0, 1, 0, 0);
      requestAnimationFrame(drawPerspective);
    };
    drawPerspective();

    const stream = stageCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 80,
      autoStopOnComplete: true,
      maxSymbolsPerFrame: 2,
      scanMaxDimension: 720
    });

    receiver.stream = stream;

    const calibrationStates = [];
    receiver.on("calibration-state", ({ state }) => {
      calibrationStates.push(state);
    });

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for perspective transfer completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const restoredText = await completed.blob.text();

    keepDrawing = false;
    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      calibrationStates
    };
  });

  expect(result.actual).toBe(result.expected);
  expect(result.calibrationStates).toContain("locked");
});

test("receiver falls back to main-thread ZXing when worker startup fails", async ({ page }) => {
  await page.goto("/examples/index.html");

  const result = await page.evaluate(async () => {
    window.Worker = class ThrowingWorker {
      constructor() {
        throw new Error("worker blocked");
      }
    };

    const { AnimatedQrSender, AnimatedQrReceiver } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "420px";
    document.body.appendChild(senderCanvas);

    const receiverVideo = document.createElement("video");
    receiverVideo.autoplay = true;
    receiverVideo.muted = true;
    receiverVideo.playsInline = true;
    receiverVideo.style.width = "420px";
    document.body.appendChild(receiverVideo);

    const payloadText = Array.from({ length: 180 }, (_, index) => `fallback-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-fallback.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 90,
      chunkByteSize: 48,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 8
      }
    });

    await sender.prepare(file);
    await sender.start();

    const stream = senderCanvas.captureStream(30);
    receiverVideo.srcObject = stream;
    await receiverVideo.play();

    const receiver = new AnimatedQrReceiver({
      video: receiverVideo,
      scanIntervalMs: 60,
      autoStopOnComplete: true
    });

    const decoderModes = [];
    receiver.on("decoder-mode", ({ mode }) => {
      decoderModes.push(mode);
    });

    receiver.stream = stream;

    const completed = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for fallback transfer completion"));
      }, 25_000);

      receiver.on("complete", (resultPayload) => {
        clearTimeout(timeoutId);
        resolve(resultPayload);
      });

      receiver.on("error", ({ error }) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      receiver.start().catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const restoredText = await completed.blob.text();

    sender.stop();
    receiver.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return {
      expected: payloadText,
      actual: restoredText,
      decoderModes
    };
  });

  expect(result.actual).toBe(result.expected);
  expect(result.decoderModes).toContain("main-thread-fallback");
});

test("sender demo prepares the transfer when opening the QR stage", async ({ page }) => {
  await page.goto("/examples/sender.html");

  await expect(page.locator("#prepareBtn")).toHaveCount(0);

  await page.locator("#fileInput").setInputFiles({
    name: "demo-transfer.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("sender demo payload ".repeat(40), "utf8")
  });

  await page.locator("#openStageBtn").click();

  await expect(page.locator("#stageDialog")).toBeVisible();
  await expect(page.locator("#statusTitle")).toHaveText("Transfer prepared");

  const canvasInfo = await page.locator("#qrCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height).data ?? [];
    let darkPixels = 0;
    for (let index = 0; index < imageData.length; index += 4) {
      if (imageData[index] < 240 || imageData[index + 1] < 240 || imageData[index + 2] < 240) {
        darkPixels += 1;
      }
    }
    return {
      width: canvas.width,
      height: canvas.height,
      darkPixels
    };
  });

  expect(canvasInfo.width).toBeGreaterThan(300);
  expect(canvasInfo.height).toBeGreaterThan(150);
  expect(canvasInfo.darkPixels).toBeGreaterThan(500);
});

test("receiver demo closes the scan modal and highlights the download action on completion", async ({ page }) => {
  await page.goto("/examples/receiver.html");

  const result = await page.evaluate(async () => {
    const { AnimatedQrSender } = await import("/dist/animated-data-qr.esm.js");

    const senderCanvas = document.createElement("canvas");
    senderCanvas.style.width = "420px";
    senderCanvas.style.height = "420px";
    document.body.appendChild(senderCanvas);

    const payloadText = Array.from({ length: 160 }, (_, index) => `demo-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "receiver-demo.txt", {
      type: "text/plain"
    });

    const sender = new AnimatedQrSender({
      canvas: senderCanvas,
      frameIntervalMs: 90,
      chunkByteSize: 48,
      qrOptions: {
        errorCorrectionLevel: "M",
        margin: 1,
        scale: 8
      }
    });

    await sender.prepare(file);
    await sender.start();

    const stream = senderCanvas.captureStream(30);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => stream
      }
    });

    const completion = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timed out while waiting for receiver demo completion"));
      }, 25_000);

      const poll = () => {
        const scanDialog = document.getElementById("scanDialog");
        const downloadCard = document.getElementById("downloadCard");
        const download = document.getElementById("download");
        const statusTitle = document.getElementById("statusTitle");

        if (
          scanDialog
          && !scanDialog.open
          && downloadCard
          && !downloadCard.classList.contains("hide")
          && download
          && !download.classList.contains("hide")
        ) {
          clearTimeout(timeoutId);
          resolve({
            dialogOpen: scanDialog.open,
            downloadVisible: !download.classList.contains("hide"),
            downloadPrimary: download.classList.contains("button-primary"),
            downloadText: download.textContent,
            statusTitle: statusTitle?.textContent || ""
          });
          return;
        }

        requestAnimationFrame(poll);
      };

      poll();
    });

    document.getElementById("openScanStageBtn")?.click();
    const completionResult = await completion;

    sender.stop();
    for (const track of stream.getTracks()) {
      track.stop();
    }

    return completionResult;
  });

  expect(result.dialogOpen).toBe(false);
  expect(result.downloadVisible).toBe(true);
  expect(result.downloadPrimary).toBe(true);
  expect(result.downloadText).toContain("receiver-demo.txt");
  expect(result.statusTitle).toBe("Transfer complete");
});

test("receiver demo uses a full-width mobile scan modal", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 360;
          canvas.height = 640;
          const context = canvas.getContext("2d");
          context.fillStyle = "#05070b";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "#ffffff";
          context.fillRect(40, 120, 280, 400);
          return canvas.captureStream(30);
        }
      }
    });
  });

  await page.setViewportSize({
    width: 390,
    height: 844
  });
  await page.goto("/examples/receiver.html");

  await page.locator("#openScanStageBtn").click();

  await expect(page.locator("#scanDialog")).toBeVisible();
  await expect(page.locator("#statusTitle")).toHaveText("Scanning in progress");
  await expect(page.locator("#decoderModeText")).toContainText("Decoder:");

  const layout = await page.locator("#scanDialog").evaluate((dialog) => {
    const rect = dialog.getBoundingClientRect();
    const video = dialog.querySelector("#video");
    const frame = dialog.querySelector(".video-frame--modal");
    const videoRect = video?.getBoundingClientRect();
    const frameRect = frame?.getBoundingClientRect();
    return {
      dialogWidth: rect.width,
      dialogHeight: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      videoWidth: videoRect?.width ?? 0,
      videoHeight: videoRect?.height ?? 0,
      frameWidth: frameRect?.width ?? 0,
      frameHeight: frameRect?.height ?? 0
    };
  });

  expect(layout.dialogWidth).toBeGreaterThanOrEqual(layout.viewportWidth - 1);
  expect(layout.dialogHeight).toBeGreaterThanOrEqual(layout.viewportHeight - 1);
  expect(layout.videoWidth / layout.viewportWidth).toBeGreaterThan(0.85);
  expect(layout.frameWidth / layout.frameHeight).toBeGreaterThan(0.9);
});

test("UMD build resolves the decoder worker relative to the loaded script", async ({ page }) => {
  await page.goto("/examples/index.html");
  await page.evaluate(() => {
    document.body.innerHTML = "";
  });
  await page.addScriptTag({ url: "/dist/animated-data-qr.umd.min.js" });

  const workerUrls = await page.evaluate(async () => {
    const capturedWorkerUrls = [];
    window.Worker = class FakeWorker {
      constructor(url) {
        this.url = url;
        this.onmessage = null;
        this.onerror = null;
        capturedWorkerUrls.push(url);
      }

      postMessage(payload) {
        queueMicrotask(() => {
          if (payload.type === "warmup") {
            this.onmessage?.({
              data: {
                id: payload.id,
                type: "warmup-ready"
              }
            });
            return;
          }

          this.onmessage?.({
            data: {
              id: payload.id,
              type: "decode-result",
              frames: []
            }
          });
        });
      }

      terminate() {}
    };

    const video = document.createElement("video");
    document.body.appendChild(video);

    const receiver = new window.AnimatedDataQR.AnimatedQrReceiver({
      video,
      autoStopOnComplete: false
    });
    receiver.stream = {
      getTracks() {
        return [];
      }
    };

    await receiver.start();
    receiver.stop();
    return capturedWorkerUrls;
  });

  expect(workerUrls[0]).toContain("/dist/animated-data-qr.decoder.worker.js");
});
