function hasBuffer() {
  return typeof Buffer !== "undefined" && typeof Buffer.from === "function";
}

function toBase64(base64UrlString) {
  const base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  return base64 + "=".repeat(padding);
}

function toBase64Url(base64String) {
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function bytesToBinaryString(bytes) {
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const view = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...view);
  }
  return binary;
}

export function bytesToBase64Url(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("bytes must be Uint8Array");
  }

  if (hasBuffer()) {
    return toBase64Url(Buffer.from(bytes).toString("base64"));
  }

  if (typeof btoa !== "function") {
    throw new Error("No base64 encoder available in this environment");
  }

  return toBase64Url(btoa(bytesToBinaryString(bytes)));
}

export function base64UrlToBytes(base64UrlString) {
  if (typeof base64UrlString !== "string") {
    throw new TypeError("base64UrlString must be a string");
  }

  const base64 = toBase64(base64UrlString);

  if (hasBuffer()) {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  if (typeof atob !== "function") {
    throw new Error("No base64 decoder available in this environment");
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
