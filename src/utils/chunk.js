export function splitBytes(bytes, chunkByteSize) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("bytes must be Uint8Array");
  }
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }

  if (bytes.length === 0) {
    return [new Uint8Array(0)];
  }

  const chunks = [];
  for (let index = 0; index < bytes.length; index += chunkByteSize) {
    chunks.push(bytes.slice(index, index + chunkByteSize));
  }
  return chunks;
}

export function concatChunks(chunks, expectedSize = null) {
  if (!Array.isArray(chunks)) {
    throw new TypeError("chunks must be an array");
  }
  const totalSize = Number.isInteger(expectedSize) && expectedSize >= 0
    ? expectedSize
    : chunks.reduce((sum, chunk) => sum + chunk.length, 0);

  const output = new Uint8Array(totalSize);
  let offset = 0;

  for (const chunk of chunks) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("Each chunk must be Uint8Array");
    }
    if (offset >= output.length) {
      break;
    }
    const writableLength = Math.min(chunk.length, output.length - offset);
    output.set(chunk.subarray(0, writableLength), offset);
    offset += writableLength;
  }

  return output;
}
