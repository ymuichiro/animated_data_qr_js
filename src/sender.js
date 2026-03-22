import QRCode from "qrcode";
import { bytesToBase64Url } from "./utils/base64.js";
import { splitBytes } from "./utils/chunk.js";
import { groupIntoBatches } from "./grid.js";
import {
  DEFAULT_STAGE_STYLE,
  getPlainStageLayout
} from "./stage-layout.js";
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
  const size = Math.max(320, width);
  return {
    width,
    height: size
  };
}

async function renderPlainQrGrid(canvas, qrSymbols, qrOptions) {
  const { width, height } = getCanvasDisplaySize(canvas, qrSymbols.length);
  const frameCanvas = document.createElement("canvas");
  const context = frameCanvas.getContext("2d");
  const layout = getPlainStageLayout(qrSymbols.length, width);

  frameCanvas.width = width;
  frameCanvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < qrSymbols.length; index += 1) {
    const cell = layout.cells[index];
    if (!cell) {
      break;
    }
    const tempCanvas = document.createElement("canvas");
    const drawSize = Math.max(
      96,
      Math.min(cell.width, cell.height) - Math.round(Math.min(cell.width, cell.height) * 0.06)
    );
    await QRCode.toCanvas(tempCanvas, qrSymbols[index], {
      ...qrOptions,
      width: drawSize
    });

    const x = cell.x + Math.max(0, Math.floor((cell.width - drawSize) / 2));
    const y = cell.y + Math.max(0, Math.floor((cell.height - drawSize) / 2));
    context.drawImage(tempCanvas, x, y, drawSize, drawSize);
  }

  const targetContext = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  targetContext.clearRect(0, 0, width, height);
  targetContext.drawImage(frameCanvas, 0, 0, width, height);
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

function rotateFrameBatch(displayFrame, rotation) {
  if (!displayFrame || displayFrame.qrSymbols.length <= 1 || !Number.isInteger(rotation)) {
    return displayFrame;
  }

  const count = displayFrame.qrSymbols.length;
  const offset = ((rotation % count) + count) % count;
  if (offset === 0) {
    return displayFrame;
  }

  return {
    symbols: [
      ...displayFrame.symbols.slice(offset),
      ...displayFrame.symbols.slice(0, offset)
    ],
    qrSymbols: [
      ...displayFrame.qrSymbols.slice(offset),
      ...displayFrame.qrSymbols.slice(0, offset)
    ]
  };
}

function getLoopDisplayFrame(prepared, displayFrameIndex, loopIndex = 0) {
  if (!prepared || prepared.displayFrames.length === 0) {
    return null;
  }

  const symbolsPerFrame = Math.max(1, prepared.symbolsPerFrame || 1);
  const payloadCount = Math.max(0, prepared.frames.length - 1);
  if (symbolsPerFrame === 1 || payloadCount <= 1) {
    return prepared.displayFrames[displayFrameIndex] ?? prepared.displayFrames[0];
  }

  const payloadOffset = ((loopIndex % payloadCount) + payloadCount) % payloadCount;
  const startIndex = displayFrameIndex * symbolsPerFrame;
  const symbols = [];
  const qrSymbols = [];

  for (let slot = 0; slot < symbolsPerFrame; slot += 1) {
    const combinedIndex = startIndex + slot;
    if (combinedIndex === 0) {
      symbols.push(prepared.frames[0]);
      qrSymbols.push(prepared.qrFrames[0]);
      continue;
    }

    const rotatedPayloadIndex = combinedIndex - 1;
    if (rotatedPayloadIndex >= payloadCount) {
      break;
    }

    const actualPayloadIndex = 1 + ((payloadOffset + rotatedPayloadIndex) % payloadCount);
    symbols.push(prepared.frames[actualPayloadIndex]);
    qrSymbols.push(prepared.qrFrames[actualPayloadIndex]);
  }

  return {
    symbols,
    qrSymbols
  };
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
    this.stageStyle = DEFAULT_STAGE_STYLE;

    this.prepared = null;
    this.frameIndex = 0;
    this.loopIndex = 0;
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
    this.loopIndex = 0;
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
    const displayFrame = rotateFrameBatch(
      getLoopDisplayFrame(this.prepared, safeIndex, this.loopIndex),
      safeIndex + this.loopIndex
    );

    await renderPlainQrGrid(this.canvas, displayFrame.qrSymbols, this.qrOptions);

    this.emit("frame", {
      frameIndex: safeIndex,
      symbols: displayFrame.symbols,
      symbolCount: displayFrame.symbols.length,
      stageMode: "plain",
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
      if (this.frameIndex === 0) {
        this.loopIndex += 1;
      }
      this.timer = setTimeout(() => {
        void this.#tick();
      }, this.frameIntervalMs);
    } catch (error) {
      this.running = false;
      this.emit("error", { error });
    }
  }
}
