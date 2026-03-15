export {
  PROTOCOL_MAGIC,
  createSessionId,
  encodeManifestFrame,
  encodeChunkFrame,
  encodeChunkFrameBinary,
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
  DEFAULT_CHUNK_BYTE_SIZE,
  DEFAULT_FRAME_INTERVAL_MS,
  DEFAULT_PAYLOAD_ENCODING,
  TRANSFER_PRESETS,
  resolveTransferPreset,
  estimateTransferStats
} from "./tuning.js";
