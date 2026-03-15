import { describe, expect, it } from "vitest";
import {
  createTransferFrames,
  AnimatedQrReceiver,
  estimateTransferStats,
  parseFrame
} from "../src/index.js";

function createFakeFile(name, type, bytes) {
  return {
    name,
    type,
    async arrayBuffer() {
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }
  };
}

describe("transfer flow", () => {
  it("reconstructs file after receiving all frames", async () => {
    const inputBytes = new TextEncoder().encode(
      "animated qr file transfer test payload 0123456789"
    );

    const transfer = await createTransferFrames(
      createFakeFile("payload.txt", "text/plain", inputBytes),
      {
        chunkByteSize: 8,
        sessionId: "fixedsession"
      }
    );

    const receiver = new AnimatedQrReceiver({
      autoStopOnComplete: false
    });

    let completed = null;
    receiver.on("complete", (payload) => {
      completed = payload;
    });

    for (const frame of transfer.frames) {
      receiver.ingestFrame(frame);
    }

    expect(completed).not.toBeNull();
    expect(completed.sessionId).toBe("fixedsession");
    expect(completed.fileName).toBe("payload.txt");
    expect(completed.mimeType).toBe("text/plain");
    expect(transfer.payloadEncoding).toBe("binary");
    const outputBytes = new Uint8Array(await completed.blob.arrayBuffer());
    expect(Array.from(outputBytes)).toEqual(Array.from(inputBytes));
  });

  it("ignores duplicate chunks", async () => {
    const inputBytes = new TextEncoder().encode("hello duplicate");
    const transfer = await createTransferFrames(
      createFakeFile("dup.txt", "text/plain", inputBytes),
      {
        chunkByteSize: 4,
        sessionId: "dup-session"
      }
    );
    const receiver = new AnimatedQrReceiver({
      autoStopOnComplete: false
    });

    receiver.ingestFrame(transfer.frames[0]);
    receiver.ingestFrame(transfer.frames[1]);
    receiver.ingestFrame(transfer.frames[1]);

    const progress = receiver.getProgress("dup-session");
    expect(progress).not.toBeNull();
    expect(progress?.receivedChunks).toBe(1);
  });

  it("estimates loop duration and throughput", () => {
    const stats = estimateTransferStats({
      fileSize: 1024,
      chunkByteSize: 256,
      frameIntervalMs: 250
    });

    expect(stats.totalChunks).toBe(4);
    expect(stats.totalFrames).toBe(5);
    expect(stats.loopDurationMs).toBe(1250);
    expect(stats.bytesPerSecond).toBeCloseTo(819.2, 1);
  });

  it("recovers one missing chunk per parity block", async () => {
    const inputBytes = new TextEncoder().encode("abcdefgh12345678ABCDEFGH");
    const transfer = await createTransferFrames(
      createFakeFile("parity.txt", "text/plain", inputBytes),
      {
        chunkByteSize: 4,
        sessionId: "parity-session",
        parityBlockDataChunks: 2
      }
    );

    const receiver = new AnimatedQrReceiver({
      autoStopOnComplete: false
    });

    let recoveredChunkIndex = null;
    let completed = null;
    receiver.on("recover", (payload) => {
      recoveredChunkIndex = payload.chunkIndex;
    });
    receiver.on("complete", (payload) => {
      completed = payload;
    });

    for (const frame of transfer.frames) {
      const parsed = parseFrame(frame);
      if (parsed?.type === "chunk" && parsed.chunkIndex === 1) {
        continue;
      }
      receiver.ingestFrame(frame);
    }

    expect(recoveredChunkIndex).toBe(1);
    expect(completed).not.toBeNull();
    const outputBytes = new Uint8Array(await completed.blob.arrayBuffer());
    expect(Array.from(outputBytes)).toEqual(Array.from(inputBytes));
  });
});
