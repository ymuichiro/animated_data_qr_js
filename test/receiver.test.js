import { describe, expect, it, vi } from "vitest";
import {
  resolveDecoderAssetBaseUrl,
  resolveDecoderWorkerUrl,
  resolveDecoderWasmUrl
} from "../src/decoder-assets.js";
import { ZxingDecoderController } from "../src/decoder-controller.js";
import { AnimatedQrReceiver } from "../src/receiver.js";

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

describe("AnimatedQrReceiver camera startup", () => {
  it("retries with simple constraints when preferred camera constraints are unavailable", async () => {
    const play = vi.fn(async () => {});
    const firstError = Object.assign(new Error("unsupported constraints"), {
      name: "OverconstrainedError"
    });
    const stream = {
      getVideoTracks() {
        return [];
      },
      getTracks() {
        return [];
      }
    };
    const getUserMedia = vi
      .fn()
      .mockRejectedValueOnce(firstError)
      .mockResolvedValueOnce(stream);

    const originalNavigator = globalThis.navigator;
    const originalWindow = globalThis.window;
    globalThis.window = { isSecureContext: true };
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        mediaDevices: {
          getUserMedia
        }
      }
    });

    try {
      const receiver = new AnimatedQrReceiver({
        video: {
          srcObject: null,
          setAttribute() {},
          play
        }
      });

      const startedStream = await receiver.startCamera({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 }
        }
      });

      expect(startedStream).toBe(stream);
      expect(getUserMedia).toHaveBeenCalledTimes(2);
      expect(getUserMedia).toHaveBeenNthCalledWith(2, {
        audio: false,
        video: true
      });
      expect(play).toHaveBeenCalledTimes(1);
    } finally {
      if (originalNavigator === undefined) {
        delete globalThis.navigator;
      } else {
        Object.defineProperty(globalThis, "navigator", {
          configurable: true,
          value: originalNavigator
        });
      }
      if (originalWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    }
  });

  it("raises a no-camera error when no video input devices exist", async () => {
    const firstError = Object.assign(new Error("invalid constraint"), {
      name: "OverconstrainedError"
    });
    const getUserMedia = vi.fn().mockRejectedValue(firstError);
    const enumerateDevices = vi.fn(async () => []);

    const originalNavigator = globalThis.navigator;
    const originalWindow = globalThis.window;
    globalThis.window = { isSecureContext: true };
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        userAgent: "test-agent",
        mediaDevices: {
          getUserMedia,
          enumerateDevices
        }
      }
    });

    try {
      const receiver = new AnimatedQrReceiver({
        video: {
          srcObject: null,
          setAttribute() {},
          play: vi.fn(async () => {})
        }
      });

      await expect(receiver.startCamera({
        audio: false,
        video: {
          facingMode: { ideal: "environment" }
        }
      })).rejects.toMatchObject({
        name: "NoCameraDevicesError",
        message: "No camera device is available on this device."
      });

      expect(getUserMedia).toHaveBeenCalledTimes(1);
      expect(enumerateDevices).toHaveBeenCalledTimes(1);
    } finally {
      if (originalNavigator === undefined) {
        delete globalThis.navigator;
      } else {
        Object.defineProperty(globalThis, "navigator", {
          configurable: true,
          value: originalNavigator
        });
      }
      if (originalWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    }
  });
});
