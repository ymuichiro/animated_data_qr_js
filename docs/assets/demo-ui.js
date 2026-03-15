export const PRESET_CONTENT = Object.freeze({
  compatibility: {
    label: "Compatibility",
    tag: "Most forgiving",
    description: "Best for older phones, smaller screens, or imperfect lighting. This preset prioritizes reliable reads over raw throughput.",
    paceCaption: "Slower density for stable scanning",
    densityCaption: "One QR symbol per frame",
    protectionCaption: "Standard QR protection"
  },
  balanced: {
    label: "Balanced",
    tag: "Default choice",
    description: "A well-rounded preset for most demos. It raises throughput with two symbols per frame while keeping scanning comfortable.",
    paceCaption: "Fast enough for live demos",
    densityCaption: "Two QR symbols per frame",
    protectionCaption: "Standard QR protection"
  },
  throughput: {
    label: "Throughput",
    tag: "Fastest transfer",
    description: "Optimized for speed on bright displays and newer cameras. Use this when you want shorter transfer times and can keep devices steady.",
    paceCaption: "Maximum payload per frame",
    densityCaption: "Four QR symbols per frame",
    protectionCaption: "Lower error correction for capacity"
  },
  resilient: {
    label: "Resilient",
    tag: "Missed-frame recovery",
    description: "Adds parity recovery so an occasional missed symbol does not force another full loop. Great when the camera view is less stable.",
    paceCaption: "Balanced for real-world scans",
    densityCaption: "Two QR symbols plus recovery parity",
    protectionCaption: "Restores one missed chunk per block"
  }
});

function byId(id) {
  return document.getElementById(id);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

function formatRate(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return "0 B/s";
  }
  return `${formatBytes(bytesPerSecond)}/s`;
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "0s";
  }
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function describeEc(level) {
  if (level === "L") {
    return "Low correction";
  }
  if (level === "Q") {
    return "High correction";
  }
  if (level === "H") {
    return "Maximum correction";
  }
  return "Medium correction";
}

function describeProtection(preset) {
  if (preset.parityBlockDataChunks > 0) {
    return `Parity every ${preset.parityBlockDataChunks} chunks`;
  }
  return describeEc(preset.qrOptions?.errorCorrectionLevel || "M");
}

function setText(id, value) {
  const element = byId(id);
  if (element) {
    element.textContent = value;
  }
}

function setStatus({ tone, title, detail, legacy }) {
  const statusCard = byId("statusCard");
  const statusTitle = byId("statusTitle");
  const statusDetail = byId("statusDetail");
  const statusLegacy = byId("status");

  if (statusCard) {
    statusCard.dataset.tone = tone;
  }
  if (statusTitle) {
    statusTitle.textContent = title;
  }
  if (statusDetail) {
    statusDetail.textContent = detail;
  }
  if (statusLegacy) {
    statusLegacy.textContent = legacy || `${title}: ${detail}`;
  }
}

function openDialog(dialog) {
  if (!dialog) {
    return;
  }
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "open");
}

function closeDialog(dialog) {
  if (!dialog) {
    return;
  }
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
}

export function initDemoShell() {
  const helpBtn = byId("helpBtn");
  const helpDialog = byId("helpDialog");
  const helpCloseBtn = byId("helpCloseBtn");

  if (helpBtn && helpDialog) {
    helpBtn.addEventListener("click", () => {
      openDialog(helpDialog);
    });
  }

  if (helpCloseBtn && helpDialog) {
    helpCloseBtn.addEventListener("click", () => {
      closeDialog(helpDialog);
    });
  }

  if (helpDialog) {
    helpDialog.addEventListener("click", (event) => {
      if (event.target === helpDialog) {
        closeDialog(helpDialog);
      }
    });
  }
}

function createEstimate({ file, presetName, preset, estimateTransferStats }) {
  if (!file) {
    return null;
  }
  const totalChunks = Math.max(1, Math.ceil(file.size / preset.chunkByteSize));
  const extraFrames = preset.parityBlockDataChunks > 0
    ? Math.ceil(totalChunks / preset.parityBlockDataChunks)
    : 0;
  const estimate = estimateTransferStats({
    fileSize: file.size,
    chunkByteSize: preset.chunkByteSize,
    frameIntervalMs: preset.frameIntervalMs,
    symbolsPerFrame: preset.symbolsPerFrame,
    extraFrames
  });
  return {
    ...estimate,
    presetName,
    preset
  };
}

function renderPresetCard(presetName, preset) {
  const content = PRESET_CONTENT[presetName] || PRESET_CONTENT.compatibility;
  setText("presetTitle", content.label);
  setText("presetTag", content.tag);
  setText("presetDescription", content.description);
  setText("presetMetricPace", `${preset.frameIntervalMs} ms per frame`);
  setText("presetMetricPaceCaption", content.paceCaption);
  setText("presetMetricDensity", `${preset.symbolsPerFrame} QR ${preset.symbolsPerFrame === 1 ? "symbol" : "symbols"}`);
  setText("presetMetricDensityCaption", content.densityCaption);
  setText("presetMetricProtection", describeProtection(preset));
  setText("presetMetricProtectionCaption", content.protectionCaption);
}

function renderSenderEstimate({ file, presetName, preset, estimateTransferStats }) {
  const estimate = createEstimate({ file, presetName, preset, estimateTransferStats });
  if (!estimate) {
    setText("fileName", "No file selected yet");
    setText("fileSize", "Choose a file to see an estimate.");
    setText("statLoop", "Waiting for file");
    setText("statSpeed", "0 B/s");
    setText("statFrames", "0 display frames");
    setText("statChunks", "0 chunks");
    return;
  }

  setText("fileName", file.name || "Unnamed file");
  setText("fileSize", `${formatBytes(file.size)} projected with ${PRESET_CONTENT[presetName]?.label || presetName}`);
  setText("statLoop", formatDuration(estimate.loopDurationMs));
  setText("statSpeed", formatRate(estimate.bytesPerSecond));
  setText("statFrames", `${estimate.totalFrames} frames per loop`);
  setText("statChunks", `${estimate.totalChunks} data chunks`);
}

export function initSenderDemo({
  AnimatedQrSender,
  resolveTransferPreset,
  estimateTransferStats
}) {
  initDemoShell();

  const fileInput = byId("fileInput");
  const presetSelect = byId("presetSelect");
  const prepareBtn = byId("prepareBtn");
  const startBtn = byId("startBtn");
  const stopBtn = byId("stopBtn");
  const canvas = byId("qrCanvas");

  const sender = new AnimatedQrSender({
    canvas,
    qrOptions: {
      margin: 1,
      scale: 6
    }
  });

  const state = {
    file: null,
    prepared: false,
    running: false
  };

  function getCurrentPreset() {
    const presetName = presetSelect?.value || "balanced";
    return {
      presetName,
      preset: resolveTransferPreset(presetName)
    };
  }

  function syncButtonState() {
    if (prepareBtn) {
      prepareBtn.disabled = !state.file;
    }
    if (startBtn) {
      startBtn.disabled = !state.prepared || state.running;
    }
    if (stopBtn) {
      stopBtn.disabled = !state.running && !state.prepared;
    }
  }

  function markNeedsPrepare(reason = "Choose a file and prepare a transfer.") {
    state.prepared = false;
    if (!state.running) {
      const tone = state.file ? "warning" : "idle";
      const title = state.file ? "Ready to prepare" : "Select a file";
      setStatus({
        tone,
        title,
        detail: reason,
        legacy: `status: ${title.toLowerCase()} - ${reason}`
      });
    }
    syncButtonState();
  }

  function renderSelectedPreset() {
    const { presetName, preset } = getCurrentPreset();
    renderPresetCard(presetName, preset);
    renderSenderEstimate({
      file: state.file,
      presetName,
      preset,
      estimateTransferStats
    });
  }

  sender.on("prepared", (payload) => {
    state.prepared = true;
    state.running = false;
    setText("stageMeta", `Prepared ${payload.displayFrames.length} display frames for ${payload.fileName}`);
    setText("statLoop", formatDuration(payload.estimatedStats.loopDurationMs));
    setText("statSpeed", formatRate(payload.estimatedStats.bytesPerSecond));
    setText("statFrames", `${payload.estimatedStats.totalFrames} frames per loop`);
    setText("statChunks", `${payload.totalChunks} data chunks`);
    setStatus({
      tone: "ready",
      title: "Transfer prepared",
      detail: "Start the broadcast when the receiver is already scanning.",
      legacy: `prepared: ${payload.fileName}`
    });
    syncButtonState();
  });

  sender.on("start", ({ frameCount }) => {
    state.running = true;
    setText("stageMeta", `Broadcasting across ${frameCount} display frames`);
    setStatus({
      tone: "live",
      title: "Broadcast running",
      detail: "Keep the sender bright, steady, and fully visible to the camera.",
      legacy: "status: broadcasting"
    });
    syncButtonState();
  });

  sender.on("frame", ({ frameIndex, symbolCount }) => {
    setText("stageMeta", `Live frame ${frameIndex + 1}  |  ${symbolCount} QR ${symbolCount === 1 ? "symbol" : "symbols"} visible`);
  });

  sender.on("stop", () => {
    state.running = false;
    setStatus({
      tone: state.prepared ? "ready" : "idle",
      title: state.prepared ? "Broadcast stopped" : "Select a file",
      detail: state.prepared
        ? "You can start again immediately or prepare a different file."
        : "Choose a file and prepare a transfer.",
      legacy: "status: stopped"
    });
    syncButtonState();
  });

  sender.on("error", ({ error }) => {
    state.running = false;
    setStatus({
      tone: "error",
      title: "Sender error",
      detail: error?.message || String(error),
      legacy: `error: ${error?.message || String(error)}`
    });
    syncButtonState();
  });

  fileInput?.addEventListener("change", () => {
    state.file = fileInput.files?.[0] || null;
    renderSelectedPreset();
    markNeedsPrepare(
      state.file
        ? "The selected file is ready. Prepare a transfer to generate the QR loop."
        : "Choose a file to continue."
    );
  });

  presetSelect?.addEventListener("change", () => {
    renderSelectedPreset();
    if (state.running) {
      sender.stop();
    }
    markNeedsPrepare(
      state.file
        ? "Preset updated. Prepare again to apply the new transfer profile."
        : "Choose a file to see the preset estimate."
    );
  });

  prepareBtn?.addEventListener("click", async () => {
    if (!state.file) {
      setStatus({
        tone: "warning",
        title: "Select a file",
        detail: "A file is required before the transfer can be prepared.",
        legacy: "status: select a file"
      });
      return;
    }

    const { presetName, preset } = getCurrentPreset();
    renderPresetCard(presetName, preset);

    if (state.running) {
      sender.stop();
    }

    sender.chunkByteSize = preset.chunkByteSize;
    sender.frameIntervalMs = preset.frameIntervalMs;
    sender.payloadEncoding = preset.payloadEncoding;
    sender.symbolsPerFrame = preset.symbolsPerFrame;
    sender.parityBlockDataChunks = preset.parityBlockDataChunks;
    sender.qrOptions.errorCorrectionLevel = preset.qrOptions.errorCorrectionLevel;

    setStatus({
      tone: "working",
      title: "Preparing transfer",
      detail: "Splitting the file into QR frames and calculating the loop estimate.",
      legacy: "status: preparing"
    });

    try {
      await sender.prepare(state.file, {
        chunkByteSize: preset.chunkByteSize,
        payloadEncoding: preset.payloadEncoding,
        symbolsPerFrame: preset.symbolsPerFrame,
        parityBlockDataChunks: preset.parityBlockDataChunks,
        frameIntervalMs: preset.frameIntervalMs
      });
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Preparation failed",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
    }
  });

  startBtn?.addEventListener("click", async () => {
    if (!state.prepared) {
      setStatus({
        tone: "warning",
        title: "Prepare first",
        detail: "Prepare the selected file before starting the QR broadcast.",
        legacy: "status: prepare first"
      });
      return;
    }

    try {
      await sender.start();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Could not start",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
    }
  });

  stopBtn?.addEventListener("click", () => {
    sender.stop();
  });

  renderSelectedPreset();
  setText("stageMeta", "The QR stage will appear here after you prepare a transfer.");
  setStatus({
    tone: "idle",
    title: "Select a file",
    detail: "Choose a file and preset, then prepare the transfer.",
    legacy: "status: idle"
  });
  syncButtonState();
}

export function initReceiverDemo({
  AnimatedQrReceiver,
  createDownloadLink
}) {
  initDemoShell();

  const video = byId("video");
  const startBtn = byId("startBtn");
  const stopBtn = byId("stopBtn");
  const download = byId("download");
  let downloadUrl = null;

  const receiver = new AnimatedQrReceiver({
    video,
    scanIntervalMs: 100,
    maxSymbolsPerFrame: 4,
    autoStopOnComplete: true
  });

  function syncButtons(scanning) {
    if (startBtn) {
      startBtn.disabled = Boolean(scanning);
    }
    if (stopBtn) {
      stopBtn.disabled = !scanning && !receiver.stream;
    }
  }

  function hideDownload() {
    if (download) {
      download.classList.add("hide");
      download.textContent = "Download restored file";
    }
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = null;
    }
  }

  receiver.on("camera-start", () => {
    setText("stageMeta", "Camera is live. Aim at the sender screen and keep the full QR area visible.");
    syncButtons(true);
  });

  receiver.on("scan-start", () => {
    setStatus({
      tone: "live",
      title: "Scanning in progress",
      detail: "Keep both devices steady while the receiver collects frames.",
      legacy: "status: scanning"
    });
    syncButtons(true);
  });

  receiver.on("scan-stop", () => {
    syncButtons(false);
  });

  receiver.on("camera-stop", () => {
    syncButtons(false);
  });

  receiver.on("manifest", (payload) => {
    setText("manifestName", payload.fileName);
    setText(
      "manifestMeta",
      `${formatBytes(payload.fileSize)}  |  ${payload.totalChunks} chunks  |  ${payload.symbolsPerFrame} QR/frame  |  ${describeProtection(payload)}`
    );
  });

  receiver.on("progress", (payload) => {
    const percent = Math.round(payload.ratio * 100);
    const progressBar = byId("progressBar");
    const progressText = byId("progressText");
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = `${percent}%  |  ${payload.receivedChunks}/${payload.totalChunks} chunks received`;
    }
    setStatus({
      tone: payload.ratio >= 1 ? "complete" : "live",
      title: payload.ratio >= 1 ? "Transfer complete" : "Receiving frames",
      detail: payload.ratio >= 1
        ? "The file is ready to download below."
        : "Keep scanning until every chunk is collected.",
      legacy: `receiving: ${payload.receivedChunks}/${payload.totalChunks}`
    });
  });

  receiver.on("complete", (result) => {
    hideDownload();
    const { url, anchor } = createDownloadLink(result, download);
    downloadUrl = url;
    anchor.textContent = `Download ${result.fileName} (${formatBytes(result.size)})`;
    anchor.classList.remove("hide");
    anchor.addEventListener("click", () => {
      setTimeout(() => {
        if (downloadUrl) {
          URL.revokeObjectURL(downloadUrl);
          downloadUrl = null;
        }
      }, 2000);
    }, { once: true });

    const progressBar = byId("progressBar");
    const progressText = byId("progressText");
    if (progressBar) {
      progressBar.style.width = "100%";
    }
    if (progressText) {
      progressText.textContent = `100%  |  ${result.receivedChunks}/${result.totalChunks} chunks received`;
    }
    setText("manifestName", result.fileName);
    setText("manifestMeta", `${formatBytes(result.size)}  |  Ready to save`);
    setStatus({
      tone: "complete",
      title: "Transfer complete",
      detail: "Download the reconstructed file from the button below.",
      legacy: "status: complete"
    });
    syncButtons(false);
  });

  receiver.on("error", ({ error }) => {
    setStatus({
      tone: "error",
      title: "Receiver error",
      detail: error?.message || String(error),
      legacy: `error: ${error?.message || String(error)}`
    });
    syncButtons(false);
  });

  startBtn?.addEventListener("click", async () => {
    hideDownload();
    receiver.reset();
    setText("manifestName", "Waiting for sender manifest");
    setText("manifestMeta", "The file details will appear here once the first manifest is read.");
    const progressBar = byId("progressBar");
    const progressText = byId("progressText");
    if (progressBar) {
      progressBar.style.width = "0%";
    }
    if (progressText) {
      progressText.textContent = "0%  |  No chunks received yet";
    }

    try {
      await receiver.start();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Camera access failed",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
    }
  });

  stopBtn?.addEventListener("click", () => {
    receiver.stop();
    receiver.stopCamera();
    setStatus({
      tone: "idle",
      title: "Receiver stopped",
      detail: "You can start scanning again whenever you are ready.",
      legacy: "status: stopped"
    });
    syncButtons(false);
  });

  hideDownload();
  setText("manifestName", "Waiting for sender manifest");
  setText("manifestMeta", "The file details will appear here once the first manifest is read.");
  setText("stageMeta", "Grant camera access, then point at the sender screen from a comfortable distance.");
  const progressText = byId("progressText");
  if (progressText) {
    progressText.textContent = "0%  |  No chunks received yet";
  }
  setStatus({
    tone: "idle",
    title: "Start the receiver",
    detail: "Open the sender on another screen and begin scanning when it is ready.",
    legacy: "status: idle"
  });
  syncButtons(false);
}
