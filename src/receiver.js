import jsQR from "jsqr";
import { base64UrlToBytes } from "./utils/base64.js";
import { concatChunks } from "./utils/chunk.js";
import { parseFrame } from "./protocol.js";
import { SimpleEmitter } from "./emitter.js";

function createSession(sessionId, totalChunks) {
  return {
    sessionId,
    totalChunks,
    chunkByteSize: null,
    fileSize: null,
    mimeType: "application/octet-stream",
    fileName: `transfer-${sessionId}.bin`,
    chunks: new Array(totalChunks).fill(null),
    receivedChunks: 0,
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

    this.scanCanvas = options.scanCanvas ?? (
      typeof document !== "undefined" ? document.createElement("canvas") : null
    );
    this.scanContext = this.scanCanvas?.getContext("2d", { willReadFrequently: true }) ?? null;

    this.detector = null;
    if (
      this.preferBarcodeDetector
      && typeof window !== "undefined"
      && "BarcodeDetector" in window
    ) {
      try {
        this.detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        this.detector = null;
      }
    }
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
    if (!this.stream) {
      await this.startCamera(constraints ?? this.cameraConstraints);
    }

    if (this.scanning) {
      return;
    }

    this.scanning = true;
    this.emit("scan-start", {});
    await this.#scanTick();
  }

  stop() {
    this.scanning = false;
    if (this.scanTimer !== null) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
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

  ingestFrameText(frameText) {
    const frame = parseFrame(frameText);
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
      session.fileSize = frame.fileSize;
      session.mimeType = frame.mimeType;
      session.fileName = frame.fileName;
      this.emit("manifest", {
        sessionId: session.sessionId,
        fileName: session.fileName,
        mimeType: session.mimeType,
        fileSize: session.fileSize,
        chunkByteSize: session.chunkByteSize,
        totalChunks: session.totalChunks
      });
    } else if (frame.type === "chunk") {
      if (frame.totalChunks !== session.totalChunks || frame.chunkIndex >= session.totalChunks) {
        return { accepted: false, frame, result: null };
      }
      if (session.chunks[frame.chunkIndex] === null) {
        session.chunks[frame.chunkIndex] = base64UrlToBytes(frame.dataBase64Url);
        session.receivedChunks += 1;
        this.emit("chunk", {
          sessionId: session.sessionId,
          chunkIndex: frame.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      }
    }

    const progress = createProgressPayload(session);
    this.emit("progress", progress);

    if (!session.completed && session.receivedChunks === session.totalChunks) {
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

  async #scanTick() {
    if (!this.scanning) {
      return;
    }

    try {
      const frameText = await this.#readFrameText();
      if (frameText) {
        this.ingestFrameText(frameText);
      }
    } catch (error) {
      this.emit("error", { error });
    }

    if (this.scanning) {
      this.scanTimer = setTimeout(() => {
        void this.#scanTick();
      }, this.scanIntervalMs);
    }
  }

  async #readFrameText() {
    if (!this.video || this.video.readyState < 2) {
      return null;
    }

    if (this.detector) {
      try {
        const codes = await this.detector.detect(this.video);
        if (codes.length > 0 && codes[0].rawValue) {
          return codes[0].rawValue;
        }
      } catch {
        this.detector = null;
      }
    }

    if (!this.scanCanvas || !this.scanContext) {
      return null;
    }

    const width = this.video.videoWidth;
    const height = this.video.videoHeight;
    if (!width || !height) {
      return null;
    }

    if (this.scanCanvas.width !== width) {
      this.scanCanvas.width = width;
    }
    if (this.scanCanvas.height !== height) {
      this.scanCanvas.height = height;
    }

    this.scanContext.drawImage(this.video, 0, 0, width, height);
    const imageData = this.scanContext.getImageData(0, 0, width, height);
    const result = jsQR(imageData.data, width, height, {
      inversionAttempts: "dontInvert"
    });

    return result?.data ?? null;
  }
}
