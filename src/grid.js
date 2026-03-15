export function getGridDimensions(symbolsPerFrame) {
  if (!Number.isInteger(symbolsPerFrame) || symbolsPerFrame <= 0) {
    throw new TypeError("symbolsPerFrame must be an integer > 0");
  }

  const columns = Math.ceil(Math.sqrt(symbolsPerFrame));
  const rows = Math.ceil(symbolsPerFrame / columns);
  return {
    columns,
    rows
  };
}

export function groupIntoBatches(items, batchSize) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new TypeError("batchSize must be an integer > 0");
  }

  const batches = [];
  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }
  return batches;
}
