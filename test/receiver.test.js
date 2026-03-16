import { describe, expect, it, vi } from "vitest";
import {
  resolveDecoderAssetBaseUrl,
  resolveDecoderWorkerUrl,
  resolveDecoderWasmUrl
} from "../src/decoder-assets.js";
import { ZxingDecoderController } from "../src/decoder-controller.js";

describe("decoder assets", () => {
  it("derives the asset base from the bundle url", () => {
    const assetBaseUrl = resolveDecoderAssetBaseUrl(
      null,
      "https://cdn.example.com/npm/animated-data-qr.esm.js"
    );

    expect(assetBaseUrl).toBe("https://cdn.example.com/npm/");
    expect(resolveDecoderWorkerUrl(assetBaseUrl)).toBe(
      "https://cdn.example.com/npm/animated-data-qr.decoder.worker.js"
    );
    expect(resolveDecoderWasmUrl(assetBaseUrl)).toBe(
      "https://cdn.example.com/npm/zxing_reader.wasm"
    );
  });

  it("resolves a custom asset base override", () => {
    const assetBaseUrl = resolveDecoderAssetBaseUrl(
      "./assets/qr/",
      "https://app.example.com/lib/animated-data-qr.umd.min.js"
    );

    expect(assetBaseUrl).toBe("https://app.example.com/lib/assets/qr/");
  });
});

describe("ZxingDecoderController", () => {
  it("falls back to the main thread when worker startup fails", async () => {
    const warmupDecoder = vi.fn(async () => {});
    const decodeOnMainThread = vi.fn(async () => [new Uint8Array([65, 68, 81, 82, 49])]);
    const controller = new ZxingDecoderController({
      decoderAssetBaseUrl: "https://cdn.example.com/npm/",
      workerFactory: class ThrowingWorker {
        constructor() {
          throw new Error("worker blocked");
        }
      },
      warmupDecoder,
      decodeOnMainThread
    });

    const result = await controller.decodeImageData(
      {
        data: new Uint8ClampedArray([255, 255, 255, 255]),
        width: 1,
        height: 1
      },
      [{ x: 0, y: 0, width: 1, height: 1, tryHarder: false }],
      1
    );

    expect(result.mode).toBe("main-thread-fallback");
    expect(result.modeChanged).toBe(true);
    expect(result.reason?.message).toContain("worker blocked");
    expect(warmupDecoder).toHaveBeenCalledTimes(1);
    expect(warmupDecoder).toHaveBeenCalledWith("https://cdn.example.com/npm/zxing_reader.wasm");
    expect(decodeOnMainThread).toHaveBeenCalledTimes(1);
    expect(result.frameInputs).toHaveLength(1);
  });
});
