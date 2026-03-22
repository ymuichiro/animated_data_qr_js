import { describe, expect, it } from "vitest";
import { getPlainStageLayout } from "../src/stage-layout.js";

describe("plain stage layout", () => {
  it("keeps deterministic payload cells for 1, 2, and 4 symbols", () => {
    const single = getPlainStageLayout(1, 1000);
    const dual = getPlainStageLayout(2, 1000);
    const quad = getPlainStageLayout(4, 1000);

    expect(single.cells).toHaveLength(1);
    expect(single.cells[0]).toEqual(single.payloadRect);
    expect(dual.cells).toHaveLength(2);
    expect(dual.cells[0].y).toBe(dual.cells[1].y);
    expect(quad.cells).toHaveLength(4);
    expect(quad.cells[0].width).toBe(quad.cells[1].width);
    expect(quad.cells[0].height).toBe(quad.cells[2].height);
  });

  it("allocates a generous QR area for the plain stage", () => {
    const single = getPlainStageLayout(1, 1000);
    const dual = getPlainStageLayout(2, 1000);

    expect(single.cells[0].width).toBe(792);
    expect(single.cells[0].height).toBe(792);
    expect(dual.cells[0].width).toBe(385);
    expect(dual.cells[0].height).toBe(792);
  });
});
