export const PROTOCOL_MAGIC = "ADQR1";
const FRAME_SEPARATOR = "|";

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
  fileName
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
    encodeText(fileName || "transfer.bin")
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

export function parseFrame(frameText) {
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
      fileName
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

    return {
      type: "chunk",
      sessionId: parts[2],
      chunkIndex,
      totalChunks,
      dataBase64Url
    };
  }

  return null;
}
