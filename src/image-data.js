function createImageDataLike(data, width, height) {
  if (typeof ImageData === "function") {
    return new ImageData(data, width, height);
  }
  return {
    data,
    width,
    height
  };
}

export function createImageDataFromBuffer(buffer, width, height) {
  return createImageDataLike(new Uint8ClampedArray(buffer), width, height);
}

export function cropImageData(imageData, region) {
  const { data, width: sourceWidth, height: sourceHeight } = imageData;
  const x = Math.max(0, Math.min(sourceWidth, Math.round(region.x)));
  const y = Math.max(0, Math.min(sourceHeight, Math.round(region.y)));
  const width = Math.max(1, Math.min(sourceWidth - x, Math.round(region.width)));
  const height = Math.max(1, Math.min(sourceHeight - y, Math.round(region.height)));
  const output = new Uint8ClampedArray(width * height * 4);

  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((y + row) * sourceWidth * 4) + (x * 4);
    const sourceEnd = sourceStart + (width * 4);
    output.set(data.subarray(sourceStart, sourceEnd), row * width * 4);
  }

  return createImageDataLike(output, width, height);
}
