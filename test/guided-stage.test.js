import { describe, expect, it } from "vitest";
import {
  getStageLayout,
  getPlainStageLayout,
  getStageMarkerTargetPoints
} from "../src/stage-layout.js";
import {
  detectGuidedStage,
  computeHomography,
  applyHomography
} from "../src/calibration.js";

function createImageData(width, height, fill = 255) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = fill;
    data[index + 1] = fill;
    data[index + 2] = fill;
    data[index + 3] = 255;
  }
  return { data, width, height };
}

function fillRect(imageData, rect, color) {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(imageData.width, Math.ceil(rect.x + rect.width));
  const y1 = Math.min(imageData.height, Math.ceil(rect.y + rect.height));
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const index = ((y * imageData.width) + x) * 4;
      imageData.data[index] = color[0];
      imageData.data[index + 1] = color[1];
      imageData.data[index + 2] = color[2];
      imageData.data[index + 3] = color[3] ?? 255;
    }
  }
}

function createSyntheticStage(size) {
  const imageData = createImageData(size, size, 255);
  const layout = getStageLayout(1, size);
  fillRect(imageData, layout.outerFrame, [20, 24, 39, 255]);
  fillRect(imageData, {
    x: layout.outerFrame.x + layout.outerFrame.stroke,
    y: layout.outerFrame.y + layout.outerFrame.stroke,
    width: layout.outerFrame.width - (layout.outerFrame.stroke * 2),
    height: layout.outerFrame.height - (layout.outerFrame.stroke * 2)
  }, [255, 255, 255, 255]);
  for (const marker of layout.markerRects) {
    fillRect(imageData, marker, [20, 24, 39, 255]);
    fillRect(imageData, {
      x: marker.innerX,
      y: marker.innerY,
      width: marker.innerSize,
      height: marker.innerSize
    }, [255, 255, 255, 255]);
  }
  return imageData;
}

function warpNearest(imageData, destinationPoints, outputWidth, outputHeight) {
  const sourcePoints = getStageMarkerTargetPoints(imageData.width);
  const destinationToSource = computeHomography(destinationPoints, sourcePoints);
  const output = createImageData(outputWidth, outputHeight, 255);
  for (let y = 0; y < outputHeight; y += 1) {
    for (let x = 0; x < outputWidth; x += 1) {
      const source = applyHomography(destinationToSource, x, y);
      const sx = Math.max(0, Math.min(imageData.width - 1, Math.round(source.x)));
      const sy = Math.max(0, Math.min(imageData.height - 1, Math.round(source.y)));
      const sourceIndex = ((sy * imageData.width) + sx) * 4;
      const targetIndex = ((y * outputWidth) + x) * 4;
      output.data[targetIndex] = imageData.data[sourceIndex];
      output.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
      output.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
      output.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
    }
  }
  return output;
}

function averagePointDistance(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index += 1) {
    total += Math.hypot(left[index].x - right[index].x, left[index].y - right[index].y);
  }
  return total / left.length;
}

describe("guided stage layout", () => {
  it("keeps deterministic payload cells for 1, 2, and 4 symbols", () => {
    const single = getStageLayout(1, 1000);
    const dual = getStageLayout(2, 1000);
    const quad = getStageLayout(4, 1000);
    const plainSingle = getPlainStageLayout(1, 1000);
    const plainDual = getPlainStageLayout(2, 1000);

    expect(single.cells).toHaveLength(1);
    expect(single.cells[0]).toEqual(single.payloadRect);
    expect(dual.cells).toHaveLength(2);
    expect(dual.cells[0].y).toBe(dual.cells[1].y);
    expect(quad.cells).toHaveLength(4);
    expect(quad.cells[0].width).toBe(quad.cells[1].width);
    expect(quad.cells[0].height).toBe(quad.cells[2].height);
    expect(plainSingle.cells[0].width).toBeGreaterThan(single.cells[0].width);
    expect(plainDual.cells[0].width).toBeGreaterThan(dual.cells[0].width);
  });

  it("detects the guided fiducials after a mild perspective warp", () => {
    const synthetic = createSyntheticStage(420);
    const destinationPoints = [
      { x: 88, y: 92 },
      { x: 324, y: 70 },
      { x: 350, y: 334 },
      { x: 74, y: 346 }
    ];
    const warped = warpNearest(synthetic, destinationPoints, 420, 420);
    const detection = detectGuidedStage(warped);

    expect(detection).not.toBeNull();
    expect(averagePointDistance(detection.points, destinationPoints)).toBeLessThan(24);
  });

  it("maps four points through the homography consistently", () => {
    const source = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 120, y: 120 },
      { x: -10, y: 110 }
    ];
    const target = [
      { x: 10, y: 20 },
      { x: 210, y: 30 },
      { x: 220, y: 230 },
      { x: 0, y: 220 }
    ];
    const matrix = computeHomography(source, target);
    const projected = source.map((point) => applyHomography(matrix, point.x, point.y));
    expect(averagePointDistance(projected, target)).toBeLessThan(0.001);
  });
});
