export type PayloadEncoding = "binary" | "base64";
export type ArchiveProfile = "max" | "extreme" | "ultra";

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

export interface SenderMountOptions {
  frameIntervalMs?: number;
  chunkByteSize?: number;
  payloadEncoding?: PayloadEncoding;
  symbolsPerFrame?: number;
  parityBlockDataChunks?: number;
  qrOptions?: Record<string, unknown>;
}

export interface SenderLoadOptions extends SenderMountOptions {
  sessionId?: string;
  fileName?: string;
  mimeType?: string;
}

export interface SendTextOptions extends SenderLoadOptions {}
export interface SendBinaryOptions extends SenderLoadOptions {}
export interface SendBlobOptions extends SenderLoadOptions {}
export interface SendFolderOptions extends SenderLoadOptions, ArchiveOptions {}

export interface PreparedTransferSummary {
  inputKind: "text" | "bytes" | "blob" | "folder";
  sessionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  totalChunks: number;
  totalFrames: number;
  symbolsPerFrame: number;
  parityBlockDataChunks: number;
  estimatedStats: TransferEstimate;
  archive?: ArchiveManifestPreview;
}

export interface SenderState {
  status: "idle" | "prepared" | "running" | "destroyed";
  target: HTMLElement;
  elements: {
    canvas: HTMLCanvasElement | null;
  };
  prepared: PreparedTransferSummary | null;
  inputKind: PreparedTransferSummary["inputKind"] | null;
  running: boolean;
}

export interface QrSenderController {
  loadText(text: string, options?: SendTextOptions): Promise<PreparedTransferSummary>;
  loadBytes(bytes: Uint8Array, options?: SendBinaryOptions): Promise<PreparedTransferSummary>;
  loadBlob(blob: Blob, options?: SendBlobOptions): Promise<PreparedTransferSummary>;
  loadFolder(inputs: ArrayLike<File>, options?: SendFolderOptions): Promise<PreparedTransferSummary>;
  start(): Promise<void>;
  stop(): void;
  clear(): void;
  destroy(): void;
  getState(): SenderState;
}

export interface ReceiverManifest {
  sessionId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  chunkByteSize: number;
  symbolsPerFrame: number;
  parityBlockDataChunks: number;
  totalChunks: number;
}

export interface ReceiverProgress {
  sessionId: string;
  receivedChunks: number;
  totalChunks: number;
  ratio: number;
}

export interface ReceiverDiagnostics {
  sessionId: string;
  totalFramesSeen: number;
  newFrames: number;
  duplicateFrames: number;
  uniqueFrameRatio: number;
  manifestFrames: number;
  chunkFrames: number;
  parityFrames: number;
  parityRecoveries: number;
  receivedChunks: number;
  totalChunks: number;
}

export type ReceiveResult =
  | {
      kind: "file";
      sessionId: string;
      blob: Blob;
      fileName: string;
      mimeType: string;
      size: number;
      totalChunks: number;
      receivedChunks: number;
    }
  | {
      kind: "folder";
      sessionId: string;
      archiveBlob: Blob;
      archiveFileName: string;
      extracted: ExtractedArchive;
      totalChunks: number;
      receivedChunks: number;
    };

export interface ReceiverMountOptions {
  scanIntervalMs?: number;
  autoStopOnComplete?: boolean;
  maxSymbolsPerFrame?: number;
  scanMaxDimension?: number;
  decoderAssetBaseUrl?: string;
  cameraOptimization?: boolean;
  cameraConstraints?: MediaStreamConstraints;
  onManifest?: (manifest: ReceiverManifest) => void;
  onProgress?: (progress: ReceiverProgress) => void;
  onDiagnostics?: (diagnostics: ReceiverDiagnostics) => void;
  onError?: (error: Error) => void;
  onCameraStart?: (payload: { stream: MediaStream }) => void;
  onCameraStop?: (payload: Record<string, never>) => void;
}

export interface ReceiverState {
  status: "idle" | "starting" | "scanning" | "stopped" | "completed" | "error" | "destroyed";
  target: HTMLElement;
  elements: {
    video: HTMLVideoElement | null;
    scanCanvas: HTMLCanvasElement | null;
  };
  manifest: ReceiverManifest | null;
  progress: ReceiverProgress | null;
  diagnostics: ReceiverDiagnostics | null;
  result: ReceiveResult | null;
  error: Error | null;
  scanning: boolean;
  decoderMode: {
    mode: string;
    reason?: unknown;
  } | null;
  camera: Record<string, unknown> | null;
}

export interface QrReceiverController {
  start(): Promise<ReceiveResult>;
  stop(): void;
  reset(): void;
  destroy(): void;
  getState(): ReceiverState;
}

export function createQrSender(target: HTMLElement, options?: SenderMountOptions): QrSenderController;
export function createQrReceiver(target: HTMLElement, options?: ReceiverMountOptions): QrReceiverController;

export function resolveTransferPreset(name?: string): TransferPreset;
export function estimateTransferStats(input: {
  fileSize: number;
  chunkByteSize?: number;
  frameIntervalMs?: number;
  symbolsPerFrame?: number;
  manifestFrames?: number;
  extraFrames?: number;
}): TransferEstimate;

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

export function createDownloadLink(
  result: {
    blob: Blob;
    fileName: string;
  },
  anchorElement?: HTMLAnchorElement | null
): {
  url: string;
  anchor: HTMLAnchorElement;
};
