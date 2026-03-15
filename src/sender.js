import QRCode from "qrcode";
import { bytesToBase64Url } from "./utils/base64.js";
import { splitBytes } from "./utils/chunk.js";
import {
  createSessionId,
  encodeManifestFrame,
  encodeChunkFrame,
  encodeChunkFrameBinary,
  encodeParityFrame,
  encodeParityFrameBinary
} from "./protocol.js";
import { SimpleEmitter } from "./emitter.js";
import {
  DEFAULT_CHUNK_BYTE_SIZE,
  DEFAULT_FRAME_INTERVAL_MS,
  DEFAULT_PAYLOAD_ENCODING,
  estimateTransferStats
} from "./tuning.js";

function toQrFrame(frame) {
  if (typeof frame === "string") {
    return frame;
  }

  return [{
    data: new Uint8ClampedArray(frame),
    mode: "byte"
  }];
}

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

function createChunkFrame({
  payloadEncoding,
  sessionId,
  chunkIndex,
  totalChunks,
  chunkBytes
}) {
  if (payloadEncoding === "base64") {
    return encodeChunkFrame({
      sessionId,
      chunkIndex,
      totalChunks,
      dataBase64Url: bytesToBase64Url(chunkBytes)
    });
  }

  return encodeChunkFrameBinary({
    sessionId,
    chunkIndex,
    totalChunks,
    dataBytes: chunkBytes
  });
}

function createParityChunk(blockChunks, chunkByteSize) {
  const parityBytes = new Uint8Array(chunkByteSize);
  for (const chunkBytes of blockChunks) {
    for (let index = 0; index < chunkBytes.length; index += 1) {
      parityBytes[index] ^= chunkBytes[index];
    }
  }
  return parityBytes;
}

function createParityFrame({
  payloadEncoding,
  sessionId,
  blockStartChunkIndex,
  totalChunks,
  parityBytes
}) {
  if (payloadEncoding === "base64") {
    return encodeParityFrame({
      sessionId,
      blockStartChunkIndex,
      totalChunks,
      dataBase64Url: bytesToBase64Url(parityBytes)
    });
  }

  return encodeParityFrameBinary({
    sessionId,
    blockStartChunkIndex,
    totalChunks,
    dataBytes: parityBytes
  });
}

export async function createTransferFrames(fileLike, options = {}) {
  const chunkByteSize = options.chunkByteSize ?? DEFAULT_CHUNK_BYTE_SIZE;
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }

  const payloadEncoding = options.payloadEncoding ?? DEFAULT_PAYLOAD_ENCODING;
  if (payloadEncoding !== "binary" && payloadEncoding !== "base64") {
    throw new TypeError("payloadEncoding must be either 'binary' or 'base64'");
  }
  const parityBlockDataChunks = options.parityBlockDataChunks ?? 0;
  if (!Number.isInteger(parityBlockDataChunks) || parityBlockDataChunks < 0) {
    throw new TypeError("parityBlockDataChunks must be an integer >= 0");
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
    fileName,
    parityBlockDataChunks
  });

  const chunkFrames = [];
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunkBytes = chunks[chunkIndex];
    chunkFrames.push(createChunkFrame({
      payloadEncoding,
      sessionId,
      chunkIndex,
      totalChunks,
      chunkBytes
    }));

    if (
      parityBlockDataChunks > 0
      && ((chunkIndex + 1) % parityBlockDataChunks === 0 || chunkIndex === chunks.length - 1)
    ) {
      const blockStartChunkIndex = chunkIndex - ((chunkIndex % parityBlockDataChunks));
      const blockChunks = chunks.slice(blockStartChunkIndex, chunkIndex + 1);
      const parityBytes = createParityChunk(blockChunks, chunkByteSize);
      chunkFrames.push(createParityFrame({
        payloadEncoding,
        sessionId,
        blockStartChunkIndex,
        totalChunks,
        parityBytes
      }));
    }
  }

  const frames = [manifestFrame, ...chunkFrames];
  const qrFrames = frames.map((frame) => toQrFrame(frame));
  const estimatedStats = estimateTransferStats({
    fileSize: bytes.length,
    chunkByteSize,
    frameIntervalMs: options.frameIntervalMs ?? DEFAULT_FRAME_INTERVAL_MS,
    extraFrames: parityBlockDataChunks > 0
      ? Math.ceil(totalChunks / parityBlockDataChunks)
      : 0
  });

  return {
    sessionId,
    fileName,
    mimeType,
    fileSize: bytes.length,
    chunkByteSize,
    totalChunks,
    payloadEncoding,
    parityBlockDataChunks,
    frames,
    qrFrames,
    estimatedStats
  };
}

export class AnimatedQrSender extends SimpleEmitter {
  constructor(options = {}) {
    super();
    this.canvas = options.canvas ?? null;
    this.frameIntervalMs = options.frameIntervalMs ?? DEFAULT_FRAME_INTERVAL_MS;
    this.chunkByteSize = options.chunkByteSize ?? DEFAULT_CHUNK_BYTE_SIZE;
    this.payloadEncoding = options.payloadEncoding ?? DEFAULT_PAYLOAD_ENCODING;
    this.parityBlockDataChunks = options.parityBlockDataChunks ?? 0;
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
      mimeType: options.mimeType,
      payloadEncoding: options.payloadEncoding ?? this.payloadEncoding,
      parityBlockDataChunks: options.parityBlockDataChunks ?? this.parityBlockDataChunks,
      frameIntervalMs: options.frameIntervalMs ?? this.frameIntervalMs
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
    const qrFrame = this.prepared.qrFrames[safeIndex];
    const frame = this.prepared.frames[safeIndex];
    await QRCode.toCanvas(this.canvas, qrFrame, this.qrOptions);
    this.emit("frame", {
      frameIndex: safeIndex,
      frame,
      sessionId: this.prepared.sessionId
    });
    return frame;
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
