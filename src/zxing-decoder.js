import { prepareZXingModule, readBarcodes } from "zxing-wasm/reader";
import { DECODER_WASM_FILE_NAME } from "./decoder-assets.js";
import { cropImageData } from "./image-data.js";
import { parseFrame } from "./protocol.js";

const overrideCache = new Map();
const textEncoder = new TextEncoder();

function getModuleOverrides(wasmUrl) {
  let overrides = overrideCache.get(wasmUrl);
  if (overrides) {
    return overrides;
  }

  overrides = {
    locateFile(fileName) {
      if (fileName === DECODER_WASM_FILE_NAME) {
        return wasmUrl;
      }
      return new URL(fileName, wasmUrl).href;
    }
  };
  overrideCache.set(wasmUrl, overrides);
  return overrides;
}

function createReaderOptions(maxNumberOfSymbols, pass = {}) {
  const options = {
    formats: ["QRCode"],
    maxNumberOfSymbols: Math.max(1, maxNumberOfSymbols),
    tryHarder: Boolean(pass.tryHarder),
    tryRotate: true,
    tryInvert: Boolean(pass.tryInvert),
    tryDenoise: Boolean(pass.tryDenoise),
    tryDownscale: Boolean(pass.tryDownscale),
    textMode: "Plain"
  };
  if (Number.isFinite(pass.downscaleFactor)) {
    options.downscaleFactor = pass.downscaleFactor;
  }
  if (Number.isFinite(pass.downscaleThreshold)) {
    options.downscaleThreshold = pass.downscaleThreshold;
  }
  if (typeof pass.binarizer === "string" && pass.binarizer.length > 0) {
    options.binarizer = pass.binarizer;
  }
  return options;
}

function toFrameInput(result) {
  if (result?.bytes instanceof Uint8Array && result.bytes.length > 0) {
    return result.bytes.slice();
  }
  if (typeof result?.text === "string" && result.text.length > 0) {
    return textEncoder.encode(result.text);
  }
  return null;
}

function getFrameKey(frame) {
  if (!frame) {
    return null;
  }
  if (frame.type === "manifest") {
    return `M:${frame.sessionId}`;
  }
  if (frame.type === "chunk") {
    return `C:${frame.sessionId}:${frame.chunkIndex}`;
  }
  if (frame.type === "parity") {
    return `P:${frame.sessionId}:${frame.blockStartChunkIndex}`;
  }
  return null;
}

function getResultBounds(result, pass) {
  const position = result?.position;
  if (!position) {
    return null;
  }

  const points = [
    position.topLeft,
    position.topRight,
    position.bottomLeft,
    position.bottomRight
  ].filter(Boolean);

  if (points.length === 0) {
    return null;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    left: pass.x + Math.min(...xs),
    top: pass.y + Math.min(...ys),
    right: pass.x + Math.max(...xs),
    bottom: pass.y + Math.max(...ys)
  };
}

function getOverlapArea(region, bounds) {
  const left = Math.max(region.x, bounds.left);
  const top = Math.max(region.y, bounds.top);
  const right = Math.min(region.x + region.width, bounds.right);
  const bottom = Math.min(region.y + region.height, bounds.bottom);
  const width = right - left;
  const height = bottom - top;
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}

function getRegionPenalty(region, detectedBounds) {
  if (detectedBounds.length === 0) {
    return 0;
  }

  const regionArea = Math.max(1, region.width * region.height);
  let maxPenalty = 0;
  for (const bounds of detectedBounds) {
    maxPenalty = Math.max(maxPenalty, getOverlapArea(region, bounds) / regionArea);
  }
  return maxPenalty;
}

function takeNextPass(pendingPasses, detectedBounds) {
  if (pendingPasses.length <= 1 || detectedBounds.length === 0) {
    return pendingPasses.shift() ?? null;
  }

  let bestIndex = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let index = 0; index < pendingPasses.length; index += 1) {
    const penalty = getRegionPenalty(pendingPasses[index], detectedBounds);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestIndex = index;
    }
  }

  return pendingPasses.splice(bestIndex, 1)[0] ?? null;
}

export async function warmupZxingDecoder(wasmUrl) {
  return prepareZXingModule({
    overrides: getModuleOverrides(wasmUrl),
    fireImmediately: true
  });
}

export async function decodeImageDataWithZxing(imageData, {
  wasmUrl,
  passes,
  expectedSymbolsPerFrame
}) {
  const frameInputs = new Map();
  const detectedBounds = [];
  const pendingPasses = [...passes];

  while (pendingPasses.length > 0) {
    const pass = takeNextPass(pendingPasses, detectedBounds);
    if (!pass) {
      break;
    }
    const remainingSymbols = Math.max(1, expectedSymbolsPerFrame - frameInputs.size);
    const croppedImage = cropImageData(imageData, pass);
    const results = await readBarcodes(
      croppedImage,
      createReaderOptions(remainingSymbols, pass)
    );

    for (const result of results) {
      const frameInput = toFrameInput(result);
      if (!frameInput) {
        continue;
      }
      const parsed = parseFrame(frameInput);
      const frameKey = getFrameKey(parsed);
      if (frameKey) {
        if (!frameInputs.has(frameKey)) {
          const bounds = getResultBounds(result, pass);
          if (bounds) {
            detectedBounds.push(bounds);
          }
        }
        frameInputs.set(frameKey, frameInput);
      }
    }

    if (frameInputs.size >= expectedSymbolsPerFrame) {
      break;
    }
  }

  return Array.from(frameInputs.values());
}
