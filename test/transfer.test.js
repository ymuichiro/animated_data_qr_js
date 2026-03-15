import { describe, expect, it } from "vitest";
import {
  createTransferFrames,
  AnimatedQrReceiver
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
      receiver.ingestFrameText(frame);
    }

    expect(completed).not.toBeNull();
    expect(completed.sessionId).toBe("fixedsession");
    expect(completed.fileName).toBe("payload.txt");
    expect(completed.mimeType).toBe("text/plain");
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

    receiver.ingestFrameText(transfer.frames[0]);
    receiver.ingestFrameText(transfer.frames[1]);
    receiver.ingestFrameText(transfer.frames[1]);

    const progress = receiver.getProgress("dup-session");
    expect(progress).not.toBeNull();
    expect(progress?.receivedChunks).toBe(1);
  });
});
