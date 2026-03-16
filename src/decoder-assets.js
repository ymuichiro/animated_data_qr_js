export const DECODER_WORKER_FILE_NAME = "animated-data-qr.decoder.worker.js";
export const DECODER_WASM_FILE_NAME = "zxing_reader.wasm";

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function getPageUrl() {
  if (typeof window !== "undefined" && typeof window.location?.href === "string") {
    return window.location.href;
  }
  return "";
}

export function getInjectedModuleUrl() {
  if (typeof __ADQ_MODULE_URL__ === "string" && __ADQ_MODULE_URL__) {
    return __ADQ_MODULE_URL__;
  }
  if (typeof document !== "undefined" && document.currentScript?.src) {
    return document.currentScript.src;
  }
  return "";
}

export function resolveDecoderAssetBaseUrl(override = null, moduleUrl = getInjectedModuleUrl()) {
  if (typeof override === "string" && override.length > 0) {
    const fallbackUrl = moduleUrl || getPageUrl() || "http://localhost/";
    return ensureTrailingSlash(new URL(override, fallbackUrl).href);
  }

  if (typeof moduleUrl === "string" && moduleUrl.length > 0) {
    return ensureTrailingSlash(new URL(".", moduleUrl).href);
  }

  const pageUrl = getPageUrl();
  if (pageUrl) {
    return ensureTrailingSlash(new URL(".", pageUrl).href);
  }

  return "";
}

export function resolveDecoderWorkerUrl(assetBaseUrl) {
  if (!assetBaseUrl) {
    return "";
  }
  return new URL(DECODER_WORKER_FILE_NAME, ensureTrailingSlash(assetBaseUrl)).href;
}

export function resolveDecoderWasmUrl(assetBaseUrl) {
  if (!assetBaseUrl) {
    return "";
  }
  return new URL(DECODER_WASM_FILE_NAME, ensureTrailingSlash(assetBaseUrl)).href;
}
