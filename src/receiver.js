import { concatChunks } from "./utils/chunk.js";
import { parseFrame } from "./protocol.js";
import { SimpleEmitter } from "./emitter.js";
import { buildDecodePasses } from "./decoder-passes.js";
import { ZxingDecoderController } from "./decoder-controller.js";
import { optimizeCameraTrack } from "./camera-optimization.js";

function constrainScanSize(width, height, maxDimension) {
  if (!Number.isInteger(maxDimension) || maxDimension <= 0) {
    return { width, height };
  }

  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function createSession(sessionId, totalChunks) {
  return {
    sessionId,
    totalChunks,
    chunkByteSize: null,
    symbolsPerFrame: 1,
    parityBlockDataChunks: 0,
    fileSize: null,
    mimeType: "application/octet-stream",
    fileName: `transfer-${sessionId}.bin`,
    chunks: new Array(totalChunks).fill(null),
    parityChunks: new Map(),
    receivedChunks: 0,
    manifestReceived: false,
    completed: false
  };
}

function createProgressPayload(session) {
  const ratio = session.totalChunks > 0
    ? session.receivedChunks / session.totalChunks
    : 0;
  return {
    sessionId: session.sessionId,
    receivedChunks: session.receivedChunks,
    totalChunks: session.totalChunks,
    ratio
  };
}

function getFrameKey(frame) {
  if (!frame) {
    return "unknown";
  }
  if (frame.type === "manifest") {
    return `M:${frame.sessionId}`;
  }
  if (frame.type === "chunk") {
    return `C:${frame.sessionId}:${frame.chunkIndex}`;
  }
  if (frame.type === "parity") {
    return `P:${frame.sessionId}:${frame.blockStartChunkIndex}`;
  }
  return "unknown";
}

function recoverParityChunk(session, blockStartChunkIndex) {
  if (!session.parityBlockDataChunks || !session.parityChunks.has(blockStartChunkIndex)) {
    return null;
  }

  const blockEndChunkIndex = Math.min(
    session.totalChunks,
    blockStartChunkIndex + session.parityBlockDataChunks
  );
  let missingChunkIndex = null;
  let missingCount = 0;

  for (let chunkIndex = blockStartChunkIndex; chunkIndex < blockEndChunkIndex; chunkIndex += 1) {
    if (session.chunks[chunkIndex] === null) {
      missingChunkIndex = chunkIndex;
      missingCount += 1;
      if (missingCount > 1) {
        return null;
      }
    }
  }

  if (missingChunkIndex === null || missingCount !== 1 || !session.chunkByteSize) {
    return null;
  }

  const parityBytes = session.parityChunks.get(blockStartChunkIndex);
  const recoveredChunk = parityBytes.slice();
  for (let chunkIndex = blockStartChunkIndex; chunkIndex < blockEndChunkIndex; chunkIndex += 1) {
    if (chunkIndex === missingChunkIndex) {
      continue;
    }
    const chunkBytes = session.chunks[chunkIndex];
    for (let index = 0; index < chunkBytes.length; index += 1) {
      recoveredChunk[index] ^= chunkBytes[index];
    }
  }

  const isLastChunk = missingChunkIndex === session.totalChunks - 1;
  const chunkLength = isLastChunk && Number.isInteger(session.fileSize)
    ? session.fileSize - (missingChunkIndex * session.chunkByteSize)
    : session.chunkByteSize;

  return {
    chunkIndex: missingChunkIndex,
    chunkBytes: recoveredChunk.slice(0, chunkLength)
  };
}

export function createDownloadLink(result, anchorElement = null) {
  const url = URL.createObjectURL(result.blob);
  if (!anchorElement && typeof document === "undefined") {
    throw new Error("createDownloadLink requires document when anchorElement is not provided");
  }
  const anchor = anchorElement ?? document.createElement("a");
  anchor.href = url;
  anchor.download = result.fileName;
  return { url, anchor };
}

export class AnimatedQrReceiver extends SimpleEmitter {
  constructor(options = {}) {
    super();
    this.video = options.video ?? null;
    this.scanIntervalMs = options.scanIntervalMs ?? 120;
    this.autoStopOnComplete = options.autoStopOnComplete ?? true;
    this.preferBarcodeDetector = options.preferBarcodeDetector ?? true;
    this.maxSymbolsPerFrame = options.maxSymbolsPerFrame ?? 4;
    this.scanMaxDimension = options.scanMaxDimension ?? 960;
    this.tileScanGridSizes = Array.isArray(options.tileScanGridSizes)
      ? Array.from(new Set(options.tileScanGridSizes))
      : [2, 3];
    this.decoderAssetBaseUrl = options.decoderAssetBaseUrl ?? null;
    this.cameraOptimization = options.cameraOptimization ?? true;
    this.cameraConstraints = options.cameraConstraints ?? {
      audio: false,
      video: {
        facingMode: "environment"
      }
    };

    this.sessions = new Map();
    this.stream = null;
    this.scanning = false;
    this.scanTimer = null;
    this.scanInFlight = false;
    this.videoFrameRequestId = null;

    this.scanCanvas = options.scanCanvas ?? (
      typeof document !== "undefined" ? document.createElement("canvas") : null
    );
    this.scanContext = this.scanCanvas?.getContext("2d", { willReadFrequently: true }) ?? null;
    this.decoder = new ZxingDecoderController({
      decoderAssetBaseUrl: this.decoderAssetBaseUrl
    });
  }

  setVideo(videoElement) {
    this.video = videoElement;
  }

  async startCamera(constraints = this.cameraConstraints) {
    if (!this.video) {
      throw new Error("No video element configured. Pass { video } or call setVideo().");
    }
    if (
      typeof navigator === "undefined"
      || !navigator.mediaDevices
      || typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      throw new Error("Camera API is not available in this browser");
    }

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
    this.video.setAttribute("playsinline", "true");
    await this.video.play();

    if (this.cameraOptimization) {
      const [videoTrack] = this.stream.getVideoTracks();
      const optimization = await optimizeCameraTrack(videoTrack, {
        preferredWidth: 1280,
        preferredHeight: 720,
        preferredFrameRate: 30,
        maxFrameRate: 30
      });
      this.emit("camera-tuned", optimization);
    }

    this.emit("camera-start", { stream: this.stream });
    return this.stream;
  }

  stopCamera() {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.emit("camera-stop", {});
  }

  async start(constraints = undefined) {
    if (!this.video) {
      throw new Error("No video element configured. Pass { video } or call setVideo().");
    }

    if (this.scanning) {
      return;
    }

    const cameraPromise = this.stream
      ? Promise.resolve(this.stream)
      : this.startCamera(constraints ?? this.cameraConstraints);
    const decoderPromise = this.decoder.prepare();
    const [, decoderState] = await Promise.all([cameraPromise, decoderPromise]);
    this.#emitDecoderMode(decoderState, true);

    this.scanning = true;
    this.emit("scan-start", {});
    this.#scheduleNextScan();
  }

  stop() {
    this.scanning = false;
    this.scanInFlight = false;
    this.#cancelScheduledScan();
    this.emit("scan-stop", {});
  }

  reset(sessionId = null) {
    if (sessionId === null) {
      this.sessions.clear();
      return;
    }
    this.sessions.delete(sessionId);
  }

  getProgress(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? createProgressPayload(session) : null;
  }

  ingestFrame(frameInput) {
    const frame = parseFrame(frameInput);
    if (!frame || !frame.sessionId) {
      return { accepted: false, frame: null, result: null };
    }

    let session = this.sessions.get(frame.sessionId);
    if (!session) {
      session = createSession(frame.sessionId, frame.totalChunks);
      this.sessions.set(frame.sessionId, session);
    }

    if (frame.type === "manifest") {
      if (session.totalChunks !== frame.totalChunks) {
        if (session.receivedChunks === 0) {
          session.totalChunks = frame.totalChunks;
          session.chunks = new Array(frame.totalChunks).fill(null);
        } else {
          return { accepted: false, frame, result: null };
        }
      }
      session.chunkByteSize = frame.chunkByteSize;
      session.symbolsPerFrame = frame.symbolsPerFrame ?? 1;
      session.parityBlockDataChunks = frame.parityBlockDataChunks ?? 0;
      session.fileSize = frame.fileSize;
      session.mimeType = frame.mimeType;
      session.fileName = frame.fileName;
      session.manifestReceived = true;
      this.emit("manifest", {
        sessionId: session.sessionId,
        fileName: session.fileName,
        mimeType: session.mimeType,
        fileSize: session.fileSize,
        chunkByteSize: session.chunkByteSize,
        symbolsPerFrame: session.symbolsPerFrame,
        parityBlockDataChunks: session.parityBlockDataChunks,
        totalChunks: session.totalChunks
      });
    } else if (frame.type === "chunk") {
      if (frame.totalChunks !== session.totalChunks || frame.chunkIndex >= session.totalChunks) {
        return { accepted: false, frame, result: null };
      }
      if (session.chunks[frame.chunkIndex] === null) {
        session.chunks[frame.chunkIndex] = frame.dataBytes;
        session.receivedChunks += 1;
        this.emit("chunk", {
          sessionId: session.sessionId,
          chunkIndex: frame.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      }
    } else if (frame.type === "parity") {
      if (frame.totalChunks !== session.totalChunks) {
        return { accepted: false, frame, result: null };
      }
      if (!session.parityChunks.has(frame.blockStartChunkIndex)) {
        session.parityChunks.set(frame.blockStartChunkIndex, frame.dataBytes);
      }
      const recoveredFromParity = recoverParityChunk(session, frame.blockStartChunkIndex);
      if (recoveredFromParity && session.chunks[recoveredFromParity.chunkIndex] === null) {
        session.chunks[recoveredFromParity.chunkIndex] = recoveredFromParity.chunkBytes;
        session.receivedChunks += 1;
        this.emit("recover", {
          sessionId: session.sessionId,
          chunkIndex: recoveredFromParity.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      }
    }

    if (frame.type === "chunk" && session.parityBlockDataChunks > 0) {
      const blockStartChunkIndex = frame.chunkIndex - (frame.chunkIndex % session.parityBlockDataChunks);
      const recoveredFromChunk = recoverParityChunk(session, blockStartChunkIndex);
      if (recoveredFromChunk && session.chunks[recoveredFromChunk.chunkIndex] === null) {
        session.chunks[recoveredFromChunk.chunkIndex] = recoveredFromChunk.chunkBytes;
        session.receivedChunks += 1;
        this.emit("recover", {
          sessionId: session.sessionId,
          chunkIndex: recoveredFromChunk.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      }
    }

    const progress = createProgressPayload(session);
    this.emit("progress", progress);

    if (!session.completed && session.manifestReceived && session.receivedChunks === session.totalChunks) {
      const allChunks = session.chunks.every((value) => value instanceof Uint8Array);
      if (!allChunks) {
        return { accepted: true, frame, result: null };
      }

      const bytes = concatChunks(
        session.chunks,
        Number.isInteger(session.fileSize) ? session.fileSize : null
      );
      const blob = new Blob([bytes], { type: session.mimeType });
      const result = {
        sessionId: session.sessionId,
        blob,
        fileName: session.fileName,
        mimeType: session.mimeType,
        size: blob.size,
        totalChunks: session.totalChunks,
        receivedChunks: session.receivedChunks
      };

      session.completed = true;
      this.emit("complete", result);

      if (this.autoStopOnComplete) {
        this.stop();
      }

      return { accepted: true, frame, result };
    }

    return { accepted: true, frame, result: null };
  }

  ingestFrameText(frameInput) {
    return this.ingestFrame(frameInput);
  }

  #cancelScheduledScan() {
    if (this.scanTimer !== null) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    if (
      this.videoFrameRequestId !== null
      && this.video
      && typeof this.video.cancelVideoFrameCallback === "function"
    ) {
      this.video.cancelVideoFrameCallback(this.videoFrameRequestId);
      this.videoFrameRequestId = null;
    }
  }

  #scheduleNextScan() {
    if (!this.scanning || !this.video) {
      return;
    }

    this.#cancelScheduledScan();
    if (typeof this.video.requestVideoFrameCallback === "function") {
      this.videoFrameRequestId = this.video.requestVideoFrameCallback(() => {
        this.videoFrameRequestId = null;
        void this.#processScanFrame();
      });
      return;
    }

    this.scanTimer = setTimeout(() => {
      this.scanTimer = null;
      void this.#processScanFrame();
    }, this.scanIntervalMs);
  }

  async #processScanFrame() {
    if (!this.scanning) {
      return;
    }
    if (this.scanInFlight) {
      this.#scheduleNextScan();
      return;
    }

    this.scanInFlight = true;
    try {
      const frameInputs = await this.#readFrameInputs();
      for (const frameInput of frameInputs) {
        this.ingestFrame(frameInput);
      }
    } catch (error) {
      this.emit("error", { error });
    } finally {
      this.scanInFlight = false;
      if (this.scanning) {
        this.#scheduleNextScan();
      }
    }
  }

  #getExpectedSymbolsPerFrame() {
    let expectedSymbolsPerFrame = 1;
    for (const session of this.sessions.values()) {
      expectedSymbolsPerFrame = Math.max(expectedSymbolsPerFrame, session.symbolsPerFrame || 1);
    }
    if (expectedSymbolsPerFrame === 1) {
      expectedSymbolsPerFrame = Math.max(1, this.maxSymbolsPerFrame);
    }
    return expectedSymbolsPerFrame;
  }

  #getKnownSymbolsPerFrame() {
    let known = null;
    for (const session of this.sessions.values()) {
      if (session.symbolsPerFrame && session.symbolsPerFrame > 0) {
        known = Math.max(known ?? 0, session.symbolsPerFrame);
      }
    }
    return known;
  }

  #dedupeFrameInputs(inputs) {
    const unique = new Map();
    for (const input of inputs) {
      const parsed = parseFrame(input);
      if (!parsed) {
        continue;
      }
      unique.set(getFrameKey(parsed), input);
    }
    return Array.from(unique.values());
  }

  #emitDecoderMode(state, force = false) {
    if (!state || (!force && !state.modeChanged)) {
      return;
    }
    this.emit("decoder-mode", {
      mode: state.mode,
      reason: state.reason ?? null
    });
  }

  async #decodeLegacy(imageData, expectedSymbolsPerFrame) {
    const decoderState = await this.decoder.decodeImageData(
      imageData,
      buildDecodePasses(imageData.width, imageData.height),
      expectedSymbolsPerFrame
    );
    this.#emitDecoderMode(decoderState);
    return decoderState;
  }

  async #readFrameInputs() {
    if (!this.video || this.video.readyState < 2 || !this.scanCanvas || !this.scanContext) {
      return [];
    }

    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    if (!videoWidth || !videoHeight) {
      return [];
    }

    const { width, height } = constrainScanSize(videoWidth, videoHeight, this.scanMaxDimension);
    if (this.scanCanvas.width !== width) {
      this.scanCanvas.width = width;
    }
    if (this.scanCanvas.height !== height) {
      this.scanCanvas.height = height;
    }

    this.scanContext.drawImage(this.video, 0, 0, width, height);
    const imageData = this.scanContext.getImageData(0, 0, width, height);
    const expectedSymbolsPerFrame = this.#getExpectedSymbolsPerFrame();

    const decoderState = await this.#decodeLegacy(imageData, expectedSymbolsPerFrame);
    return this.#dedupeFrameInputs(decoderState.frameInputs);
  }
}
