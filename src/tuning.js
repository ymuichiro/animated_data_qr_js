export const DEFAULT_FRAME_INTERVAL_MS = 250;
export const DEFAULT_CHUNK_BYTE_SIZE = 220;
export const DEFAULT_PAYLOAD_ENCODING = "binary";

export const TRANSFER_PRESETS = Object.freeze({
  compatibility: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 220,
    payloadEncoding: "binary",
    qrOptions: Object.freeze({
      errorCorrectionLevel: "M"
    })
  }),
  balanced: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 384,
    payloadEncoding: "binary",
    qrOptions: Object.freeze({
      errorCorrectionLevel: "M"
    })
  }),
  throughput: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 512,
    payloadEncoding: "binary",
    qrOptions: Object.freeze({
      errorCorrectionLevel: "L"
    })
  })
});

export function resolveTransferPreset(name = "compatibility") {
  const preset = TRANSFER_PRESETS[name] ?? TRANSFER_PRESETS.compatibility;
  return {
    frameIntervalMs: preset.frameIntervalMs,
    chunkByteSize: preset.chunkByteSize,
    payloadEncoding: preset.payloadEncoding,
    qrOptions: {
      ...preset.qrOptions
    }
  };
}

export function estimateTransferStats({
  fileSize,
  chunkByteSize = DEFAULT_CHUNK_BYTE_SIZE,
  frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS,
  manifestFrames = 1
}) {
  if (!Number.isFinite(fileSize) || fileSize < 0) {
    throw new TypeError("fileSize must be a number >= 0");
  }
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }
  if (!Number.isFinite(frameIntervalMs) || frameIntervalMs <= 0) {
    throw new TypeError("frameIntervalMs must be a number > 0");
  }

  const totalChunks = Math.max(1, Math.ceil(fileSize / chunkByteSize));
  const totalFrames = totalChunks + manifestFrames;
  const loopDurationMs = totalFrames * frameIntervalMs;
  const bytesPerSecond = fileSize === 0
    ? 0
    : fileSize / Math.max(loopDurationMs / 1000, 1);

  return {
    fileSize,
    chunkByteSize,
    frameIntervalMs,
    totalChunks,
    totalFrames,
    loopDurationMs,
    bytesPerSecond
  };
}
