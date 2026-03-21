export type PayloadEncoding = "binary" | "base64";
export type FrameInput = string | Uint8Array;

export type FrameParseResult =
  | {
      type: "manifest";
      sessionId: string;
      totalChunks: number;
      chunkByteSize: number;
      fileSize: number;
      mimeType: string;
      fileName: string;
      parityBlockDataChunks: number;
      symbolsPerFrame: number;
    }
  | {
      type: "chunk";
      sessionId: string;
      chunkIndex: number;
      totalChunks: number;
      dataBytes: Uint8Array;
      dataBase64Url?: string;
    }
  | {
      type: "parity";
      sessionId: string;
      blockStartChunkIndex: number;
      totalChunks: number;
      dataBytes: Uint8Array;
      dataBase64Url?: string;
    }
  | null;

export interface TransferEstimate {
  fileSize: number;
  chunkByteSize: number;
  frameIntervalMs: number;
  symbolsPerFrame: number;
  totalChunks: number;
  totalSymbols: number;
  totalFrames: number;
  loopDurationMs: number;
  bytesPerSecond: number;
}

export interface CreateTransferFramesOptions {
  chunkByteSize?: number;
  sessionId?: string;
  fileName?: string;
  mimeType?: string;
  payloadEncoding?: PayloadEncoding;
  frameIntervalMs?: number;
  symbolsPerFrame?: number;
  parityBlockDataChunks?: number;
}

export interface PreparedTransfer {
  sessionId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  chunkByteSize: number;
  totalChunks: number;
  payloadEncoding: PayloadEncoding;
  symbolsPerFrame: number;
  parityBlockDataChunks: number;
  frames: FrameInput[];
  qrFrames: Array<string | Array<{ data: Uint8ClampedArray; mode: "byte" }>>;
  displayFrames: Array<{
    symbols: FrameInput[];
    qrSymbols: Array<string | Array<{ data: Uint8ClampedArray; mode: "byte" }>>;
  }>;
  estimatedStats: TransferEstimate;
}

export interface SenderOptions {
  canvas?: HTMLCanvasElement | null;
  frameIntervalMs?: number;
  chunkByteSize?: number;
  payloadEncoding?: PayloadEncoding;
  symbolsPerFrame?: number;
  parityBlockDataChunks?: number;
  stageStyle?: "guided" | "plain";
  qrOptions?: Record<string, unknown>;
}

export interface ReceiverOptions {
  video?: HTMLVideoElement | null;
  scanIntervalMs?: number;
  autoStopOnComplete?: boolean;
  /** @deprecated Accepted temporarily but ignored. ZXing/WASM is always used. */
  preferBarcodeDetector?: boolean;
  maxSymbolsPerFrame?: number;
  scanMaxDimension?: number;
  /** @deprecated Accepted temporarily but ignored. The decode passes are fixed internally. */
  tileScanGridSizes?: number[];
  decoderAssetBaseUrl?: string;
  guidedCalibration?: boolean;
  cameraOptimization?: boolean;
  cameraConstraints?: MediaStreamConstraints;
  scanCanvas?: HTMLCanvasElement | null;
}

export type ArchiveProfile = "max" | "extreme" | "ultra";

export interface ArchiveProgressEventPayload {
  phase: "scan" | "compress" | "finalize" | "extract";
  processedBytes: number;
  totalBytes: number;
  currentFile?: string;
  currentBlockId?: number;
}

export interface ArchiveOptions {
  profile?: ArchiveProfile;
  rootName?: string;
  compressionLevel?: number;
  maxBlockBytes?: number;
  rawFallbackThresholdBytes?: number;
  maxFileCount?: number;
  maxInputBytes?: number;
  maxFileBytes?: number;
  onProgress?: (event: ArchiveProgressEventPayload) => void;
}

export interface ArchiveManifestPreview {
  format: string;
  version: number;
  rootName: string;
  fileCount: number;
  totalInputBytes: number;
  archiveSize: number;
  blockCount: number;
}

export interface ArchiveArtifact {
  blob: Blob;
  fileName: string;
  manifestPreview: ArchiveManifestPreview;
}

export interface ExtractedArchiveFile {
  path: string;
  size: number;
  mtime: number;
  mimeType: string;
  bytes: Uint8Array;
  blob: Blob;
}

export interface ExtractedArchive {
  fileName: string;
  rootName: string;
  fileCount: number;
  totalInputBytes: number;
  files: ExtractedArchiveFile[];
  manifest: {
    format: string;
    version: number;
    createdAt: string;
    rootName: string;
    settings: Record<string, unknown>;
    blocks: Array<Record<string, unknown>>;
    files: Array<Record<string, unknown>>;
  };
}

export interface ReceivedTransfer {
  sessionId: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  size: number;
  totalChunks: number;
  receivedChunks: number;
}

export interface TransferPreset {
  frameIntervalMs: number;
  chunkByteSize: number;
  payloadEncoding: PayloadEncoding;
  symbolsPerFrame: number;
  parityBlockDataChunks: number;
  qrOptions: {
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
  };
}

export const PROTOCOL_MAGIC: string;
export const ARCHIVE_MAGIC: string;
export const ARCHIVE_VERSION: number;
export const ARCHIVE_MIME_TYPE: string;
export const ARCHIVE_EXTENSION: string;
export const DEFAULT_FRAME_INTERVAL_MS: number;
export const DEFAULT_CHUNK_BYTE_SIZE: number;
export const DEFAULT_PAYLOAD_ENCODING: PayloadEncoding;
export const DEFAULT_SYMBOLS_PER_FRAME: number;
export const TRANSFER_PRESETS: Record<string, TransferPreset>;

export function createSessionId(): string;
export function encodeManifestFrame(input: {
  sessionId: string;
  totalChunks: number;
  chunkByteSize: number;
  fileSize: number;
  mimeType: string;
  fileName: string;
  parityBlockDataChunks?: number;
  symbolsPerFrame?: number;
}): string;
export function encodeChunkFrame(input: {
  sessionId: string;
  chunkIndex: number;
  totalChunks: number;
  dataBase64Url: string;
}): string;
export function encodeChunkFrameBinary(input: {
  sessionId: string;
  chunkIndex: number;
  totalChunks: number;
  dataBytes: Uint8Array;
}): Uint8Array;
export function encodeParityFrame(input: {
  sessionId: string;
  blockStartChunkIndex: number;
  totalChunks: number;
  dataBase64Url: string;
}): string;
export function encodeParityFrameBinary(input: {
  sessionId: string;
  blockStartChunkIndex: number;
  totalChunks: number;
  dataBytes: Uint8Array;
}): Uint8Array;
export function parseFrame(frameInput: FrameInput): FrameParseResult;

export function resolveTransferPreset(name?: string): TransferPreset;
export function estimateTransferStats(input: {
  fileSize: number;
  chunkByteSize?: number;
  frameIntervalMs?: number;
  symbolsPerFrame?: number;
  manifestFrames?: number;
  extraFrames?: number;
}): TransferEstimate;

export function createTransferFrames(
  fileLike: Blob & { name?: string; type?: string },
  options?: CreateTransferFramesOptions
): Promise<PreparedTransfer>;

export class AnimatedQrSender {
  constructor(options?: SenderOptions);
  canvas: HTMLCanvasElement | null;
  frameIntervalMs: number;
  chunkByteSize: number;
  payloadEncoding: PayloadEncoding;
  symbolsPerFrame: number;
  parityBlockDataChunks: number;
  stageStyle: "guided" | "plain";
  prepared: PreparedTransfer | null;
  frameIndex: number;
  running: boolean;
  setCanvas(canvas: HTMLCanvasElement): void;
  prepare(
    fileLike: Blob & { name?: string; type?: string },
    options?: CreateTransferFramesOptions
  ): Promise<PreparedTransfer>;
  getFrames(): FrameInput[];
  renderFrameAt(frameIndex: number): Promise<FrameInput[]>;
  start(): Promise<void>;
  stop(): void;
  on(eventName: string, listener: (payload: any) => void): () => void;
  off(eventName: string, listener: (payload: any) => void): void;
}

export class AnimatedQrReceiver {
  constructor(options?: ReceiverOptions);
  video: HTMLVideoElement | null;
  scanIntervalMs: number;
  autoStopOnComplete: boolean;
  maxSymbolsPerFrame: number;
  scanMaxDimension: number;
  decoderAssetBaseUrl: string | null;
  setVideo(videoElement: HTMLVideoElement): void;
  startCamera(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  stopCamera(): void;
  start(constraints?: MediaStreamConstraints): Promise<void>;
  stop(): void;
  reset(sessionId?: string | null): void;
  getProgress(sessionId: string): {
    sessionId: string;
    receivedChunks: number;
    totalChunks: number;
    ratio: number;
  } | null;
  ingestFrame(frameInput: FrameInput): {
    accepted: boolean;
    frame: FrameParseResult;
    result: ReceivedTransfer | null;
  };
  ingestFrameText(frameInput: FrameInput): {
    accepted: boolean;
    frame: FrameParseResult;
    result: ReceivedTransfer | null;
  };
  on(eventName: string, listener: (payload: any) => void): () => void;
  off(eventName: string, listener: (payload: any) => void): void;
}

export function createArchive(
  inputs: ArrayLike<(Blob & { name?: string; type?: string; lastModified?: number; webkitRelativePath?: string })>,
  options?: ArchiveOptions
): Promise<ArchiveArtifact>;

export function extractArchive(
  archive: Blob & { name?: string; type?: string },
  options?: ArchiveOptions
): Promise<ExtractedArchive>;

export function createArchiveZipBlob(
  extractedArchive: ExtractedArchive
): Promise<{
  blob: Blob;
  fileName: string;
}>;

export function saveExtractedArchiveToDirectory(
  extractedArchive: ExtractedArchive,
  directoryHandle: FileSystemDirectoryHandle,
  options?: {
    outputDirectoryName?: string;
  }
): Promise<{
  directoryName: string;
  fileCount: number;
}>;

export function isArchiveBlob(blobLike: Blob): Promise<boolean>;
export function supportsDirectorySave(): boolean;

export function createDownloadLink(
  result: ReceivedTransfer,
  anchorElement?: HTMLAnchorElement | null
): {
  url: string;
  anchor: HTMLAnchorElement;
};
