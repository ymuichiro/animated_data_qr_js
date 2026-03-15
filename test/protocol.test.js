import { describe, expect, it } from "vitest";
import {
  PROTOCOL_MAGIC,
  encodeManifestFrame,
  encodeChunkFrame,
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
  });

  it("returns null for unrelated text", () => {
    expect(parseFrame("hello-world")).toBeNull();
  });
});
