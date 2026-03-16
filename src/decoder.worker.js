import { resolveDecoderAssetBaseUrl, resolveDecoderWasmUrl } from "./decoder-assets.js";
import { createImageDataFromBuffer } from "./image-data.js";
import { warmupZxingDecoder, decodeImageDataWithZxing } from "./zxing-decoder.js";

function postDecoderError(id, error) {
  self.postMessage({
    id,
    type: "decoder-error",
    message: error instanceof Error ? error.message : String(error)
  });
}

self.onmessage = async (event) => {
  const payload = event.data ?? {};
  const assetBaseUrl = resolveDecoderAssetBaseUrl(
    payload.assetBaseUrl ?? null,
    self.location?.href || ""
  );
  const wasmUrl = payload.wasmUrl || resolveDecoderWasmUrl(assetBaseUrl);

  try {
    if (payload.type === "warmup") {
      await warmupZxingDecoder(wasmUrl);
      self.postMessage({
        id: payload.id,
        type: "warmup-ready"
      });
      return;
    }

    if (payload.type === "decode") {
      const imageData = createImageDataFromBuffer(payload.buffer, payload.width, payload.height);
      const frameInputs = await decodeImageDataWithZxing(imageData, {
        wasmUrl,
        passes: payload.passes ?? [],
        expectedSymbolsPerFrame: payload.expectedSymbolsPerFrame ?? 1
      });
      const frameBuffers = frameInputs.map((frameInput) => frameInput.buffer.slice(0));
      self.postMessage({
        id: payload.id,
        type: "decode-result",
        frames: frameBuffers
      }, frameBuffers);
    }
  } catch (error) {
    postDecoderError(payload.id, error);
  }
};
