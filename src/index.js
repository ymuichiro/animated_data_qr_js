export {
  PROTOCOL_MAGIC,
  createSessionId,
  encodeManifestFrame,
  encodeChunkFrame,
  encodeChunkFrameBinary,
  encodeParityFrame,
  encodeParityFrameBinary,
  parseFrame
} from "./protocol.js";

export {
  AnimatedQrSender,
  createTransferFrames
} from "./sender.js";

export {
  AnimatedQrReceiver,
  createDownloadLink
} from "./receiver.js";

export {
  ARCHIVE_MAGIC,
  ARCHIVE_VERSION,
  ARCHIVE_MIME_TYPE,
  ARCHIVE_EXTENSION,
  createArchive,
  extractArchive,
  createArchiveZipBlob,
  saveExtractedArchiveToDirectory,
  isArchiveBlob,
  supportsDirectorySave
} from "./archive.js";

export {
  DEFAULT_CHUNK_BYTE_SIZE,
  DEFAULT_FRAME_INTERVAL_MS,
  DEFAULT_PAYLOAD_ENCODING,
  DEFAULT_SYMBOLS_PER_FRAME,
  TRANSFER_PRESETS,
  resolveTransferPreset,
  estimateTransferStats
} from "./tuning.js";
