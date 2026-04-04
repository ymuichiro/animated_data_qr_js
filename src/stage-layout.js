import { getGridDimensions } from "./grid.js";
export const CANONICAL_STAGE_SIZE = 1000;

const PLAIN_PAYLOAD_INSET = 104;
const PLAIN_PAYLOAD_GAP = 22;

function scaleValue(value, size) {
  return Math.round((value / CANONICAL_STAGE_SIZE) * size);
}

function createCellRects(symbolCount, payloadRect, gap) {
  if (symbolCount === 1) {
    return [{ ...payloadRect }];
  }

  if (symbolCount === 2) {
    const cellWidth = Math.floor((payloadRect.width - gap) / 2);
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
    const cellWidth = Math.floor((payloadRect.width - gap) / 2);
    const cellHeight = Math.floor((payloadRect.height - gap) / 2);
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

export function getPlainStageLayout(symbolCount = 1, size = CANONICAL_STAGE_SIZE) {
  const normalizedSymbolCount = normalizeStageSymbolCount(symbolCount);
  const payloadRect = {
    x: scaleValue(PLAIN_PAYLOAD_INSET, size),
    y: scaleValue(PLAIN_PAYLOAD_INSET, size),
    width: size - (scaleValue(PLAIN_PAYLOAD_INSET, size) * 2),
    height: size - (scaleValue(PLAIN_PAYLOAD_INSET, size) * 2)
  };

  return {
    size,
    symbolCount: normalizedSymbolCount,
    payloadRect,
    cells: createCellRects(
      normalizedSymbolCount,
      payloadRect,
      scaleValue(PLAIN_PAYLOAD_GAP, size)
    )
  };
}
