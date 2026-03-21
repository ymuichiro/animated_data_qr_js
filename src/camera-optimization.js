function normalizeCapabilityList(value) {
  return Array.isArray(value) ? value : [];
}

function getNumericCapabilityRange(capability) {
  if (!capability || typeof capability !== "object") {
    return null;
  }
  const min = Number.isFinite(capability.min) ? capability.min : null;
  const max = Number.isFinite(capability.max) ? capability.max : null;
  if (min === null && max === null) {
    return null;
  }
  return { min, max };
}

function clampNumber(value, range) {
  if (!range) {
    return value;
  }
  const min = range.min ?? value;
  const max = range.max ?? value;
  return Math.max(min, Math.min(max, value));
}

function chooseResolution(range, preferredValue) {
  if (!range) {
    return undefined;
  }
  const ideal = clampNumber(preferredValue, range);
  return { ideal };
}

export async function optimizeCameraTrack(track, options = {}) {
  if (!track || typeof track.applyConstraints !== "function") {
    return {
      optimized: false,
      reason: "Track constraints are not supported",
      settings: typeof track?.getSettings === "function" ? track.getSettings() : {}
    };
  }

  const capabilities = typeof track.getCapabilities === "function"
    ? (track.getCapabilities() ?? {})
    : {};
  const settings = typeof track.getSettings === "function"
    ? (track.getSettings() ?? {})
    : {};

  const constraint = {};
  const advanced = [];

  const widthRange = getNumericCapabilityRange(capabilities.width);
  const heightRange = getNumericCapabilityRange(capabilities.height);
  const frameRateRange = getNumericCapabilityRange(capabilities.frameRate);

  const width = chooseResolution(widthRange, options.preferredWidth ?? 1280);
  const height = chooseResolution(heightRange, options.preferredHeight ?? 720);
  if (width) {
    constraint.width = width;
  }
  if (height) {
    constraint.height = height;
  }
  if (frameRateRange) {
    constraint.frameRate = {
      ideal: clampNumber(options.preferredFrameRate ?? 30, frameRateRange),
      max: clampNumber(options.maxFrameRate ?? 30, frameRateRange)
    };
  }

  const resizeModes = normalizeCapabilityList(capabilities.resizeMode);
  if (resizeModes.includes("none")) {
    advanced.push({ resizeMode: "none" });
  }

  const focusModes = normalizeCapabilityList(capabilities.focusMode);
  if (focusModes.includes("continuous")) {
    advanced.push({ focusMode: "continuous" });
  } else if (focusModes.includes("single-shot")) {
    advanced.push({ focusMode: "single-shot" });
  }

  const zoomRange = getNumericCapabilityRange(capabilities.zoom);
  if (zoomRange) {
    advanced.push({
      zoom: clampNumber(options.preferredZoom ?? (zoomRange.min ?? 1), {
        min: zoomRange.min ?? 1,
        max: Math.max(zoomRange.min ?? 1, Math.min(zoomRange.max ?? 1, 1.6))
      })
    });
  }

  if (advanced.length > 0) {
    constraint.advanced = advanced;
  }

  try {
    await track.applyConstraints(constraint);
    return {
      optimized: true,
      capabilities,
      settings: typeof track.getSettings === "function" ? track.getSettings() : settings,
      appliedConstraints: constraint
    };
  } catch (error) {
    return {
      optimized: false,
      capabilities,
      settings: typeof track.getSettings === "function" ? track.getSettings() : settings,
      appliedConstraints: constraint,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
