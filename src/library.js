import { AnimatedQrSender } from "./sender.js";
import { AnimatedQrReceiver } from "./receiver.js";
import {
  createArchive,
  extractArchive,
  isArchiveBlob
} from "./archive.js";

const textEncoder = new TextEncoder();

function ensureDocument() {
  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    throw new Error("This API requires a browser-like DOM environment.");
  }
}

function isDomTarget(target) {
  return Boolean(target)
    && typeof target.appendChild === "function"
    && typeof target.removeChild === "function";
}

function assertTarget(target, label = "target") {
  if (!isDomTarget(target)) {
    throw new TypeError(`${label} must be a DOM element container.`);
  }
}

function createAbortLikeError(message) {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

function safeMimeType(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function safeFileName(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function createNamedBlobLike(blob, fileName, mimeType) {
  const resolvedType = safeMimeType(mimeType, blob?.type || "application/octet-stream");
  const resolvedName = safeFileName(fileName, blob?.name || "transfer.bin");
  if (typeof File !== "undefined") {
    return new File([blob], resolvedName, {
      type: resolvedType
    });
  }

  return {
    name: resolvedName,
    type: resolvedType,
    async arrayBuffer() {
      return blob.arrayBuffer();
    }
  };
}

function createPreparedSummary(prepared, inputKind, extras = {}) {
  return {
    inputKind,
    sessionId: prepared.sessionId,
    fileName: prepared.fileName,
    mimeType: prepared.mimeType,
    size: prepared.fileSize,
    totalChunks: prepared.totalChunks,
    totalFrames: prepared.displayFrames.length,
    symbolsPerFrame: prepared.symbolsPerFrame,
    parityBlockDataChunks: prepared.parityBlockDataChunks,
    estimatedStats: prepared.estimatedStats,
    ...extras
  };
}

function clearCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== "function") {
    return;
  }
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
}

function createManagedCanvas(target) {
  ensureDocument();
  const canvas = document.createElement("canvas");
  canvas.className = "animated-data-qr-canvas";
  canvas.style.width = "100%";
  canvas.style.display = "block";
  target.appendChild(canvas);
  return canvas;
}

function createManagedVideo(target) {
  ensureDocument();
  const video = document.createElement("video");
  video.className = "animated-data-qr-video";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.style.width = "100%";
  video.style.display = "block";
  target.appendChild(video);
  return video;
}

function createManagedScanCanvas() {
  ensureDocument();
  return document.createElement("canvas");
}

function normalizeTransferInputFromBytes(bytes, options = {}) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("bytes must be a Uint8Array.");
  }
  const mimeType = safeMimeType(options.mimeType, "application/octet-stream");
  const fileName = safeFileName(options.fileName, "transfer.bin");
  return createNamedBlobLike(new Blob([bytes], { type: mimeType }), fileName, mimeType);
}

function normalizeTransferInputFromText(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string.");
  }
  const mimeType = safeMimeType(options.mimeType, "text/plain;charset=utf-8");
  const fileName = safeFileName(options.fileName, "message.txt");
  return createNamedBlobLike(new Blob([textEncoder.encode(text)], { type: mimeType }), fileName, mimeType);
}

function normalizeTransferInputFromBlob(blob, options = {}) {
  if (!blob || typeof blob.arrayBuffer !== "function") {
    throw new TypeError("blob must be a Blob, File, or blob-like object.");
  }
  const mimeType = safeMimeType(options.mimeType, blob.type || "application/octet-stream");
  const fileName = safeFileName(options.fileName, blob.name || "transfer.bin");
  return createNamedBlobLike(blob, fileName, mimeType);
}

function createSenderState(target, canvas) {
  return {
    status: "idle",
    target,
    elements: {
      canvas
    },
    prepared: null,
    inputKind: null,
    running: false
  };
}

function createReceiverState(target, video, scanCanvas) {
  return {
    status: "idle",
    target,
    elements: {
      video,
      scanCanvas
    },
    manifest: null,
    progress: null,
    diagnostics: null,
    result: null,
    error: null,
    scanning: false,
    decoderMode: null,
    camera: null
  };
}

export function createQrSender(target, options = {}) {
  assertTarget(target);
  const canvas = createManagedCanvas(target);
  const sender = new AnimatedQrSender({
    ...options,
    canvas
  });
  const state = createSenderState(target, canvas);
  let destroyed = false;

  function assertActive() {
    if (destroyed) {
      throw new Error("This sender controller has been destroyed.");
    }
  }

  async function prepareInput(inputKind, blobLike, transferOptions = {}, extraSummary = {}) {
    assertActive();
    const prepared = await sender.prepare(blobLike, { ...options, ...transferOptions });
    state.status = "prepared";
    state.inputKind = inputKind;
    state.prepared = createPreparedSummary(prepared, inputKind, extraSummary);
    state.running = false;
    await sender.renderFrameAt(0);
    return state.prepared;
  }

  return {
    async loadText(text, loadOptions = {}) {
      const blobLike = normalizeTransferInputFromText(text, loadOptions);
      return prepareInput("text", blobLike, loadOptions);
    },

    async loadBytes(bytes, loadOptions = {}) {
      const blobLike = normalizeTransferInputFromBytes(bytes, loadOptions);
      return prepareInput("bytes", blobLike, loadOptions);
    },

    async loadBlob(blob, loadOptions = {}) {
      const blobLike = normalizeTransferInputFromBlob(blob, loadOptions);
      return prepareInput("blob", blobLike, loadOptions);
    },

    async loadFolder(inputs, loadOptions = {}) {
      assertActive();
      if (!inputs || typeof inputs.length !== "number") {
        throw new TypeError("inputs must be an ArrayLike<File>.");
      }
      const archive = await createArchive(inputs, loadOptions);
      const blobLike = createNamedBlobLike(archive.blob, archive.fileName, archive.blob.type);
      return prepareInput("folder", blobLike, loadOptions, {
        archive: archive.manifestPreview
      });
    },

    async start() {
      assertActive();
      if (!state.prepared) {
        throw new Error("No transfer is prepared. Call a load*() method first.");
      }
      await sender.start();
      state.status = "running";
      state.running = true;
    },

    stop() {
      assertActive();
      sender.stop();
      state.running = false;
      state.status = state.prepared ? "prepared" : "idle";
    },

    clear() {
      assertActive();
      sender.stop();
      sender.prepared = null;
      sender.frameIndex = 0;
      sender.loopIndex = 0;
      state.status = "idle";
      state.prepared = null;
      state.inputKind = null;
      state.running = false;
      clearCanvas(canvas);
    },

    destroy() {
      if (destroyed) {
        return;
      }
      this.clear();
      if (canvas.parentNode === target) {
        target.removeChild(canvas);
      }
      state.status = "destroyed";
      destroyed = true;
    },

    getState() {
      return {
        ...state,
        elements: { ...state.elements },
        prepared: state.prepared ? { ...state.prepared } : null
      };
    }
  };
}

export function createQrReceiver(target, options = {}) {
  assertTarget(target);
  const video = createManagedVideo(target);
  const scanCanvas = createManagedScanCanvas();
  const receiver = new AnimatedQrReceiver({
    ...options,
    video,
    scanCanvas
  });
  const state = createReceiverState(target, video, scanCanvas);
  let destroyed = false;
  let activePromise = null;
  let activeResolve = null;
  let activeReject = null;

  function assertActive() {
    if (destroyed) {
      throw new Error("This receiver controller has been destroyed.");
    }
  }

  function settlePending(error, result) {
    if (!activePromise) {
      return;
    }
    const resolve = activeResolve;
    const reject = activeReject;
    activePromise = null;
    activeResolve = null;
    activeReject = null;
    if (error) {
      reject?.(error);
      return;
    }
    resolve?.(result);
  }

  async function resolveReceiveResult(result) {
    if (await isArchiveBlob(result.blob)) {
      const extracted = await extractArchive(result.blob);
      return {
        kind: "folder",
        sessionId: result.sessionId,
        archiveBlob: result.blob,
        archiveFileName: result.fileName,
        extracted,
        totalChunks: result.totalChunks,
        receivedChunks: result.receivedChunks
      };
    }

    return {
      kind: "file",
      sessionId: result.sessionId,
      blob: result.blob,
      fileName: result.fileName,
      mimeType: result.mimeType,
      size: result.size,
      totalChunks: result.totalChunks,
      receivedChunks: result.receivedChunks
    };
  }

  receiver.on("manifest", (payload) => {
    state.manifest = payload;
    options.onManifest?.(payload);
  });

  receiver.on("progress", (payload) => {
    state.progress = payload;
    options.onProgress?.(payload);
  });

  receiver.on("diagnostics", (payload) => {
    state.diagnostics = payload;
    options.onDiagnostics?.(payload);
  });

  receiver.on("decoder-mode", (payload) => {
    state.decoderMode = payload;
  });

  receiver.on("camera-start", (payload) => {
    state.camera = payload;
    options.onCameraStart?.(payload);
  });

  receiver.on("camera-stop", (payload) => {
    options.onCameraStop?.(payload);
  });

  receiver.on("camera-tuned", (payload) => {
    state.camera = {
      ...(state.camera || {}),
      tuning: payload
    };
  });

  receiver.on("scan-start", () => {
    state.status = "scanning";
    state.scanning = true;
  });

  receiver.on("scan-stop", () => {
    if (state.status !== "completed" && state.status !== "error") {
      state.status = "stopped";
    }
    state.scanning = false;
  });

  receiver.on("error", ({ error }) => {
    state.error = error;
    state.status = "error";
    state.scanning = false;
    options.onError?.(error);
    settlePending(error instanceof Error ? error : new Error(String(error)));
  });

  receiver.on("complete", (payload) => {
    void (async () => {
      try {
        const result = await resolveReceiveResult(payload);
        state.result = result;
        state.status = "completed";
        state.scanning = false;
        settlePending(null, result);
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        state.error = normalized;
        state.status = "error";
        state.scanning = false;
        options.onError?.(normalized);
        settlePending(normalized);
      }
    })();
  });

  return {
    async start() {
      assertActive();
      if (activePromise) {
        return activePromise;
      }

      receiver.reset();
      state.status = "starting";
      state.manifest = null;
      state.progress = null;
      state.diagnostics = null;
      state.result = null;
      state.error = null;
      activePromise = new Promise((resolve, reject) => {
        activeResolve = resolve;
        activeReject = reject;
      });

      try {
        await receiver.start();
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        state.error = normalized;
        state.status = "error";
        settlePending(normalized);
      }

      return activePromise;
    },

    stop() {
      assertActive();
      receiver.stop();
      receiver.stopCamera();
      state.scanning = false;
      if (state.status !== "completed") {
        state.status = "stopped";
      }
      settlePending(createAbortLikeError("Receive stopped before completion."));
    },

    reset() {
      assertActive();
      receiver.stop();
      receiver.stopCamera();
      receiver.reset();
      state.status = "idle";
      state.manifest = null;
      state.progress = null;
      state.diagnostics = null;
      state.result = null;
      state.error = null;
      state.scanning = false;
      settlePending(createAbortLikeError("Receive reset before completion."));
    },

    destroy() {
      if (destroyed) {
        return;
      }
      this.reset();
      if (video.parentNode === target) {
        target.removeChild(video);
      }
      state.status = "destroyed";
      destroyed = true;
    },

    getState() {
      return {
        ...state,
        elements: { ...state.elements },
        manifest: state.manifest ? { ...state.manifest } : null,
        progress: state.progress ? { ...state.progress } : null,
        diagnostics: state.diagnostics ? { ...state.diagnostics } : null,
        result: state.result ? { ...state.result } : null,
        camera: state.camera ? { ...state.camera } : null,
        error: state.error ?? null
      };
    }
  };
}
