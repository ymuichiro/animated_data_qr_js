import {
  resolveDecoderAssetBaseUrl,
  resolveDecoderWorkerUrl,
  resolveDecoderWasmUrl
} from "./decoder-assets.js";
import { warmupZxingDecoder, decodeImageDataWithZxing } from "./zxing-decoder.js";

function normalizeError(error) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

export class ZxingDecoderController {
  constructor(options = {}) {
    this.decoderAssetBaseUrl = resolveDecoderAssetBaseUrl(
      options.decoderAssetBaseUrl ?? null,
      options.moduleUrl
    );
    this.workerUrl = resolveDecoderWorkerUrl(this.decoderAssetBaseUrl);
    this.wasmUrl = resolveDecoderWasmUrl(this.decoderAssetBaseUrl);
    this.workerFactory = options.workerFactory ?? (typeof Worker === "function" ? Worker : null);
    this.warmupDecoder = options.warmupDecoder ?? warmupZxingDecoder;
    this.decodeOnMainThread = options.decodeOnMainThread ?? decodeImageDataWithZxing;

    this.mode = "uninitialized";
    this.worker = null;
    this.preparePromise = null;
    this.pendingRequests = new Map();
    this.requestId = 0;
  }

  async prepare() {
    if (!this.preparePromise) {
      this.preparePromise = this.#prepareInternal();
    }
    return this.preparePromise;
  }

  async decodeImageData(imageData, passes, expectedSymbolsPerFrame) {
    const preparation = await this.prepare();
    let modeChanged = preparation.modeChanged;
    let reason = preparation.reason ?? null;

    if (this.mode === "worker" && this.worker) {
      try {
        const frameInputs = await this.#decodeWithWorker(imageData, passes, expectedSymbolsPerFrame);
        return {
          frameInputs,
          mode: this.mode,
          modeChanged,
          reason
        };
      } catch (error) {
        const fallback = await this.#fallbackToMainThread(error);
        modeChanged = modeChanged || fallback.modeChanged;
        reason = fallback.reason;
      }
    }

    const frameInputs = await this.decodeOnMainThread(imageData, {
      wasmUrl: this.wasmUrl,
      passes,
      expectedSymbolsPerFrame
    });

    return {
      frameInputs,
      mode: this.mode,
      modeChanged,
      reason
    };
  }

  destroy() {
    for (const pending of this.pendingRequests.values()) {
      pending.reject(new Error("Decoder worker was destroyed"));
    }
    this.pendingRequests.clear();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.mode = "uninitialized";
    this.preparePromise = null;
  }

  async #prepareInternal() {
    if (this.workerFactory && this.workerUrl) {
      try {
        await this.#startWorker();
        this.mode = "worker";
        return {
          mode: this.mode,
          modeChanged: true,
          reason: null
        };
      } catch (error) {
        return this.#fallbackToMainThread(error);
      }
    }

    return this.#fallbackToMainThread(new Error("Worker is not available in this environment"));
  }

  async #fallbackToMainThread(error) {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    for (const pending of this.pendingRequests.values()) {
      pending.reject(normalizeError(error));
    }
    this.pendingRequests.clear();

    await this.warmupDecoder(this.wasmUrl);
    const modeChanged = this.mode !== "main-thread-fallback";
    this.mode = "main-thread-fallback";
    return {
      mode: this.mode,
      modeChanged,
      reason: error ? normalizeError(error) : null
    };
  }

  async #startWorker() {
    this.worker = new this.workerFactory(this.workerUrl);
    this.worker.onmessage = (event) => {
      const payload = event.data ?? {};
      const pending = this.pendingRequests.get(payload.id);
      if (!pending) {
        return;
      }
      this.pendingRequests.delete(payload.id);

      if (payload.type === "decoder-error") {
        pending.reject(new Error(payload.message || "Decoder worker error"));
        return;
      }

      pending.resolve(payload);
    };
    this.worker.onerror = (event) => {
      const message = event?.message || "Decoder worker failed";
      for (const pending of this.pendingRequests.values()) {
        pending.reject(new Error(message));
      }
      this.pendingRequests.clear();
    };

    await this.#postToWorker({
      type: "warmup",
      wasmUrl: this.wasmUrl
    });
  }

  async #decodeWithWorker(imageData, passes, expectedSymbolsPerFrame) {
    const sourceBuffer = imageData.data.slice().buffer;
    const response = await this.#postToWorker(
      {
        type: "decode",
        wasmUrl: this.wasmUrl,
        width: imageData.width,
        height: imageData.height,
        passes,
        expectedSymbolsPerFrame,
        buffer: sourceBuffer
      },
      [sourceBuffer]
    );

    return Array.isArray(response.frames)
      ? response.frames.map((buffer) => new Uint8Array(buffer))
      : [];
  }

  #postToWorker(payload, transfer = []) {
    if (!this.worker) {
      return Promise.reject(new Error("Decoder worker is not available"));
    }

    const id = ++this.requestId;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({ ...payload, id }, transfer);
    });
  }
}
