function buildTileRegions(width, height, gridSize) {
  const regions = [];
  const seen = new Set();
  const expansionRatio = gridSize === 2 ? 1.36 : 1.24;
  const regionWidth = Math.min(width, Math.max(64, Math.round((width / gridSize) * expansionRatio)));
  const regionHeight = Math.min(height, Math.max(64, Math.round((height / gridSize) * expansionRatio)));
  const stepX = gridSize > 1 ? Math.max(1, Math.round((width - regionWidth) / (gridSize - 1))) : 0;
  const stepY = gridSize > 1 ? Math.max(1, Math.round((height - regionHeight) / (gridSize - 1))) : 0;

  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = Math.min(width - regionWidth, Math.max(0, column * stepX));
      const y = Math.min(height - regionHeight, Math.max(0, row * stepY));
      const key = `${x}:${y}:${regionWidth}:${regionHeight}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      regions.push({
        x,
        y,
        width: regionWidth,
        height: regionHeight,
        tryHarder: true
      });
    }
  }

  return regions;
}

export function buildDecodePasses(width, height) {
  return [
    {
      x: 0,
      y: 0,
      width,
      height,
      tryHarder: false
    },
    ...buildTileRegions(width, height, 2),
    ...buildTileRegions(width, height, 3)
  ];
}
