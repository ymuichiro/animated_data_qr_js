export const PRESET_CONTENT = Object.freeze({
  compatibility: {
    label: "Compatibility",
    tag: "Recommended default",
    description: "Best for older phones, smaller screens, or imperfect lighting. It stays on one QR symbol per frame and adds short parity blocks to reduce end-of-transfer waiting.",
    paceCaption: "Single-symbol pacing for stable scanning",
    densityCaption: "One QR symbol per frame",
    protectionCaption: "Small parity blocks reduce tail slowdown"
  },
  balanced: {
    label: "Balanced",
    tag: "Faster in good conditions",
    description: "Raises throughput with two QR symbols per frame and light parity recovery. Use this when the display is bright and the camera can hold both symbols clearly.",
    paceCaption: "Faster pacing for strong camera conditions",
    densityCaption: "Two QR symbols per frame",
    protectionCaption: "Light parity recovery for missed reads"
  },
  throughput: {
    label: "Throughput",
    tag: "Experimental",
    description: "Optimized for speed on bright displays and newer cameras. Use this only when you can keep devices steady and multi-QR detection is already reliable on your hardware.",
    paceCaption: "Maximum payload per frame",
    densityCaption: "Four QR symbols per frame",
    protectionCaption: "Lower error correction for capacity"
  },
  resilient: {
    label: "Resilient",
    tag: "Stronger recovery",
    description: "Uses two QR symbols per frame with tighter parity blocks so missed reads recover sooner. Choose this when the view shakes, focus drifts, or the last chunks take too long.",
    paceCaption: "Balanced throughput with stronger recovery",
    densityCaption: "Two QR symbols plus parity recovery",
    protectionCaption: "Restores one missed chunk in short blocks"
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

function formatDecoderMode(mode) {
  if (mode === "worker") {
    return "Decoder: Worker";
  }
  if (mode === "main-thread-fallback") {
    return "Decoder: Main-thread fallback";
  }
  return "Decoder: preparing";
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

function createEstimate({ selection, presetName, preset, estimateTransferStats }) {
  if (!selection || selection.kind !== "file") {
    return null;
  }
  const totalChunks = Math.max(1, Math.ceil(selection.file.size / preset.chunkByteSize));
  const extraFrames = preset.parityBlockDataChunks > 0
    ? Math.ceil(totalChunks / preset.parityBlockDataChunks)
    : 0;
  const estimate = estimateTransferStats({
    fileSize: selection.file.size,
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

function renderSenderEstimate({ selection, presetName, preset, estimateTransferStats }) {
  if (!selection) {
    setText("estimateHeadline", "Pick a file to see the expected loop time.");
    setText("estimateDetail", "Opening the QR stage prepares the transfer only when you need it.");
    return;
  }

  if (selection.kind === "folder") {
    setText("estimateHeadline", "Archive size and loop time will be calculated during prepare.");
    setText(
      "estimateDetail",
      `${selection.rootName} folder  |  ${selection.fileCount} files  |  ${formatBytes(selection.totalBytes)} raw input`
    );
    return;
  }

  const estimate = createEstimate({ selection, presetName, preset, estimateTransferStats });
  setText("estimateHeadline", `Expected loop time: ${formatDuration(estimate.loopDurationMs)}`);
  setText(
    "estimateDetail",
    `${selection.file.name || "Unnamed file"}  |  ${formatBytes(selection.file.size)}  |  ${PRESET_CONTENT[presetName]?.label || presetName} preset`
  );
}

export function initSenderDemo({
  AnimatedQrSender,
  createArchive,
  resolveTransferPreset,
  estimateTransferStats
}) {
  initDemoShell();

  const fileInput = byId("fileInput");
  const folderInput = byId("folderInput");
  const pickFileBtn = byId("pickFileBtn");
  const pickFolderBtn = byId("pickFolderBtn");
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
    selection: null,
    archivePreview: null,
    preparing: false,
    prepared: false,
    running: false
  };

  function getFolderSelection(files) {
    const list = Array.from(files ?? []);
    if (list.length === 0) {
      return null;
    }
    const relativePath = typeof list[0].webkitRelativePath === "string" ? list[0].webkitRelativePath : "";
    const rootName = relativePath && relativePath.includes("/")
      ? relativePath.split("/")[0]
      : "transfer-folder";
    const totalBytes = list.reduce((sum, file) => sum + (Number.isFinite(file.size) ? file.size : 0), 0);
    return {
      kind: "folder",
      files: list,
      rootName,
      fileCount: list.length,
      totalBytes
    };
  }

  function renderSelection() {
    if (!state.selection) {
      setText("selectionName", "No file or folder selected");
      setText("selectionMeta", "Folder transfers are packed into an internal archive and restored as extracted files on the receiver.");
      return;
    }

    if (state.selection.kind === "folder") {
      setText("selectionName", `${state.selection.rootName} folder selected`);
      setText(
        "selectionMeta",
        `${state.selection.fileCount} files  |  ${formatBytes(state.selection.totalBytes)} raw input  |  The folder will be packed before QR transfer.`
      );
      return;
    }

    setText("selectionName", state.selection.file.name || "Selected file");
    setText("selectionMeta", `${formatBytes(state.selection.file.size)} single file`);
  }

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
    const presetName = presetSelect?.value || "compatibility";
    return {
      presetName,
      preset: resolveTransferPreset(presetName)
    };
  }

  function syncButtonState() {
    if (openStageBtn) {
      openStageBtn.disabled = !state.selection || state.preparing;
    }
    if (modalStartBtn) {
      modalStartBtn.disabled = !state.selection || state.preparing || state.running;
    }
    if (modalStopBtn) {
      modalStopBtn.disabled = !state.running;
    }
  }

  function markNeedsPrepare(reason = "Choose a file or folder and open the QR stage.") {
    state.preparing = false;
    state.prepared = false;
    state.archivePreview = null;
    setText("stageMeta", state.selection
      ? "Open the QR stage to prepare the transfer and preview the sender screen."
      : "Choose a file or folder, then open the QR stage when you are ready.");
    if (!state.running) {
      const tone = state.selection ? "warning" : "idle";
      const title = state.selection ? "Ready to open the stage" : "Select a file or folder";
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
      selection: state.selection,
      presetName,
      preset,
      estimateTransferStats
    });
  }

  async function prepareTransfer({ openStageAfter = false } = {}) {
    if (!state.selection) {
      setStatus({
        tone: "warning",
        title: "Select a file or folder",
        detail: "A file or folder is required before the QR stage can be prepared.",
        legacy: "status: select a file or folder"
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
      let transferInput = state.selection.kind === "file" ? state.selection.file : null;
      if (state.selection.kind === "folder") {
        setText("stageMeta", "Packing the selected folder into a secure transfer archive...");
        setStatus({
          tone: "working",
          title: "Packing folder",
          detail: "Reading files, grouping related content, and compressing the internal transfer archive.",
          legacy: "status: packing folder"
        });
        const archive = await createArchive(state.selection.files, {
          rootName: state.selection.rootName,
          onProgress: (event) => {
            const detail = event.currentFile
              ? `${event.phase}: ${event.currentFile}`
              : `${event.phase}: working through the selected folder`;
            setText("stageMeta", `Preparing folder transfer  |  ${detail}`);
          }
        });
        state.archivePreview = archive.manifestPreview;
        transferInput = new File([archive.blob], archive.fileName, {
          type: archive.blob.type
        });
      }

      await sender.prepare(transferInput, {
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
    if (state.selection?.kind === "folder" && state.archivePreview) {
      setText(
        "estimateDetail",
        `${state.archivePreview.rootName} folder  |  ${state.archivePreview.fileCount} files  |  ${formatBytes(payload.fileSize)} packed archive  |  ${payload.totalChunks} chunks`
      );
    } else {
      setText("estimateDetail", `${payload.fileName}  |  ${formatBytes(payload.fileSize)}  |  ${payload.totalChunks} chunks`);
    }
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
      title: state.prepared ? "Broadcast stopped" : "Select a file or folder",
      detail: state.prepared
        ? "You can start again immediately or prepare a different file."
        : "Choose a file or folder and open the QR stage.",
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
    if (folderInput) {
      folderInput.value = "";
    }
    const file = fileInput.files?.[0] || null;
    state.selection = file ? {
      kind: "file",
      file
    } : null;
    renderSelection();
    renderSelectedPreset();
    markNeedsPrepare(
      state.selection
        ? "The selected file is ready. Open the QR stage to generate the QR loop."
        : "Choose a file to continue."
    );
  });

  folderInput?.addEventListener("change", () => {
    if (state.running) {
      sender.stop();
    }
    if (fileInput) {
      fileInput.value = "";
    }
    state.selection = getFolderSelection(folderInput.files);
    renderSelection();
    renderSelectedPreset();
    markNeedsPrepare(
      state.selection
        ? "The selected folder is ready. Open the QR stage to build the transfer archive."
        : "Choose a folder to continue."
    );
  });

  presetSelect?.addEventListener("change", () => {
    renderSelectedPreset();
    if (state.running) {
      sender.stop();
    }
    markNeedsPrepare(
      state.selection
        ? "Preset updated. Open the QR stage again to apply the new transfer profile."
        : "Choose a file or folder to see the preset estimate."
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
    if (!state.selection) {
      setStatus({
        tone: "warning",
        title: "Select a file or folder",
        detail: "Choose a file or folder before opening the QR stage.",
        legacy: "status: select a file or folder"
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

  pickFileBtn?.addEventListener("click", () => {
    fileInput?.click();
  });

  pickFolderBtn?.addEventListener("click", () => {
    folderInput?.click();
  });

  renderSelection();
  renderSelectedPreset();
  setText("stageMeta", "Choose a file or folder, then open the QR stage when you are ready.");
  setStatus({
    tone: "idle",
    title: "Select a file or folder",
    detail: "Choose a file or folder and preset, then open the QR stage.",
    legacy: "status: idle"
  });
  syncButtonState();
}

export function initReceiverDemo({
  AnimatedQrReceiver,
  createArchiveZipBlob,
  createDownloadLink,
  extractArchive,
  isArchiveBlob,
  saveExtractedArchiveToDirectory,
  supportsDirectorySave
}) {
  initDemoShell();

  const video = byId("video");
  const openScanStageBtn = byId("openScanStageBtn");
  const startBtn = byId("startBtn");
  const stopBtn = byId("stopBtn");
  const scanDialog = byId("scanDialog");
  const scanCloseBtn = byId("scanCloseBtn");
  const downloadCard = byId("downloadCard");
  const download = byId("download");
  const saveFolderBtn = byId("saveFolderBtn");
  const downloadZipBtn = byId("downloadZipBtn");
  let downloadUrl = null;
  let extractedArchive = null;

  const receiver = new AnimatedQrReceiver({
    video,
    scanIntervalMs: 45,
    maxSymbolsPerFrame: 4,
    autoStopOnComplete: true,
    scanMaxDimension: 720,
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

  function closeScanDialogAfterComplete() {
    receiver.stop();
    receiver.stopCamera();
    closeDialog(scanDialog);
    syncButtons(false);
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
    extractedArchive = null;
    if (downloadCard) {
      downloadCard.classList.add("hide");
    }
    if (download) {
      download.classList.add("hide");
      download.textContent = "Download restored file";
      download.classList.remove("button-secondary");
      download.classList.add("button-primary");
    }
    if (saveFolderBtn) {
      saveFolderBtn.classList.add("hide");
    }
    if (downloadZipBtn) {
      downloadZipBtn.classList.add("hide");
      downloadZipBtn.classList.remove("button-primary");
      downloadZipBtn.classList.add("button-secondary");
    }
    setText("downloadTitle", "Your file is ready");
    setText("downloadDetail", "The restored file will appear here as a clear primary action.");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = null;
    }
  }

  function focusDownloadCard() {
    requestAnimationFrame(() => {
      downloadCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (saveFolderBtn && !saveFolderBtn.classList.contains("hide")) {
        saveFolderBtn.focus?.();
        return;
      }
      if (download && !download.classList.contains("hide")) {
        download.focus?.();
        return;
      }
      if (downloadZipBtn && !downloadZipBtn.classList.contains("hide")) {
        downloadZipBtn.focus?.();
      }
    });
  }

  function showDownload(result, options = {}) {
    hideDownload();
    const { url, anchor } = createDownloadLink(result, download);
    downloadUrl = url;

    if (downloadCard) {
      downloadCard.classList.remove("hide");
    }
    setText("downloadTitle", options.title || `Ready to save ${result.fileName}`);
    setText("downloadDetail", options.detail || "Use the blue download button below to save the reconstructed file locally.");
    anchor.textContent = options.label || `Download ${result.fileName} (${formatBytes(result.size)})`;
    anchor.classList.remove("hide");
    anchor.classList.add("button-primary");
    anchor.addEventListener("click", () => {
      setTimeout(() => {
        if (downloadUrl) {
          URL.revokeObjectURL(downloadUrl);
          downloadUrl = null;
        }
      }, 2000);
    }, { once: true });
    focusDownloadCard();
  }

  function showArchiveActions(archiveResult) {
    hideDownload();
    extractedArchive = archiveResult;
    if (downloadCard) {
      downloadCard.classList.remove("hide");
    }
    setText("downloadTitle", `Ready to restore ${archiveResult.rootName}`);
    setText("downloadDetail", supportsDirectorySave()
      ? "Save the extracted folder directly, or download a ZIP fallback if you prefer."
      : "This browser cannot save folders directly, so use the ZIP fallback below.");
    if (saveFolderBtn && supportsDirectorySave()) {
      saveFolderBtn.classList.remove("hide");
    }
    if (downloadZipBtn) {
      downloadZipBtn.classList.remove("hide");
      if (!supportsDirectorySave()) {
        downloadZipBtn.classList.remove("button-secondary");
        downloadZipBtn.classList.add("button-primary");
      }
    }
    focusDownloadCard();
  }

  function resetProgressUi() {
    hideDownload();
    receiver.reset();
    setText("manifestName", "Waiting for sender manifest");
    setText("manifestMeta", "The file details will appear here once the first manifest is read.");
    setText("decoderModeText", "Decoder: preparing");

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
    setText("decoderModeText", "Decoder: preparing");
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

  async function handleSaveFolder() {
    if (!extractedArchive || !supportsDirectorySave()) {
      return;
    }

    try {
      setStatus({
        tone: "working",
        title: "Saving folder",
        detail: "Choose a parent directory, then the browser will create a safe subfolder for the restored files.",
        legacy: "status: saving folder"
      });
      const directoryHandle = await window.showDirectoryPicker();
      const saved = await saveExtractedArchiveToDirectory(extractedArchive, directoryHandle);
      setStatus({
        tone: "complete",
        title: "Folder saved",
        detail: `Restored files were written into the new folder "${saved.directoryName}".`,
        legacy: "status: folder saved"
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus({
          tone: "idle",
          title: "Save cancelled",
          detail: "No files were written. You can try again or use the ZIP fallback.",
          legacy: "status: save cancelled"
        });
        return;
      }
      setStatus({
        tone: "error",
        title: "Could not save the folder",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
    }
  }

  async function handleZipDownload() {
    if (!extractedArchive) {
      return;
    }

    try {
      setStatus({
        tone: "working",
        title: "Preparing ZIP fallback",
        detail: "Building a standard ZIP so the restored folder can be downloaded with no extra software.",
        legacy: "status: preparing zip"
      });
      const zipArtifact = await createArchiveZipBlob(extractedArchive);
      const zipUrl = URL.createObjectURL(zipArtifact.blob);
      const anchor = document.createElement("a");
      anchor.href = zipUrl;
      anchor.download = zipArtifact.fileName;
      anchor.click();
      setTimeout(() => {
        URL.revokeObjectURL(zipUrl);
      }, 2000);
      setStatus({
        tone: "complete",
        title: "ZIP fallback ready",
        detail: `Started downloading ${zipArtifact.fileName}.`,
        legacy: "status: zip fallback ready"
      });
    } catch (error) {
      setStatus({
        tone: "error",
        title: "Could not build the ZIP fallback",
        detail: error?.message || String(error),
        legacy: `error: ${error?.message || String(error)}`
      });
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

  receiver.on("decoder-mode", ({ mode }) => {
    setText("decoderModeText", formatDecoderMode(mode));
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

  receiver.on("complete", async (result) => {
    const progressBar = byId("progressBar");
    const progressText = byId("progressText");
    if (progressBar) {
      progressBar.style.width = "100%";
    }
    if (progressText) {
      progressText.textContent = `100%  |  ${result.receivedChunks}/${result.totalChunks} chunks received`;
    }
    setText("stageMeta", "Transfer complete. Closing the scan stage and returning to the download action.");
    closeScanDialogAfterComplete();
    syncButtons(false);

    if (await isArchiveBlob(result.blob)) {
      setText("manifestName", result.fileName);
      setText("manifestMeta", `${formatBytes(result.size)}  |  Preparing extracted folder`);
      setStatus({
        tone: "working",
        title: "Preparing folder output",
        detail: "Validating the transferred archive and extracting the folder in the browser.",
        legacy: "status: extracting folder"
      });

      try {
        const archiveResult = await extractArchive(result.blob);
        setText("manifestName", `${archiveResult.rootName} folder`);
        setText("manifestMeta", `${archiveResult.fileCount} files  |  ${formatBytes(archiveResult.totalInputBytes)} extracted contents`);
        showArchiveActions(archiveResult);
        setStatus({
          tone: "complete",
          title: "Folder transfer complete",
          detail: supportsDirectorySave()
            ? "Use the highlighted button to save the extracted folder, or download a ZIP fallback."
            : "This browser cannot save folders directly, so use the highlighted ZIP fallback.",
          legacy: "status: folder transfer complete"
        });
        return;
      } catch (error) {
        setStatus({
          tone: "error",
          title: "Folder extraction failed",
          detail: `${error?.message || String(error)}. Download the raw transfer archive as a fallback.`,
          legacy: `error: ${error?.message || String(error)}`
        });
        showDownload(result, {
          title: "Folder extraction failed",
          detail: "The internal transfer archive was received, but this browser could not extract it automatically.",
          label: `Download ${result.fileName} (${formatBytes(result.size)})`
        });
        return;
      }
    }

    setText("manifestName", result.fileName);
    setText("manifestMeta", `${formatBytes(result.size)}  |  Ready to save`);
    showDownload(result);
    setStatus({
      tone: "complete",
      title: "Transfer complete",
      detail: "The scan stage closed automatically. Use the highlighted download button on the page.",
      legacy: "status: complete"
    });
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

  saveFolderBtn?.addEventListener("click", () => {
    void handleSaveFolder();
  });

  downloadZipBtn?.addEventListener("click", () => {
    void handleZipDownload();
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
  setText("decoderModeText", "Decoder: preparing");
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
