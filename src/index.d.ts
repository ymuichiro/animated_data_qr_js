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
  qrOptions?: Record<string, unknown>;
}

export interface ReceiverOptions {
  video?: HTMLVideoElement | null;
  scanIntervalMs?: number;
  autoStopOnComplete?: boolean;
  preferBarcodeDetector?: boolean;
  maxSymbolsPerFrame?: number;
  scanMaxDimension?: number;
  tileScanGridSizes?: number[];
  cameraConstraints?: MediaStreamConstraints;
  scanCanvas?: HTMLCanvasElement | null;
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

export function createDownloadLink(
  result: ReceivedTransfer,
  anchorElement?: HTMLAnchorElement | null
): {
  url: string;
  anchor: HTMLAnchorElement;
};
