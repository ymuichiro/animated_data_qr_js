import QRCode from "qrcode";
import { bytesToBase64Url } from "./utils/base64.js";
import { splitBytes } from "./utils/chunk.js";
import {
  createSessionId,
  encodeManifestFrame,
  encodeChunkFrame
} from "./protocol.js";
import { SimpleEmitter } from "./emitter.js";

async function blobLikeToBytes(fileLike) {
  if (!fileLike || typeof fileLike.arrayBuffer !== "function") {
    throw new TypeError("fileLike must provide arrayBuffer()");
  }
  return new Uint8Array(await fileLike.arrayBuffer());
}

function getDefaultFileName(fileLike) {
  if (typeof fileLike?.name === "string" && fileLike.name.length > 0) {
    return fileLike.name;
  }
  return "transfer.bin";
}

function getDefaultMimeType(fileLike) {
  if (typeof fileLike?.type === "string" && fileLike.type.length > 0) {
    return fileLike.type;
  }
  return "application/octet-stream";
}

export async function createTransferFrames(fileLike, options = {}) {
  const chunkByteSize = options.chunkByteSize ?? 220;
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }

  const bytes = await blobLikeToBytes(fileLike);
  const sessionId = options.sessionId ?? createSessionId();
  const fileName = options.fileName ?? getDefaultFileName(fileLike);
  const mimeType = options.mimeType ?? getDefaultMimeType(fileLike);
  const chunks = splitBytes(bytes, chunkByteSize);
  const totalChunks = chunks.length;

  const manifestFrame = encodeManifestFrame({
    sessionId,
    totalChunks,
    chunkByteSize,
    fileSize: bytes.length,
    mimeType,
    fileName
  });

  const chunkFrames = chunks.map((chunkBytes, chunkIndex) => {
    return encodeChunkFrame({
      sessionId,
      chunkIndex,
      totalChunks,
      dataBase64Url: bytesToBase64Url(chunkBytes)
    });
  });

  return {
    sessionId,
    fileName,
    mimeType,
    fileSize: bytes.length,
    chunkByteSize,
    totalChunks,
    frames: [manifestFrame, ...chunkFrames]
  };
}

export class AnimatedQrSender extends SimpleEmitter {
  constructor(options = {}) {
    super();
    this.canvas = options.canvas ?? null;
    this.frameIntervalMs = options.frameIntervalMs ?? 120;
    this.chunkByteSize = options.chunkByteSize ?? 220;
    this.qrOptions = {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 6,
      ...(options.qrOptions ?? {})
    };

    this.prepared = null;
    this.frameIndex = 0;
    this.running = false;
    this.timer = null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  async prepare(fileLike, options = {}) {
    const transfer = await createTransferFrames(fileLike, {
      chunkByteSize: options.chunkByteSize ?? this.chunkByteSize,
      sessionId: options.sessionId,
      fileName: options.fileName,
      mimeType: options.mimeType
    });

    this.prepared = transfer;
    this.frameIndex = 0;
    this.emit("prepared", transfer);
    return transfer;
  }

  getFrames() {
    return this.prepared ? [...this.prepared.frames] : [];
  }

  async renderFrameAt(frameIndex) {
    if (!this.prepared || this.prepared.frames.length === 0) {
      throw new Error("No transfer is prepared. Call prepare() first.");
    }
    if (!this.canvas) {
      throw new Error("No canvas configured. Pass { canvas } or call setCanvas().");
    }

    const length = this.prepared.frames.length;
    const safeIndex = ((frameIndex % length) + length) % length;
    const frameText = this.prepared.frames[safeIndex];
    await QRCode.toCanvas(this.canvas, frameText, this.qrOptions);
    this.emit("frame", {
      frameIndex: safeIndex,
      frameText,
      sessionId: this.prepared.sessionId
    });
    return frameText;
  }

  async start() {
    if (this.running) {
      return;
    }
    if (!this.prepared) {
      throw new Error("No transfer is prepared. Call prepare() first.");
    }

    this.running = true;
    this.emit("start", {
      sessionId: this.prepared.sessionId,
      frameCount: this.prepared.frames.length
    });
    await this.#tick();
  }

  stop() {
    this.running = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit("stop", {});
  }

  async #tick() {
    if (!this.running) {
      return;
    }

    try {
      await this.renderFrameAt(this.frameIndex);
      this.frameIndex = (this.frameIndex + 1) % this.prepared.frames.length;
      this.timer = setTimeout(() => {
        void this.#tick();
      }, this.frameIntervalMs);
    } catch (error) {
      this.running = false;
      this.emit("error", { error });
    }
  }
}
