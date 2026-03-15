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
    setText("estimateDetail", "Opening the QR stage prepares the transfer only when you need it.");
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
    preparing: false,
    prepared: false,
    running: false
  };

  function openStageDialog() {
    openDialog(stageDialog);
    if (state.prepared) {
      requestAnimationFrame(() => {
        void sender.renderFrameAt(state.running ? sender.frameIndex : 0).catch(() => {});
      });
    }
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
    if (openStageBtn) {
      openStageBtn.disabled = !state.file || state.preparing;
    }
    if (modalStartBtn) {
      modalStartBtn.disabled = !state.file || state.preparing || state.running;
    }
    if (modalStopBtn) {
      modalStopBtn.disabled = !state.running;
    }
  }

  function markNeedsPrepare(reason = "Choose a file and open the QR stage.") {
    state.preparing = false;
    state.prepared = false;
    setText("stageMeta", state.file
      ? "Open the QR stage to prepare the transfer and preview the sender screen."
      : "Choose a file, then open the QR stage when you are ready.");
    if (!state.running) {
      const tone = state.file ? "warning" : "idle";
      const title = state.file ? "Ready to open the stage" : "Select a file";
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

  async function prepareTransfer({ openStageAfter = false } = {}) {
    if (!state.file) {
      setStatus({
        tone: "warning",
        title: "Select a file",
        detail: "A file is required before the QR stage can be prepared.",
        legacy: "status: select a file"
      });
      return false;
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

    state.preparing = true;
    state.prepared = false;
    syncButtonState();

    if (openStageAfter) {
      openStageDialog();
    }

    setText("stageMeta", "Preparing QR frames and estimating the expected loop time...");
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
      return true;
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Preparation failed",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
      setText("stageMeta", "Preparation failed. Choose another file or preset and try again.");
      return false;
    } finally {
      state.preparing = false;
      syncButtonState();
    }
  }

  sender.on("prepared", (payload) => {
    state.preparing = false;
    state.prepared = true;
    state.running = false;
    setText("stageMeta", `Prepared ${payload.displayFrames.length} display frames for ${payload.fileName}`);
    setText("estimateHeadline", `Expected loop time: ${formatDuration(payload.estimatedStats.loopDurationMs)}`);
    setText("estimateDetail", `${payload.fileName}  |  ${formatBytes(payload.fileSize)}  |  ${payload.totalChunks} chunks`);
    setStatus({
      tone: "ready",
      title: "Transfer prepared",
      detail: "The QR stage is ready. Start the broadcast when the receiver is already scanning.",
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
        : "Choose a file and open the QR stage.",
      legacy: "status: stopped"
    });
    syncButtonState();
  });

  sender.on("error", ({ error }) => {
    state.preparing = false;
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
        ? "The selected file is ready. Open the QR stage to generate the QR loop."
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
        ? "Preset updated. Open the QR stage again to apply the new transfer profile."
        : "Choose a file to see the preset estimate."
    );
  });

  async function startBroadcast() {
    if (!state.prepared) {
      const prepared = await prepareTransfer({ openStageAfter: true });
      if (!prepared) {
        return;
      }
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

  openStageBtn?.addEventListener("click", async () => {
    if (!state.file) {
      setStatus({
        tone: "warning",
        title: "Select a file",
        detail: "Choose a file before opening the QR stage.",
        legacy: "status: select a file"
      });
      return;
    }

    if (!state.prepared) {
      await prepareTransfer({ openStageAfter: true });
      return;
    }

    openStageDialog();
  });

  modalStartBtn?.addEventListener("click", async () => {
    await startBroadcast();
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
  setText("stageMeta", "Choose a file, then open the QR stage when you are ready.");
  setStatus({
    tone: "idle",
    title: "Select a file",
    detail: "Choose a file and preset, then open the QR stage.",
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
    scanIntervalMs: 45,
    maxSymbolsPerFrame: 4,
    autoStopOnComplete: true,
    cameraConstraints: {
      audio: false,
      video: {
        facingMode: {
          ideal: "environment"
        },
        width: {
          ideal: 1280
        },
        height: {
          ideal: 720
        },
        frameRate: {
          ideal: 30,
          max: 30
        }
      }
    }
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
      openScanStageBtn.disabled = Boolean(scanning);
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

  function resetProgressUi() {
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
  }

  async function startScanFlow() {
    openScanDialog();
    resetProgressUi();
    setText("stageMeta", "Requesting camera access and preparing the scan stage...");
    setStatus({
      tone: "working",
      title: "Starting camera",
      detail: "Allow camera access, then keep the full sender stage inside the frame.",
      legacy: "status: starting camera"
    });

    try {
      await receiver.start();
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Camera access failed",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
      setText("stageMeta", "Camera access failed. Adjust permissions and try again.");
      syncButtons(false);
    }
  }

  function setReceiverStoppedStatus(detail = "You can start scanning again whenever you are ready.") {
    setStatus({
      tone: "idle",
      title: "Receiver stopped",
      detail,
      legacy: "status: stopped"
    });
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
    if (!receiver.scanning) {
      setText("stageMeta", "Scan stopped. Open the scan stage again when the sender is ready.");
    }
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
    void startScanFlow();
  });

  startBtn?.addEventListener("click", () => {
    void startScanFlow();
  });

  stopBtn?.addEventListener("click", () => {
    closeScanDialog();
    setReceiverStoppedStatus();
    setText("stageMeta", "Scan stopped. Open the scan stage again when the sender is ready.");
    syncButtons(false);
  });

  scanCloseBtn?.addEventListener("click", () => {
    closeScanDialog();
    setReceiverStoppedStatus("The scan stage was closed. Reopen it when the sender is ready.");
  });

  scanDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeScanDialog();
    setReceiverStoppedStatus("The scan stage was closed. Reopen it when the sender is ready.");
  });

  scanDialog?.addEventListener("click", (event) => {
    if (event.target === scanDialog) {
      closeScanDialog();
      setReceiverStoppedStatus("The scan stage was closed. Reopen it when the sender is ready.");
    }
  });

  hideDownload();
  setText("manifestName", "Waiting for sender manifest");
  setText("manifestMeta", "The file details will appear here once the first manifest is read.");
  setText("stageMeta", "Open the scan stage to start the camera and watch live progress.");
  const progressText = byId("progressText");
  if (progressText) {
    progressText.textContent = "0%  |  No chunks received yet";
  }
  setStatus({
    tone: "idle",
    title: "Start the receiver",
    detail: "Open the sender on another screen, then launch the scan stage when it is ready.",
    legacy: "status: idle"
  });
  syncButtons(false);
}
