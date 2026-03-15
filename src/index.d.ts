export type FrameParseResult =
  | {
      type: "manifest";
      sessionId: string;
      totalChunks: number;
      chunkByteSize: number;
      fileSize: number;
      mimeType: string;
      fileName: string;
    }
  | {
      type: "chunk";
      sessionId: string;
      chunkIndex: number;
      totalChunks: number;
      dataBase64Url: string;
    }
  | null;

export interface CreateTransferFramesOptions {
  chunkByteSize?: number;
  sessionId?: string;
  fileName?: string;
  mimeType?: string;
}

export interface PreparedTransfer {
  sessionId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  chunkByteSize: number;
  totalChunks: number;
  frames: string[];
}

export interface SenderOptions {
  canvas?: HTMLCanvasElement | null;
  frameIntervalMs?: number;
  chunkByteSize?: number;
  qrOptions?: Record<string, unknown>;
}

export interface ReceiverOptions {
  video?: HTMLVideoElement | null;
  scanIntervalMs?: number;
  autoStopOnComplete?: boolean;
  preferBarcodeDetector?: boolean;
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

export const PROTOCOL_MAGIC: string;
export function createSessionId(): string;
export function encodeManifestFrame(input: {
  sessionId: string;
  totalChunks: number;
  chunkByteSize: number;
  fileSize: number;
  mimeType: string;
  fileName: string;
}): string;
export function encodeChunkFrame(input: {
  sessionId: string;
  chunkIndex: number;
  totalChunks: number;
  dataBase64Url: string;
}): string;
export function parseFrame(frameText: string): FrameParseResult;

export function createTransferFrames(
  fileLike: Blob & { name?: string; type?: string },
  options?: CreateTransferFramesOptions
): Promise<PreparedTransfer>;

export class AnimatedQrSender {
  constructor(options?: SenderOptions);
  canvas: HTMLCanvasElement | null;
  frameIntervalMs: number;
  chunkByteSize: number;
  prepared: PreparedTransfer | null;
  frameIndex: number;
  running: boolean;
  setCanvas(canvas: HTMLCanvasElement): void;
  prepare(
    fileLike: Blob & { name?: string; type?: string },
    options?: CreateTransferFramesOptions
  ): Promise<PreparedTransfer>;
  getFrames(): string[];
  renderFrameAt(frameIndex: number): Promise<string>;
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
  ingestFrameText(frameText: string): {
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
