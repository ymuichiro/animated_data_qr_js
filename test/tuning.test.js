import { describe, expect, it } from "vitest";
import {
  TRANSFER_PRESETS,
  resolveTransferPreset
} from "../src/tuning.js";

describe("transfer presets", () => {
  it("defaults to the compatibility preset", () => {
    expect(resolveTransferPreset()).toEqual({
      frameIntervalMs: 250,
      chunkByteSize: 220,
      payloadEncoding: "binary",
      symbolsPerFrame: 1,
      parityBlockDataChunks: 4,
      qrOptions: {
        errorCorrectionLevel: "M"
      }
    });
  });

  it("exposes stronger tail-recovery parity for compatibility-oriented presets", () => {
    expect(TRANSFER_PRESETS.compatibility.parityBlockDataChunks).toBe(4);
    expect(TRANSFER_PRESETS.balanced.parityBlockDataChunks).toBe(6);
    expect(TRANSFER_PRESETS.throughput.parityBlockDataChunks).toBe(0);
    expect(TRANSFER_PRESETS.resilient.parityBlockDataChunks).toBe(4);
  });
});
