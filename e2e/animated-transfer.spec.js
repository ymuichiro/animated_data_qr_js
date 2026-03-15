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

    const payloadText = Array.from({ length: 200 }, (_, index) => `line-${index.toString().padStart(3, "0")}`)
      .join("\n");
    const file = new File([payloadText], "e2e-payload.txt", {
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
      autoStopOnComplete: true,
      preferBarcodeDetector: false
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
