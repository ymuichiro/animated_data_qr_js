import { CANONICAL_STAGE_SIZE, getStageMarkerTargetPoints } from "./stage-layout.js";
import { createImageDataFromBuffer } from "./image-data.js";

const DETECTION_MAX_DIMENSION = 320;
const LOCK_DISTANCE_RATIO = 0.04;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toGray(red, green, blue) {
  return Math.round((red * 0.299) + (green * 0.587) + (blue * 0.114));
}

function constrainSize(width, height, maxDimension) {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxDimension) {
    return { width, height, scale: 1 };
  }
  const scale = maxDimension / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale
  };
}

function resizeImageDataNearest(imageData, maxDimension = DETECTION_MAX_DIMENSION) {
  const { width, height } = constrainSize(imageData.width, imageData.height, maxDimension);
  if (width === imageData.width && height === imageData.height) {
    return {
      imageData,
      scaleX: 1,
      scaleY: 1
    };
  }

  const output = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(imageData.height - 1, Math.round((y / height) * imageData.height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(imageData.width - 1, Math.round((x / width) * imageData.width));
      const sourceIndex = ((sourceY * imageData.width) + sourceX) * 4;
      const targetIndex = ((y * width) + x) * 4;
      output[targetIndex] = imageData.data[sourceIndex];
      output[targetIndex + 1] = imageData.data[sourceIndex + 1];
      output[targetIndex + 2] = imageData.data[sourceIndex + 2];
      output[targetIndex + 3] = imageData.data[sourceIndex + 3];
    }
  }

  return {
    imageData: createImageDataFromBuffer(output.buffer, width, height),
    scaleX: imageData.width / width,
    scaleY: imageData.height / height
  };
}

function buildGrayHistogram(imageData) {
  const histogram = new Uint32Array(256);
  const grays = new Uint8Array(imageData.width * imageData.height);
  for (let index = 0, pixel = 0; index < imageData.data.length; index += 4, pixel += 1) {
    const gray = toGray(
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2]
    );
    histogram[gray] += 1;
    grays[pixel] = gray;
  }
  return { histogram, grays };
}

function computeOtsuThreshold(histogram, totalPixels) {
  let sum = 0;
  for (let tone = 0; tone < 256; tone += 1) {
    sum += tone * histogram[tone];
  }

  let sumBackground = 0;
  let weightBackground = 0;
  let bestVariance = -1;
  let threshold = 96;

  for (let tone = 0; tone < 256; tone += 1) {
    weightBackground += histogram[tone];
    if (weightBackground === 0) {
      continue;
    }

    const weightForeground = totalPixels - weightBackground;
    if (weightForeground === 0) {
      break;
    }

    sumBackground += tone * histogram[tone];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const betweenClassVariance = weightBackground * weightForeground * ((meanBackground - meanForeground) ** 2);

    if (betweenClassVariance > bestVariance) {
      bestVariance = betweenClassVariance;
      threshold = tone;
    }
  }

  return clamp(threshold, 24, 180);
}

function findConnectedComponents(grays, width, height, threshold) {
  const visited = new Uint8Array(width * height);
  const components = [];
  const queueX = new Int32Array(width * height);
  const queueY = new Int32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = (y * width) + x;
      if (visited[startIndex] || grays[startIndex] > threshold) {
        continue;
      }

      let head = 0;
      let tail = 0;
      visited[startIndex] = 1;
      queueX[tail] = x;
      queueY[tail] = y;
      tail += 1;

      let area = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let sumX = 0;
      let sumY = 0;

      while (head < tail) {
        const currentX = queueX[head];
        const currentY = queueY[head];
        head += 1;
        area += 1;
        sumX += currentX;
        sumY += currentY;
        minX = Math.min(minX, currentX);
        maxX = Math.max(maxX, currentX);
        minY = Math.min(minY, currentY);
        maxY = Math.max(maxY, currentY);

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (offsetX === 0 && offsetY === 0) {
              continue;
            }
            const nextX = currentX + offsetX;
            const nextY = currentY + offsetY;
            if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
              continue;
            }
            const nextIndex = (nextY * width) + nextX;
            if (visited[nextIndex] || grays[nextIndex] > threshold) {
              continue;
            }
            visited[nextIndex] = 1;
            queueX[tail] = nextX;
            queueY[tail] = nextY;
            tail += 1;
          }
        }
      }

      const componentWidth = maxX - minX + 1;
      const componentHeight = maxY - minY + 1;
      const bboxArea = componentWidth * componentHeight;
      components.push({
        area,
        minX,
        maxX,
        minY,
        maxY,
        width: componentWidth,
        height: componentHeight,
        fillRatio: area / Math.max(1, bboxArea),
        centroid: {
          x: sumX / area,
          y: sumY / area
        }
      });
    }
  }

  return components;
}

function filterMarkerCandidates(components, totalPixels) {
  return components
    .filter((component) => {
      const aspectRatio = component.width / Math.max(1, component.height);
      return (
        component.area >= totalPixels * 0.0007
        && component.area <= totalPixels * 0.12
        && aspectRatio >= 0.55
        && aspectRatio <= 1.85
        && component.fillRatio >= 0.42
        && component.width >= 10
        && component.height >= 10
      );
    })
    .sort((left, right) => right.area - left.area)
    .slice(0, 14);
}

function orderPoints(points) {
  const unique = Array.from(new Set(points));
  if (unique.length < 4) {
    return null;
  }
  const pointList = [...points];
  const topLeft = pointList.reduce((best, point) => ((point.x + point.y) < (best.x + best.y) ? point : best));
  const bottomRight = pointList.reduce((best, point) => ((point.x + point.y) > (best.x + best.y) ? point : best));
  const topRight = pointList.reduce((best, point) => ((point.x - point.y) > (best.x - best.y) ? point : best));
  const bottomLeft = pointList.reduce((best, point) => ((point.y - point.x) > (best.y - best.x) ? point : best));
  const ordered = [topLeft, topRight, bottomRight, bottomLeft];
  if (new Set(ordered).size < 4) {
    return null;
  }
  return ordered;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function polygonArea(points) {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    sum += (current.x * next.y) - (next.x * current.y);
  }
  return Math.abs(sum) / 2;
}

function* combinations(items, size, start = 0, prefix = []) {
  if (prefix.length === size) {
    yield prefix;
    return;
  }
  for (let index = start; index <= items.length - (size - prefix.length); index += 1) {
    yield* combinations(items, size, index + 1, [...prefix, items[index]]);
  }
}

function selectBestStage(candidates, totalPixels) {
  let best = null;

  for (const set of combinations(candidates, 4)) {
    const ordered = orderPoints(set.map((candidate) => candidate.centroid));
    if (!ordered) {
      continue;
    }

    const topWidth = distance(ordered[0], ordered[1]);
    const bottomWidth = distance(ordered[3], ordered[2]);
    const leftHeight = distance(ordered[0], ordered[3]);
    const rightHeight = distance(ordered[1], ordered[2]);
    const minSide = Math.min(topWidth, bottomWidth, leftHeight, rightHeight);
    const maxSide = Math.max(topWidth, bottomWidth, leftHeight, rightHeight);
    if (minSide < 24 || maxSide / Math.max(1, minSide) > 2.6) {
      continue;
    }

    const averageMarkerSize = set.reduce(
      (sum, candidate) => sum + Math.max(candidate.width, candidate.height),
      0
    ) / set.length;
    const markerToStageRatio = averageMarkerSize / Math.max(1, minSide);
    if (markerToStageRatio < 0.08 || markerToStageRatio > 0.24) {
      continue;
    }

    const area = polygonArea(ordered);
    if (area < totalPixels * 0.07) {
      continue;
    }

    const avgArea = set.reduce((sum, candidate) => sum + candidate.area, 0) / set.length;
    const sizeVariance = set.reduce((sum, candidate) => sum + Math.abs(candidate.area - avgArea), 0) / Math.max(1, avgArea);
    const symmetryPenalty = Math.abs(topWidth - bottomWidth) / Math.max(topWidth, bottomWidth)
      + Math.abs(leftHeight - rightHeight) / Math.max(leftHeight, rightHeight);
    const score = (area / totalPixels) * 10 - sizeVariance - symmetryPenalty;

    if (!best || score > best.score) {
      best = {
        score,
        points: ordered,
        candidates: set
      };
    }
  }

  return best;
}

export function detectGuidedStage(imageData) {
  const resized = resizeImageDataNearest(imageData);
  const { histogram, grays } = buildGrayHistogram(resized.imageData);
  const threshold = computeOtsuThreshold(histogram, grays.length);
  const components = findConnectedComponents(grays, resized.imageData.width, resized.imageData.height, threshold);
  const candidates = filterMarkerCandidates(components, grays.length);
  const selection = selectBestStage(candidates, grays.length);
  if (!selection) {
    return null;
  }

  return {
    threshold,
    points: selection.points.map((point) => ({
      x: point.x * resized.scaleX,
      y: point.y * resized.scaleY
    })),
    score: selection.score
  };
}

function solveLinearSystem(matrix, vector) {
  const size = vector.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let pivot = 0; pivot < size; pivot += 1) {
    let maxRow = pivot;
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[maxRow][pivot])) {
        maxRow = row;
      }
    }

    if (Math.abs(augmented[maxRow][pivot]) < 1e-8) {
      throw new Error("Could not solve the homography matrix");
    }

    if (maxRow !== pivot) {
      const tmp = augmented[pivot];
      augmented[pivot] = augmented[maxRow];
      augmented[maxRow] = tmp;
    }

    const pivotValue = augmented[pivot][pivot];
    for (let column = pivot; column <= size; column += 1) {
      augmented[pivot][column] /= pivotValue;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === pivot) {
        continue;
      }
      const factor = augmented[row][pivot];
      for (let column = pivot; column <= size; column += 1) {
        augmented[row][column] -= factor * augmented[pivot][column];
      }
    }
  }

  return augmented.map((row) => row[size]);
}

export function computeHomography(sourcePoints, targetPoints) {
  if (!Array.isArray(sourcePoints) || !Array.isArray(targetPoints) || sourcePoints.length !== 4 || targetPoints.length !== 4) {
    throw new TypeError("computeHomography requires 4 source points and 4 target points");
  }

  const matrix = [];
  const vector = [];

  for (let index = 0; index < 4; index += 1) {
    const source = sourcePoints[index];
    const target = targetPoints[index];
    matrix.push([source.x, source.y, 1, 0, 0, 0, -target.x * source.x, -target.x * source.y]);
    vector.push(target.x);
    matrix.push([0, 0, 0, source.x, source.y, 1, -target.y * source.x, -target.y * source.y]);
    vector.push(target.y);
  }

  const [h11, h12, h13, h21, h22, h23, h31, h32] = solveLinearSystem(matrix, vector);
  return [
    h11, h12, h13,
    h21, h22, h23,
    h31, h32, 1
  ];
}

export function applyHomography(matrix, x, y) {
  const denominator = (matrix[6] * x) + (matrix[7] * y) + matrix[8];
  if (Math.abs(denominator) < 1e-8) {
    return { x: 0, y: 0 };
  }
  return {
    x: ((matrix[0] * x) + (matrix[1] * y) + matrix[2]) / denominator,
    y: ((matrix[3] * x) + (matrix[4] * y) + matrix[5]) / denominator
  };
}

function sampleBilinear(imageData, x, y) {
  const sourceX = clamp(x, 0, imageData.width - 1);
  const sourceY = clamp(y, 0, imageData.height - 1);
  const x0 = Math.floor(sourceX);
  const y0 = Math.floor(sourceY);
  const x1 = Math.min(imageData.width - 1, x0 + 1);
  const y1 = Math.min(imageData.height - 1, y0 + 1);
  const dx = sourceX - x0;
  const dy = sourceY - y0;

  function pixel(offsetX, offsetY) {
    const index = ((offsetY * imageData.width) + offsetX) * 4;
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3]
    ];
  }

  const topLeft = pixel(x0, y0);
  const topRight = pixel(x1, y0);
  const bottomLeft = pixel(x0, y1);
  const bottomRight = pixel(x1, y1);
  const output = [0, 0, 0, 0];

  for (let channel = 0; channel < 4; channel += 1) {
    const top = topLeft[channel] + ((topRight[channel] - topLeft[channel]) * dx);
    const bottom = bottomLeft[channel] + ((bottomRight[channel] - bottomLeft[channel]) * dx);
    output[channel] = Math.round(top + ((bottom - top) * dy));
  }

  return output;
}

export function warpGuidedStage(imageData, sourcePoints, outputSize = 720) {
  const targetPoints = getStageMarkerTargetPoints(outputSize);
  const targetToSource = computeHomography(targetPoints, sourcePoints);
  const output = new Uint8ClampedArray(outputSize * outputSize * 4);

  for (let y = 0; y < outputSize; y += 1) {
    for (let x = 0; x < outputSize; x += 1) {
      const source = applyHomography(targetToSource, x, y);
      const [red, green, blue, alpha] = sampleBilinear(imageData, source.x, source.y);
      const index = ((y * outputSize) + x) * 4;
      output[index] = red;
      output[index + 1] = green;
      output[index + 2] = blue;
      output[index + 3] = alpha;
    }
  }

  return createImageDataFromBuffer(output.buffer, outputSize, outputSize);
}

export function isDetectionStable(previousPoints, nextPoints, referenceSize) {
  if (!previousPoints || !nextPoints || previousPoints.length !== 4 || nextPoints.length !== 4) {
    return false;
  }

  const totalDistance = previousPoints.reduce((sum, point, index) => sum + distance(point, nextPoints[index]), 0);
  const averageDistance = totalDistance / previousPoints.length;
  return averageDistance <= (referenceSize * LOCK_DISTANCE_RATIO);
}

export function getDetectionReferenceSize(points) {
  return Math.max(
    distance(points[0], points[1]),
    distance(points[1], points[2]),
    distance(points[2], points[3]),
    distance(points[3], points[0])
  );
}

export function getCanonicalStageSize(scanMaxDimension) {
  if (!Number.isInteger(scanMaxDimension) || scanMaxDimension <= 0) {
    return 720;
  }
  return clamp(scanMaxDimension, 480, CANONICAL_STAGE_SIZE);
}
