import { base64UrlToBytes } from "./utils/base64.js";

export const PROTOCOL_MAGIC = "ADQR1";
const FRAME_SEPARATOR = "|";
const FRAME_SEPARATOR_CODE = FRAME_SEPARATOR.charCodeAt(0);
const PROTOCOL_MAGIC_BYTES = asciiStringToBytes(PROTOCOL_MAGIC);

function encodeText(value) {
  return encodeURIComponent(value ?? "");
}

function decodeText(value) {
  return decodeURIComponent(value ?? "");
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function asciiStringToBytes(value) {
  const output = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    output[index] = value.charCodeAt(index) & 0xff;
  }
  return output;
}

function asciiBytesToString(bytes) {
  const chunkSize = 0x8000;
  let output = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const view = bytes.subarray(index, index + chunkSize);
    output += String.fromCharCode(...view);
  }
  return output;
}

function asUint8Array(value) {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof Uint8ClampedArray) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  return null;
}

function concatBytes(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function hasMagicPrefix(bytes) {
  if (bytes.length < PROTOCOL_MAGIC_BYTES.length) {
    return false;
  }
  for (let index = 0; index < PROTOCOL_MAGIC_BYTES.length; index += 1) {
    if (bytes[index] !== PROTOCOL_MAGIC_BYTES[index]) {
      return false;
    }
  }
  return true;
}

function findSeparatorOffsets(bytes, expectedCount) {
  const offsets = [];
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === FRAME_SEPARATOR_CODE) {
      offsets.push(index);
      if (offsets.length === expectedCount) {
        break;
      }
    }
  }
  return offsets;
}

function parseTextFrame(frameText) {
  if (typeof frameText !== "string" || frameText.length === 0) {
    return null;
  }

  const parts = frameText.split(FRAME_SEPARATOR);
  if (parts.length < 2 || parts[0] !== PROTOCOL_MAGIC) {
    return null;
  }

  if (parts[1] === "M") {
    if (parts.length < 8) {
      return null;
    }

    const totalChunks = parsePositiveInt(parts[3]);
    const chunkByteSize = parsePositiveInt(parts[4]);
    const fileSize = parsePositiveInt(parts[5]);

    if (totalChunks === null || totalChunks <= 0 || chunkByteSize === null || fileSize === null) {
      return null;
    }

    let mimeType;
    let fileName;
    const parityBlockDataChunks = parts.length >= 9
      ? parsePositiveInt(parts[8]) ?? 0
      : 0;
    const symbolsPerFrame = parts.length >= 10
      ? parsePositiveInt(parts[9]) ?? 1
      : 1;
    try {
      mimeType = decodeText(parts[6]) || "application/octet-stream";
      fileName = decodeText(parts[7]) || "transfer.bin";
    } catch {
      return null;
    }

    return {
      type: "manifest",
      sessionId: parts[2],
      totalChunks,
      chunkByteSize,
      fileSize,
      mimeType,
      fileName,
      parityBlockDataChunks,
      symbolsPerFrame
    };
  }

  if (parts[1] === "C") {
    if (parts.length < 6) {
      return null;
    }

    const chunkIndex = parsePositiveInt(parts[3]);
    const totalChunks = parsePositiveInt(parts[4]);
    const dataBase64Url = parts[5];

    if (chunkIndex === null || totalChunks === null || totalChunks <= 0) {
      return null;
    }

    try {
      return {
        type: "chunk",
        sessionId: parts[2],
        chunkIndex,
        totalChunks,
        dataBase64Url,
        dataBytes: base64UrlToBytes(dataBase64Url)
      };
    } catch {
      return null;
    }
  }

  if (parts[1] === "P") {
    if (parts.length < 6) {
      return null;
    }

    const blockStartChunkIndex = parsePositiveInt(parts[3]);
    const totalChunks = parsePositiveInt(parts[4]);
    const dataBase64Url = parts[5];

    if (blockStartChunkIndex === null || totalChunks === null || totalChunks <= 0) {
      return null;
    }

    try {
      return {
        type: "parity",
        sessionId: parts[2],
        blockStartChunkIndex,
        totalChunks,
        dataBase64Url,
        dataBytes: base64UrlToBytes(dataBase64Url)
      };
    } catch {
      return null;
    }
  }

  return null;
}

function parseBinaryFrame(frameBytes) {
  const bytes = asUint8Array(frameBytes);
  if (!bytes || bytes.length === 0 || !hasMagicPrefix(bytes)) {
    return null;
  }

  const separators = findSeparatorOffsets(bytes, 5);
  if (separators.length < 2) {
    return null;
  }

  const magic = asciiBytesToString(bytes.subarray(0, separators[0]));
  const frameType = asciiBytesToString(bytes.subarray(separators[0] + 1, separators[1]));
  if (magic !== PROTOCOL_MAGIC) {
    return null;
  }

  if (frameType === "M") {
    return parseTextFrame(asciiBytesToString(bytes));
  }

  if (frameType === "C" || frameType === "P") {
    if (separators.length < 5) {
      return null;
    }

    const sessionId = asciiBytesToString(bytes.subarray(separators[1] + 1, separators[2]));
    const indexValue = parsePositiveInt(
      asciiBytesToString(bytes.subarray(separators[2] + 1, separators[3]))
    );
    const totalChunks = parsePositiveInt(
      asciiBytesToString(bytes.subarray(separators[3] + 1, separators[4]))
    );

    if (!sessionId || indexValue === null || totalChunks === null || totalChunks <= 0) {
      return null;
    }

    if (frameType === "C") {
      return {
        type: "chunk",
        sessionId,
        chunkIndex: indexValue,
        totalChunks,
        dataBytes: bytes.slice(separators[4] + 1)
      };
    }

    return {
      type: "parity",
      sessionId,
      blockStartChunkIndex: indexValue,
      totalChunks,
      dataBytes: bytes.slice(separators[4] + 1)
    };
  }

  return null;
}

export function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  const random = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `s${Date.now().toString(36)}${random}`;
}

export function encodeManifestFrame({
  sessionId,
  totalChunks,
  chunkByteSize,
  fileSize,
  mimeType,
  fileName,
  parityBlockDataChunks = 0,
  symbolsPerFrame = 1
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  const parts = [
    PROTOCOL_MAGIC,
    "M",
    sessionId,
    String(totalChunks),
    String(chunkByteSize),
    String(fileSize),
    encodeText(mimeType || "application/octet-stream"),
    encodeText(fileName || "transfer.bin"),
    String(parityBlockDataChunks),
    String(symbolsPerFrame)
  ];
  return parts.join(FRAME_SEPARATOR);
}

export function encodeChunkFrame({
  sessionId,
  chunkIndex,
  totalChunks,
  dataBase64Url
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new Error("chunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }
  if (typeof dataBase64Url !== "string") {
    throw new Error("dataBase64Url must be a string");
  }

  return [
    PROTOCOL_MAGIC,
    "C",
    sessionId,
    String(chunkIndex),
    String(totalChunks),
    dataBase64Url
  ].join(FRAME_SEPARATOR);
}

export function encodeParityFrame({
  sessionId,
  blockStartChunkIndex,
  totalChunks,
  dataBase64Url
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(blockStartChunkIndex) || blockStartChunkIndex < 0) {
    throw new Error("blockStartChunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }
  if (typeof dataBase64Url !== "string") {
    throw new Error("dataBase64Url must be a string");
  }

  return [
    PROTOCOL_MAGIC,
    "P",
    sessionId,
    String(blockStartChunkIndex),
    String(totalChunks),
    dataBase64Url
  ].join(FRAME_SEPARATOR);
}

export function encodeChunkFrameBinary({
  sessionId,
  chunkIndex,
  totalChunks,
  dataBytes
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new Error("chunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }

  const payloadBytes = asUint8Array(dataBytes);
  if (!payloadBytes) {
    throw new Error("dataBytes must be Uint8Array-compatible");
  }

  const headerBytes = asciiStringToBytes(
    [
      PROTOCOL_MAGIC,
      "C",
      sessionId,
      String(chunkIndex),
      String(totalChunks),
      ""
    ].join(FRAME_SEPARATOR)
  );

  return concatBytes([headerBytes, payloadBytes]);
}

export function encodeParityFrameBinary({
  sessionId,
  blockStartChunkIndex,
  totalChunks,
  dataBytes
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(blockStartChunkIndex) || blockStartChunkIndex < 0) {
    throw new Error("blockStartChunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }

  const payloadBytes = asUint8Array(dataBytes);
  if (!payloadBytes) {
    throw new Error("dataBytes must be Uint8Array-compatible");
  }

  const headerBytes = asciiStringToBytes(
    [
      PROTOCOL_MAGIC,
      "P",
      sessionId,
      String(blockStartChunkIndex),
      String(totalChunks),
      ""
    ].join(FRAME_SEPARATOR)
  );

  return concatBytes([headerBytes, payloadBytes]);
}

export function parseFrame(frameInput) {
  if (typeof frameInput === "string") {
    return parseTextFrame(frameInput);
  }

  return parseBinaryFrame(frameInput);
}
