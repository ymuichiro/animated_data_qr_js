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
    setText("estimateHeadline", "Pick a file to see the expected loop time.");
    setText("estimateDetail", "The sender stage opens in a focused modal so the main page stays compact.");
    return;
  }

  setText("estimateHeadline", `Expected loop time: ${formatDuration(estimate.loopDurationMs)}`);
  setText(
    "estimateDetail",
    `${file.name || "Unnamed file"}  |  ${formatBytes(file.size)}  |  ${PRESET_CONTENT[presetName]?.label || presetName} preset`
  );
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
  const openStageBtn = byId("openStageBtn");
  const canvas = byId("qrCanvas");
  const stageDialog = byId("stageDialog");
  const stageCloseBtn = byId("stageCloseBtn");
  const modalStartBtn = byId("modalStartBtn");
  const modalStopBtn = byId("modalStopBtn");

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

  function openStageDialog() {
    openDialog(stageDialog);
  }

  function closeStageDialog() {
    if (state.running) {
      sender.stop();
    }
    closeDialog(stageDialog);
  }

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
    if (openStageBtn) {
      openStageBtn.disabled = !state.prepared;
    }
    if (modalStartBtn) {
      modalStartBtn.disabled = !state.prepared || state.running;
    }
    if (modalStopBtn) {
      modalStopBtn.disabled = !state.running;
    }
  }

  function markNeedsPrepare(reason = "Choose a file and prepare a transfer.") {
    state.prepared = false;
    closeDialog(stageDialog);
    setText("stageMeta", "Prepare a transfer to preview the sender screen here.");
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
    setText("estimateHeadline", `Expected loop time: ${formatDuration(payload.estimatedStats.loopDurationMs)}`);
    setText("estimateDetail", `${payload.fileName}  |  ${formatBytes(payload.fileSize)}  |  ${payload.totalChunks} chunks`);
    setStatus({
      tone: "ready",
      title: "Transfer prepared",
      detail: "Open the QR stage and start the broadcast when the receiver is already scanning.",
      legacy: `prepared: ${payload.fileName}`
    });
    void sender.renderFrameAt(0).catch(() => {});
    syncButtonState();
  });

  sender.on("start", ({ frameCount }) => {
    state.running = true;
    openStageDialog();
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
    if (state.running) {
      sender.stop();
    }
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

  async function startBroadcast() {
    if (!state.prepared) {
      setStatus({
        tone: "warning",
        title: "Prepare first",
        detail: "Prepare the selected file before opening the QR broadcast stage.",
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
  }

  function stopBroadcast() {
    sender.stop();
  }

  openStageBtn?.addEventListener("click", () => {
    openStageDialog();
  });

  modalStartBtn?.addEventListener("click", () => {
    void startBroadcast();
  });

  modalStopBtn?.addEventListener("click", () => {
    stopBroadcast();
  });

  stageCloseBtn?.addEventListener("click", () => {
    closeStageDialog();
  });

  stageDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeStageDialog();
  });

  stageDialog?.addEventListener("click", (event) => {
    if (event.target === stageDialog) {
      closeStageDialog();
    }
  });

  renderSelectedPreset();
  setText("stageMeta", "Prepare a transfer to preview the sender screen here.");
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
  const openScanStageBtn = byId("openScanStageBtn");
  const startBtn = byId("startBtn");
  const stopBtn = byId("stopBtn");
  const scanDialog = byId("scanDialog");
  const scanCloseBtn = byId("scanCloseBtn");
  const download = byId("download");
  let downloadUrl = null;

  const receiver = new AnimatedQrReceiver({
    video,
    scanIntervalMs: 100,
    maxSymbolsPerFrame: 4,
    autoStopOnComplete: true
  });

  function openScanDialog() {
    openDialog(scanDialog);
  }

  function closeScanDialog() {
    receiver.stop();
    receiver.stopCamera();
    closeDialog(scanDialog);
  }

  function syncButtons(scanning) {
    if (openScanStageBtn) {
      openScanStageBtn.disabled = false;
    }
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
    openScanDialog();
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
    if (payload.ratio >= 1) {
      setText("stageMeta", "Transfer complete. You can save the reconstructed file from the main page.");
    }
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
    setText("stageMeta", "Transfer complete. The main page now shows the download action.");
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

  openScanStageBtn?.addEventListener("click", () => {
    openScanDialog();
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
    closeScanDialog();
    setStatus({
      tone: "idle",
      title: "Receiver stopped",
      detail: "You can start scanning again whenever you are ready.",
      legacy: "status: stopped"
    });
    syncButtons(false);
  });

  scanCloseBtn?.addEventListener("click", () => {
    closeScanDialog();
  });

  scanDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeScanDialog();
  });

  scanDialog?.addEventListener("click", (event) => {
    if (event.target === scanDialog) {
      closeScanDialog();
    }
  });

  hideDownload();
  setText("manifestName", "Waiting for sender manifest");
  setText("manifestMeta", "The file details will appear here once the first manifest is read.");
  setText("stageMeta", "Open the scan stage, then start the camera when the sender is ready.");
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
