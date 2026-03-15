import { describe, expect, it } from "vitest";
import {
  PROTOCOL_MAGIC,
  encodeManifestFrame,
  encodeChunkFrame,
  encodeChunkFrameBinary,
  encodeParityFrameBinary,
  parseFrame
} from "../src/index.js";

describe("protocol", () => {
  it("encodes and parses manifest frame", () => {
    const frameText = encodeManifestFrame({
      sessionId: "session123",
      totalChunks: 20,
      chunkByteSize: 180,
      fileSize: 9999,
      mimeType: "application/zip",
      fileName: "archive.zip"
    });

    expect(frameText.startsWith(`${PROTOCOL_MAGIC}|M|`)).toBe(true);

    const parsed = parseFrame(frameText);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("manifest");
    expect(parsed?.sessionId).toBe("session123");
    expect(parsed?.totalChunks).toBe(20);
    expect(parsed?.chunkByteSize).toBe(180);
    expect(parsed?.fileSize).toBe(9999);
    expect(parsed?.mimeType).toBe("application/zip");
    expect(parsed?.fileName).toBe("archive.zip");
    expect(parsed?.parityBlockDataChunks).toBe(0);
  });

  it("encodes and parses chunk frame", () => {
    const frameText = encodeChunkFrame({
      sessionId: "session123",
      chunkIndex: 4,
      totalChunks: 20,
      dataBase64Url: "QUJDRA"
    });

    const parsed = parseFrame(frameText);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("chunk");
    expect(parsed?.sessionId).toBe("session123");
    expect(parsed?.chunkIndex).toBe(4);
    expect(parsed?.totalChunks).toBe(20);
    expect(parsed?.dataBase64Url).toBe("QUJDRA");
    expect(Array.from(parsed?.dataBytes ?? [])).toEqual([65, 66, 67, 68]);
  });

  it("encodes and parses binary chunk frame", () => {
    const frameBytes = encodeChunkFrameBinary({
      sessionId: "session123",
      chunkIndex: 2,
      totalChunks: 20,
      dataBytes: new Uint8Array([1, 2, 3, 255])
    });

    const parsed = parseFrame(frameBytes);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("chunk");
    expect(parsed?.sessionId).toBe("session123");
    expect(parsed?.chunkIndex).toBe(2);
    expect(parsed?.totalChunks).toBe(20);
    expect(Array.from(parsed?.dataBytes ?? [])).toEqual([1, 2, 3, 255]);
  });

  it("encodes and parses binary parity frame", () => {
    const frameBytes = encodeParityFrameBinary({
      sessionId: "session123",
      blockStartChunkIndex: 8,
      totalChunks: 20,
      dataBytes: new Uint8Array([9, 8, 7, 6])
    });

    const parsed = parseFrame(frameBytes);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("parity");
    expect(parsed?.sessionId).toBe("session123");
    expect(parsed?.blockStartChunkIndex).toBe(8);
    expect(parsed?.totalChunks).toBe(20);
    expect(Array.from(parsed?.dataBytes ?? [])).toEqual([9, 8, 7, 6]);
  });

  it("returns null for unrelated text", () => {
    expect(parseFrame("hello-world")).toBeNull();
  });
});
