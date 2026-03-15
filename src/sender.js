import QRCode from "qrcode";
import { bytesToBase64Url } from "./utils/base64.js";
import { splitBytes } from "./utils/chunk.js";
import { getGridDimensions, groupIntoBatches } from "./grid.js";
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
  DEFAULT_SYMBOLS_PER_FRAME,
  estimateTransferStats
} from "./tuning.js";

function toQrSymbol(frame) {
  if (typeof frame === "string") {
    return frame;
  }

  return [{
    data: new Uint8ClampedArray(frame),
    mode: "byte"
  }];
}

function getCanvasDisplaySize(canvas, symbolCount) {
  const width = Math.max(320, canvas.clientWidth || canvas.width || 640);
  const { columns, rows } = getGridDimensions(symbolCount);
  const size = Math.max(320, Math.round(width * (rows / columns)));
  return {
    width,
    height: size
  };
}

async function renderQrGrid(canvas, qrSymbols, qrOptions) {
  const { columns, rows } = getGridDimensions(qrSymbols.length);
  const { width, height } = getCanvasDisplaySize(canvas, qrSymbols.length);
  const context = canvas.getContext("2d");
  const gap = 12;
  const cellWidth = Math.floor((width - (gap * (columns + 1))) / columns);
  const cellHeight = Math.floor((height - (gap * (rows + 1))) / rows);
  const drawSize = Math.max(64, Math.min(cellWidth, cellHeight));

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < qrSymbols.length; index += 1) {
    const tempCanvas = document.createElement("canvas");
    await QRCode.toCanvas(tempCanvas, qrSymbols[index], {
      ...qrOptions,
      width: drawSize
    });

    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = gap + (column * (cellWidth + gap)) + Math.max(0, Math.floor((cellWidth - drawSize) / 2));
    const y = gap + (row * (cellHeight + gap)) + Math.max(0, Math.floor((cellHeight - drawSize) / 2));
    context.drawImage(tempCanvas, x, y, drawSize, drawSize);
  }
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

function createDisplayFrames(frames, qrSymbols, symbolsPerFrame) {
  const groupedFrames = groupIntoBatches(frames, symbolsPerFrame);
  const groupedQrSymbols = groupIntoBatches(qrSymbols, symbolsPerFrame);
  return groupedFrames.map((symbols, index) => ({
    symbols,
    qrSymbols: groupedQrSymbols[index]
  }));
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

  const symbolsPerFrame = options.symbolsPerFrame ?? DEFAULT_SYMBOLS_PER_FRAME;
  if (!Number.isInteger(symbolsPerFrame) || symbolsPerFrame <= 0) {
    throw new TypeError("symbolsPerFrame must be an integer > 0");
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
    parityBlockDataChunks,
    symbolsPerFrame
  });

  const symbolFrames = [];
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunkBytes = chunks[chunkIndex];
    symbolFrames.push(createChunkFrame({
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
      const blockStartChunkIndex = chunkIndex - (chunkIndex % parityBlockDataChunks);
      const blockChunks = chunks.slice(blockStartChunkIndex, chunkIndex + 1);
      const parityBytes = createParityChunk(blockChunks, chunkByteSize);
      symbolFrames.push(createParityFrame({
        payloadEncoding,
        sessionId,
        blockStartChunkIndex,
        totalChunks,
        parityBytes
      }));
    }
  }

  const frames = [manifestFrame, ...symbolFrames];
  const qrSymbols = frames.map((frame) => toQrSymbol(frame));
  const displayFrames = createDisplayFrames(frames, qrSymbols, symbolsPerFrame);
  const estimatedStats = estimateTransferStats({
    fileSize: bytes.length,
    chunkByteSize,
    frameIntervalMs: options.frameIntervalMs ?? DEFAULT_FRAME_INTERVAL_MS,
    symbolsPerFrame,
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
    symbolsPerFrame,
    parityBlockDataChunks,
    frames,
    qrFrames: qrSymbols,
    displayFrames,
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
    this.symbolsPerFrame = options.symbolsPerFrame ?? DEFAULT_SYMBOLS_PER_FRAME;
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
      symbolsPerFrame: options.symbolsPerFrame ?? this.symbolsPerFrame,
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
    if (!this.prepared || this.prepared.displayFrames.length === 0) {
      throw new Error("No transfer is prepared. Call prepare() first.");
    }
    if (!this.canvas) {
      throw new Error("No canvas configured. Pass { canvas } or call setCanvas().");
    }

    const length = this.prepared.displayFrames.length;
    const safeIndex = ((frameIndex % length) + length) % length;
    const displayFrame = this.prepared.displayFrames[safeIndex];

    if (displayFrame.qrSymbols.length === 1) {
      const { width, height } = getCanvasDisplaySize(this.canvas, 1);
      this.canvas.width = width;
      this.canvas.height = height;
      await QRCode.toCanvas(this.canvas, displayFrame.qrSymbols[0], {
        ...this.qrOptions,
        width: Math.min(width, height)
      });
    } else {
      await renderQrGrid(this.canvas, displayFrame.qrSymbols, this.qrOptions);
    }

    this.emit("frame", {
      frameIndex: safeIndex,
      symbols: displayFrame.symbols,
      symbolCount: displayFrame.symbols.length,
      sessionId: this.prepared.sessionId
    });
    return displayFrame.symbols;
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
      frameCount: this.prepared.displayFrames.length
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
      this.frameIndex = (this.frameIndex + 1) % this.prepared.displayFrames.length;
      this.timer = setTimeout(() => {
        void this.#tick();
      }, this.frameIntervalMs);
    } catch (error) {
      this.running = false;
      this.emit("error", { error });
    }
  }
}
