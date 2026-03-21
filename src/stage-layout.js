import { getGridDimensions } from "./grid.js";

export const DEFAULT_STAGE_STYLE = "guided";
export const CANONICAL_STAGE_SIZE = 1000;

const OUTER_FRAME_INSET = 32;
const OUTER_FRAME_STROKE = 18;
const MARKER_SIZE = 112;
const MARKER_INNER_SIZE = 40;
const MARKER_CENTER_OFFSET = 138;
const PAYLOAD_INSET = 196;
const PAYLOAD_GAP = 28;

function scaleValue(value, size) {
  return Math.round((value / CANONICAL_STAGE_SIZE) * size);
}

function createCellRects(symbolCount, payloadRect) {
  if (symbolCount === 1) {
    return [{ ...payloadRect }];
  }

  if (symbolCount === 2) {
    const cellWidth = Math.floor((payloadRect.width - PAYLOAD_GAP) / 2);
    return [
      {
        x: payloadRect.x,
        y: payloadRect.y,
        width: cellWidth,
        height: payloadRect.height
      },
      {
        x: payloadRect.x + payloadRect.width - cellWidth,
        y: payloadRect.y,
        width: cellWidth,
        height: payloadRect.height
      }
    ];
  }

  if (symbolCount === 4) {
    const cellWidth = Math.floor((payloadRect.width - PAYLOAD_GAP) / 2);
    const cellHeight = Math.floor((payloadRect.height - PAYLOAD_GAP) / 2);
    return [
      { x: payloadRect.x, y: payloadRect.y, width: cellWidth, height: cellHeight },
      {
        x: payloadRect.x + payloadRect.width - cellWidth,
        y: payloadRect.y,
        width: cellWidth,
        height: cellHeight
      },
      {
        x: payloadRect.x,
        y: payloadRect.y + payloadRect.height - cellHeight,
        width: cellWidth,
        height: cellHeight
      },
      {
        x: payloadRect.x + payloadRect.width - cellWidth,
        y: payloadRect.y + payloadRect.height - cellHeight,
        width: cellWidth,
        height: cellHeight
      }
    ];
  }

  const { columns, rows } = getGridDimensions(symbolCount);
  const gap = PAYLOAD_GAP;
  const cellWidth = Math.floor((payloadRect.width - (gap * (columns - 1))) / columns);
  const cellHeight = Math.floor((payloadRect.height - (gap * (rows - 1))) / rows);
  const rects = [];
  for (let index = 0; index < symbolCount; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    rects.push({
      x: payloadRect.x + (column * (cellWidth + gap)),
      y: payloadRect.y + (row * (cellHeight + gap)),
      width: cellWidth,
      height: cellHeight
    });
  }
  return rects;
}

export function normalizeStageSymbolCount(symbolCount) {
  if (symbolCount === 1 || symbolCount === 2 || symbolCount === 4) {
    return symbolCount;
  }
  if (!Number.isInteger(symbolCount) || symbolCount <= 1) {
    return 1;
  }
  return symbolCount;
}

export function getStageLayout(symbolCount = 1, size = CANONICAL_STAGE_SIZE) {
  const normalizedSymbolCount = normalizeStageSymbolCount(symbolCount);
  const outerFrame = {
    x: scaleValue(OUTER_FRAME_INSET, size),
    y: scaleValue(OUTER_FRAME_INSET, size),
    width: size - (scaleValue(OUTER_FRAME_INSET, size) * 2),
    height: size - (scaleValue(OUTER_FRAME_INSET, size) * 2),
    stroke: Math.max(8, scaleValue(OUTER_FRAME_STROKE, size))
  };

  const payloadRect = {
    x: scaleValue(PAYLOAD_INSET, size),
    y: scaleValue(PAYLOAD_INSET, size),
    width: size - (scaleValue(PAYLOAD_INSET, size) * 2),
    height: size - (scaleValue(PAYLOAD_INSET, size) * 2)
  };

  const markerSize = Math.max(24, scaleValue(MARKER_SIZE, size));
  const markerInnerSize = Math.max(10, scaleValue(MARKER_INNER_SIZE, size));
  const markerOffset = scaleValue(MARKER_CENTER_OFFSET, size);
  const markerCenters = [
    { x: markerOffset, y: markerOffset },
    { x: size - markerOffset, y: markerOffset },
    { x: size - markerOffset, y: size - markerOffset },
    { x: markerOffset, y: size - markerOffset }
  ];
  const markerRects = markerCenters.map((center) => ({
    center,
    x: Math.round(center.x - (markerSize / 2)),
    y: Math.round(center.y - (markerSize / 2)),
    width: markerSize,
    height: markerSize,
    innerX: Math.round(center.x - (markerInnerSize / 2)),
    innerY: Math.round(center.y - (markerInnerSize / 2)),
    innerSize: markerInnerSize
  }));

  return {
    size,
    symbolCount: normalizedSymbolCount,
    outerFrame,
    payloadRect,
    markerCenters,
    markerRects,
    cells: createCellRects(normalizedSymbolCount, payloadRect)
  };
}

export function getStageMarkerTargetPoints(size = CANONICAL_STAGE_SIZE) {
  return getStageLayout(1, size).markerCenters;
}

function addPass(passes, seen, region) {
  const key = [region.x, region.y, region.width, region.height, Number(Boolean(region.tryHarder)), Number(Boolean(region.tryInvert))].join(":");
  if (!seen.has(key)) {
    seen.add(key);
    passes.push(region);
  }
}

function expandRegion(region, maxSize, paddingRatio = 0.1) {
  const padX = Math.round(region.width * paddingRatio);
  const padY = Math.round(region.height * paddingRatio);
  const x = Math.max(0, region.x - padX);
  const y = Math.max(0, region.y - padY);
  const right = Math.min(maxSize, region.x + region.width + padX);
  const bottom = Math.min(maxSize, region.y + region.height + padY);
  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y)
  };
}

export function buildGuidedDecodePasses(size, symbolCount = null) {
  const seen = new Set();
  const passes = [];

  addPass(passes, seen, {
    x: 0,
    y: 0,
    width: size,
    height: size,
    tryHarder: false,
    tryInvert: true,
    tryDenoise: true,
    binarizer: "LocalAverage"
  });

  const symbolCounts = symbolCount ? [normalizeStageSymbolCount(symbolCount)] : [1, 2, 4];
  for (const count of symbolCounts) {
    const layout = getStageLayout(count, size);
    for (const cell of layout.cells) {
      const expanded = expandRegion(cell, size, 0.14);
      addPass(passes, seen, {
        ...expanded,
        tryHarder: true,
        tryInvert: true,
        tryDenoise: true,
        binarizer: "LocalAverage"
      });
    }

    const payloadExpanded = expandRegion(layout.payloadRect, size, 0.05);
    const halfWidth = Math.floor((payloadExpanded.width - 16) / 2);
    const halfHeight = Math.floor((payloadExpanded.height - 16) / 2);
    addPass(passes, seen, {
      x: payloadExpanded.x,
      y: payloadExpanded.y,
      width: Math.max(1, halfWidth),
      height: Math.max(1, halfHeight),
      tryHarder: true,
      tryInvert: true,
      tryDenoise: true,
      binarizer: "GlobalHistogram"
    });
    addPass(passes, seen, {
      x: payloadExpanded.x + payloadExpanded.width - Math.max(1, halfWidth),
      y: payloadExpanded.y,
      width: Math.max(1, halfWidth),
      height: Math.max(1, halfHeight),
      tryHarder: true,
      tryInvert: true,
      tryDenoise: true,
      binarizer: "GlobalHistogram"
    });
    addPass(passes, seen, {
      x: payloadExpanded.x,
      y: payloadExpanded.y + payloadExpanded.height - Math.max(1, halfHeight),
      width: Math.max(1, halfWidth),
      height: Math.max(1, halfHeight),
      tryHarder: true,
      tryInvert: true,
      tryDenoise: true,
      binarizer: "GlobalHistogram"
    });
    addPass(passes, seen, {
      x: payloadExpanded.x + payloadExpanded.width - Math.max(1, halfWidth),
      y: payloadExpanded.y + payloadExpanded.height - Math.max(1, halfHeight),
      width: Math.max(1, halfWidth),
      height: Math.max(1, halfHeight),
      tryHarder: true,
      tryInvert: true,
      tryDenoise: true,
      binarizer: "GlobalHistogram"
    });
  }

  return passes;
}

export function drawGuidedStageFrame(context, size, symbolCount) {
  const layout = getStageLayout(symbolCount, size);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);

  context.strokeStyle = "#111827";
  context.lineWidth = layout.outerFrame.stroke;
  context.strokeRect(
    layout.outerFrame.x,
    layout.outerFrame.y,
    layout.outerFrame.width,
    layout.outerFrame.height
  );

  context.fillStyle = "#eff4fb";
  context.fillRect(
    layout.payloadRect.x,
    layout.payloadRect.y,
    layout.payloadRect.width,
    layout.payloadRect.height
  );

  for (const marker of layout.markerRects) {
    context.fillStyle = "#111827";
    context.fillRect(marker.x, marker.y, marker.width, marker.height);
    context.fillStyle = "#ffffff";
    context.fillRect(marker.innerX, marker.innerY, marker.innerSize, marker.innerSize);
  }

  return layout;
}
