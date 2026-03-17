import { gzipSync, gunzipSync, zipSync } from "fflate";
import { concatChunks } from "./utils/chunk.js";

export const ARCHIVE_MAGIC = "SARC1";
export const ARCHIVE_VERSION = 1;
export const ARCHIVE_MIME_TYPE = "application/vnd.animated-data-qr.sarc1";
export const ARCHIVE_EXTENSION = ".sarc1";

const HEADER_SIZE = 40;
const FOOTER_SIZE = 37;
const HEADER_FLAGS = 0;
const DEFAULT_RAW_FALLBACK_THRESHOLD_BYTES = 1024;
const DEFAULT_MAX_FILE_COUNT = 4096;
const DEFAULT_MAX_INPUT_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAX_FILE_BYTES = 64 * 1024 * 1024;

const ARCHIVE_PROFILES = Object.freeze({
  max: Object.freeze({
    compressionLevel: 6,
    maxBlockBytes: 8 * 1024 * 1024
  }),
  extreme: Object.freeze({
    compressionLevel: 9,
    maxBlockBytes: 16 * 1024 * 1024
  }),
  ultra: Object.freeze({
    compressionLevel: 9,
    maxBlockBytes: 32 * 1024 * 1024
  })
});

const TEXT_EXTENSIONS = new Set([
  "c",
  "cc",
  "cpp",
  "cs",
  "css",
  "csv",
  "go",
  "h",
  "hpp",
  "html",
  "java",
  "js",
  "json",
  "jsx",
  "md",
  "mjs",
  "py",
  "rb",
  "rs",
  "sh",
  "sql",
  "svg",
  "toml",
  "ts",
  "tsx",
  "txt",
  "xml",
  "yaml",
  "yml"
]);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function assertCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is required for archive integrity checks");
  }
}

function toArrayBufferBytes(input) {
  if (input instanceof Uint8Array) {
    return input;
  }
  return new Uint8Array(input);
}

function writeFixedAscii(bytes, offset, value) {
  bytes.set(textEncoder.encode(value), offset);
}

function readFixedAscii(bytes, offset, length) {
  return textDecoder.decode(bytes.subarray(offset, offset + length));
}

function setUint64(view, offset, value) {
  view.setBigUint64(offset, BigInt(value), true);
}

function getUint64(view, offset) {
  const value = Number(view.getBigUint64(offset, true));
  if (!Number.isSafeInteger(value)) {
    throw new Error("Archive value exceeds supported range");
  }
  return value;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  if (typeof hex !== "string" || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error("Invalid hex input");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

async function sha256Hex(bytes) {
  assertCrypto();
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

function sanitizeNameSegment(segment, { allowSpaces = true } = {}) {
  if (typeof segment !== "string") {
    throw new Error("Path segment must be a string");
  }
  const trimmed = segment.trim();
  if (!trimmed) {
    throw new Error("Path segment cannot be empty");
  }
  if (trimmed === "." || trimmed === "..") {
    throw new Error("Relative traversal segments are not allowed");
  }
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new Error("Control characters are not allowed in file paths");
  }
  if (/[\\/]/.test(trimmed)) {
    throw new Error("Path segments cannot contain slashes");
  }
  if (/[:*?"<>|]/.test(trimmed)) {
    throw new Error("Unsafe path characters are not allowed");
  }
  if (!allowSpaces && /\s/.test(trimmed)) {
    throw new Error("Whitespace is not allowed in this path segment");
  }
  return trimmed;
}

function safeFileStem(name, fallback = "transfer-folder") {
  if (typeof name !== "string" || !name.trim()) {
    return fallback;
  }
  const normalized = name
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "-")
    .trim()
    .replace(/\s+/g, " ");
  return normalized || fallback;
}

function sanitizeRelativePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    throw new Error("A non-empty relative path is required");
  }
  if (/^[a-zA-Z]:/.test(path) || path.startsWith("/") || path.startsWith("\\")) {
    throw new Error("Absolute paths are not allowed");
  }
  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean).map((segment) => sanitizeNameSegment(segment));
  if (segments.length === 0) {
    throw new Error("Relative path must contain at least one segment");
  }
  return segments.join("/");
}

function getInputPath(input, index) {
  const rawPath = typeof input.webkitRelativePath === "string" && input.webkitRelativePath
    ? input.webkitRelativePath
    : typeof input.name === "string" && input.name
      ? input.name
      : `file-${index + 1}.bin`;
  return sanitizeRelativePath(rawPath);
}

function getCommonRoot(paths) {
  if (!Array.isArray(paths) || paths.length === 0) {
    return null;
  }
  const splitPaths = paths.map((path) => path.split("/"));
  if (splitPaths.some((segments) => segments.length < 2)) {
    return null;
  }
  const firstSegment = splitPaths[0][0];
  if (!splitPaths.every((segments) => segments[0] === firstSegment)) {
    return null;
  }
  return sanitizeNameSegment(firstSegment);
}

function classifyGroupKind(entry) {
  const path = entry.path.toLowerCase();
  const extension = path.includes(".")
    ? path.slice(path.lastIndexOf(".") + 1)
    : "";

  if (extension === "pdf") {
    return "pdf";
  }
  if (extension === "zip") {
    return "zip";
  }
  if (TEXT_EXTENSIONS.has(extension)) {
    if (["js", "jsx", "ts", "tsx", "css", "html"].includes(extension)) {
      return "web-code";
    }
    if (["json", "yaml", "yml", "xml", "toml", "csv"].includes(extension)) {
      return "structured-text";
    }
    return "text-code";
  }
  if (typeof entry.mimeType === "string" && entry.mimeType.startsWith("text/")) {
    return "text-code";
  }
  return "binary";
}

function sortEntries(entries) {
  entries.sort((left, right) => {
    const leftExtension = left.path.includes(".") ? left.path.slice(left.path.lastIndexOf(".") + 1) : "";
    const rightExtension = right.path.includes(".") ? right.path.slice(right.path.lastIndexOf(".") + 1) : "";
    return leftExtension.localeCompare(rightExtension)
      || left.path.localeCompare(right.path)
      || left.size - right.size;
  });
}

function planBlocks(entries, maxBlockBytes) {
  const groups = new Map();
  for (const entry of entries) {
    const list = groups.get(entry.groupKind) ?? [];
    list.push(entry);
    groups.set(entry.groupKind, list);
  }

  const planned = [];
  let blockId = 0;

  for (const [groupKind, groupEntries] of groups.entries()) {
    sortEntries(groupEntries);

    let currentEntries = [];
    let currentSize = 0;
    for (const entry of groupEntries) {
      if (currentEntries.length > 0 && currentSize + entry.size > maxBlockBytes) {
        planned.push({
          blockId,
          groupKind,
          entries: currentEntries,
          uncompressedSize: currentSize
        });
        blockId += 1;
        currentEntries = [];
        currentSize = 0;
      }

      currentEntries.push(entry);
      currentSize += entry.size;
    }

    if (currentEntries.length > 0) {
      planned.push({
        blockId,
        groupKind,
        entries: currentEntries,
        uncompressedSize: currentSize
      });
      blockId += 1;
    }
  }

  return planned;
}

function createHeader({ blockCount, manifestOffset, manifestLength, totalInputBytes, fileCount }) {
  const bytes = new Uint8Array(HEADER_SIZE);
  const view = new DataView(bytes.buffer);
  writeFixedAscii(bytes, 0, ARCHIVE_MAGIC);
  view.setUint8(5, ARCHIVE_VERSION);
  view.setUint16(6, HEADER_FLAGS, true);
  view.setUint32(8, blockCount, true);
  setUint64(view, 12, manifestOffset);
  setUint64(view, 20, manifestLength);
  setUint64(view, 28, totalInputBytes);
  view.setUint32(36, fileCount, true);
  return bytes;
}

function parseHeader(bytes) {
  if (bytes.length < HEADER_SIZE) {
    throw new Error("Archive is too small to contain a valid header");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = readFixedAscii(bytes, 0, 5);
  if (magic !== ARCHIVE_MAGIC) {
    throw new Error("Archive magic mismatch");
  }
  const version = view.getUint8(5);
  if (version !== ARCHIVE_VERSION) {
    throw new Error(`Unsupported archive version: ${version}`);
  }
  return {
    blockCount: view.getUint32(8, true),
    manifestOffset: getUint64(view, 12),
    manifestLength: getUint64(view, 20),
    totalInputBytes: getUint64(view, 28),
    fileCount: view.getUint32(36, true)
  };
}

function createFooter(manifestSha256Bytes) {
  const footer = new Uint8Array(FOOTER_SIZE);
  footer.set(manifestSha256Bytes, 0);
  writeFixedAscii(footer, 32, ARCHIVE_MAGIC);
  return footer;
}

function parseFooter(bytes) {
  if (bytes.length < FOOTER_SIZE) {
    throw new Error("Archive is too small to contain a valid footer");
  }
  const footer = bytes.subarray(bytes.length - FOOTER_SIZE);
  if (readFixedAscii(footer, 32, 5) !== ARCHIVE_MAGIC) {
    throw new Error("Archive footer magic mismatch");
  }
  return {
    manifestSha256: bytesToHex(footer.subarray(0, 32))
  };
}

function buildZipTree(extractedArchive) {
  const tree = {};
  for (const file of extractedArchive.files) {
    const segments = [extractedArchive.rootName, ...file.path.split("/")];
    let cursor = tree;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = sanitizeNameSegment(segments[index]);
      if (index === segments.length - 1) {
        cursor[segment] = new Uint8Array(file.bytes);
        continue;
      }
      cursor[segment] = cursor[segment] ?? {};
      cursor = cursor[segment];
    }
  }
  return tree;
}

async function createStoredArchiveBlock(block, options) {
  const chunks = [];
  const manifestFiles = [];
  let offsetInBlock = 0;
  let processedBytes = 0;

  for (const entry of block.entries) {
    const bytes = new Uint8Array(await entry.input.arrayBuffer());
    const fileHash = await sha256Hex(bytes);
    chunks.push(bytes);
    manifestFiles.push({
      path: entry.path,
      size: entry.size,
      mtime: entry.mtime,
      mimeType: entry.mimeType,
      groupKind: entry.groupKind,
      blockId: block.blockId,
      offsetInBlock,
      sha256: fileHash
    });
    offsetInBlock += bytes.length;
    processedBytes += bytes.length;
    options.onProgress?.({
      phase: "scan",
      processedBytes: options.progressBaseBytes + processedBytes,
      totalBytes: options.totalInputBytes,
      currentFile: entry.path,
      currentBlockId: block.blockId
    });
  }

  const rawBytes = concatChunks(chunks, block.uncompressedSize);
  options.onProgress?.({
    phase: "compress",
    processedBytes: options.progressBaseBytes + processedBytes,
    totalBytes: options.totalInputBytes,
    currentBlockId: block.blockId
  });

  const compressedBytes = gzipSync(rawBytes, {
    level: options.compressionLevel,
    mtime: 0
  });
  const useRaw = compressedBytes.length >= rawBytes.length - options.rawFallbackThresholdBytes;
  const codec = useRaw ? "raw" : "gzip";
  const storedBytes = useRaw ? rawBytes : compressedBytes;
  const storedHash = await sha256Hex(storedBytes);

  return {
    blockId: block.blockId,
    groupKind: block.groupKind,
    codec,
    storedBytes,
    manifestFiles,
    manifestBlock: {
      blockId: block.blockId,
      codec,
      groupKind: block.groupKind,
      compressedOffset: 0,
      compressedSize: storedBytes.length,
      uncompressedSize: rawBytes.length,
      fileCount: manifestFiles.length,
      sha256: storedHash
    }
  };
}

function normalizeArchiveInputs(inputs, options) {
  const list = Array.from(inputs ?? []);
  if (list.length === 0) {
    throw new Error("At least one file is required to create a folder archive");
  }

  if (list.length > options.maxFileCount) {
    throw new Error(`Too many files selected. Limit: ${options.maxFileCount}`);
  }

  let totalInputBytes = 0;
  const originalPaths = [];
  const normalized = list.map((input, index) => {
    if (!input || typeof input.arrayBuffer !== "function") {
      throw new TypeError("Archive inputs must provide arrayBuffer()");
    }
    const size = Number.isFinite(input.size) ? input.size : 0;
    if (size < 0 || !Number.isSafeInteger(size)) {
      throw new Error("Each archive input must expose a safe integer size");
    }
    if (size > options.maxFileBytes) {
      throw new Error(`File exceeds the per-file limit: ${input.name || `file-${index + 1}`}`);
    }

    totalInputBytes += size;
    if (totalInputBytes > options.maxInputBytes) {
      throw new Error(`Folder input exceeds the maximum supported size of ${options.maxInputBytes} bytes`);
    }

    const originalPath = getInputPath(input, index);
    originalPaths.push(originalPath);
    return {
      input,
      originalPath,
      size,
      mtime: Number.isFinite(input.lastModified) ? input.lastModified : 0,
      mimeType: typeof input.type === "string" && input.type ? input.type : "application/octet-stream"
    };
  });

  const commonRoot = options.rootName
    ? sanitizeNameSegment(options.rootName)
    : getCommonRoot(originalPaths);
  const rootName = commonRoot ?? safeFileStem(options.rootName || "transfer-folder");

  const seenPaths = new Set();
  const entries = normalized.map((entry) => {
    const relativePath = commonRoot && entry.originalPath.startsWith(`${commonRoot}/`)
      ? entry.originalPath.slice(commonRoot.length + 1)
      : entry.originalPath;
    const path = sanitizeRelativePath(relativePath);
    if (seenPaths.has(path)) {
      throw new Error(`Duplicate relative path detected: ${path}`);
    }
    seenPaths.add(path);
    const archiveEntry = {
      input: entry.input,
      path,
      size: entry.size,
      mtime: entry.mtime,
      mimeType: entry.mimeType
    };
    archiveEntry.groupKind = classifyGroupKind(archiveEntry);
    return archiveEntry;
  });

  return {
    rootName,
    totalInputBytes,
    entries
  };
}

function resolveArchiveOptions(options = {}) {
  const profileName = options.profile ?? "extreme";
  const profile = ARCHIVE_PROFILES[profileName];
  if (!profile) {
    throw new Error(`Unsupported archive profile: ${profileName}`);
  }

  return {
    profile: profileName,
    compressionLevel: options.compressionLevel ?? profile.compressionLevel,
    maxBlockBytes: options.maxBlockBytes ?? profile.maxBlockBytes,
    rawFallbackThresholdBytes: options.rawFallbackThresholdBytes ?? DEFAULT_RAW_FALLBACK_THRESHOLD_BYTES,
    maxFileCount: options.maxFileCount ?? DEFAULT_MAX_FILE_COUNT,
    maxInputBytes: options.maxInputBytes ?? DEFAULT_MAX_INPUT_BYTES,
    maxFileBytes: options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES,
    rootName: options.rootName,
    onProgress: typeof options.onProgress === "function" ? options.onProgress : null
  };
}

export async function createArchive(inputs, options = {}) {
  const resolvedOptions = resolveArchiveOptions(options);
  const normalized = normalizeArchiveInputs(inputs, resolvedOptions);
  const blocks = planBlocks(normalized.entries, resolvedOptions.maxBlockBytes);
  const manifestBlocks = [];
  const manifestFiles = [];
  const blockBytes = [];
  let processedBase = 0;

  for (const block of blocks) {
    const storedBlock = await createStoredArchiveBlock(block, {
      compressionLevel: resolvedOptions.compressionLevel,
      rawFallbackThresholdBytes: resolvedOptions.rawFallbackThresholdBytes,
      onProgress: resolvedOptions.onProgress,
      totalInputBytes: normalized.totalInputBytes,
      progressBaseBytes: processedBase
    });
    processedBase += block.uncompressedSize;
    blockBytes.push(storedBlock.storedBytes);
    manifestBlocks.push(storedBlock.manifestBlock);
    manifestFiles.push(...storedBlock.manifestFiles);
  }

  let compressedOffset = HEADER_SIZE;
  for (const manifestBlock of manifestBlocks) {
    manifestBlock.compressedOffset = compressedOffset;
    compressedOffset += manifestBlock.compressedSize;
  }

  const manifest = {
    format: ARCHIVE_MAGIC,
    version: ARCHIVE_VERSION,
    createdAt: new Date().toISOString(),
    rootName: normalized.rootName,
    settings: {
      profile: resolvedOptions.profile,
      codec: "gzip",
      solid: true,
      compressionLevel: resolvedOptions.compressionLevel,
      maxBlockBytes: resolvedOptions.maxBlockBytes,
      rawFallbackThresholdBytes: resolvedOptions.rawFallbackThresholdBytes
    },
    blocks: manifestBlocks,
    files: manifestFiles
  };

  const manifestBytes = textEncoder.encode(JSON.stringify(manifest));
  const manifestSha256 = await sha256Hex(manifestBytes);
  const footerBytes = createFooter(hexToBytes(manifestSha256));
  const headerBytes = createHeader({
    blockCount: manifestBlocks.length,
    manifestOffset: HEADER_SIZE + blockBytes.reduce((sum, bytes) => sum + bytes.length, 0),
    manifestLength: manifestBytes.length,
    totalInputBytes: normalized.totalInputBytes,
    fileCount: manifestFiles.length
  });

  resolvedOptions.onProgress?.({
    phase: "finalize",
    processedBytes: normalized.totalInputBytes,
    totalBytes: normalized.totalInputBytes,
    currentBlockId: manifestBlocks.length > 0 ? manifestBlocks.length - 1 : 0
  });

  const blob = new Blob([headerBytes, ...blockBytes, manifestBytes, footerBytes], {
    type: ARCHIVE_MIME_TYPE
  });
  const fileName = `${safeFileStem(normalized.rootName)}${ARCHIVE_EXTENSION}`;

  return {
    blob,
    fileName,
    manifestPreview: {
      format: ARCHIVE_MAGIC,
      version: ARCHIVE_VERSION,
      rootName: normalized.rootName,
      fileCount: manifestFiles.length,
      totalInputBytes: normalized.totalInputBytes,
      archiveSize: blob.size,
      blockCount: manifestBlocks.length
    }
  };
}

function validateManifest(manifest, header) {
  if (!manifest || manifest.format !== ARCHIVE_MAGIC || manifest.version !== ARCHIVE_VERSION) {
    throw new Error("Archive manifest is invalid");
  }
  if (!Array.isArray(manifest.blocks) || !Array.isArray(manifest.files)) {
    throw new Error("Archive manifest is missing blocks or files");
  }
  if (manifest.blocks.length !== header.blockCount) {
    throw new Error("Archive block count does not match the header");
  }
  if (manifest.files.length !== header.fileCount) {
    throw new Error("Archive file count does not match the header");
  }
}

export async function extractArchive(archive, options = {}) {
  const resolvedOptions = resolveArchiveOptions({
    ...options,
    rootName: undefined
  });
  const archiveBytes = new Uint8Array(await archive.arrayBuffer());
  if (archiveBytes.length < HEADER_SIZE + FOOTER_SIZE) {
    throw new Error("Archive is too small");
  }

  const header = parseHeader(archiveBytes);
  const footer = parseFooter(archiveBytes);
  if (header.manifestOffset < HEADER_SIZE || header.manifestOffset + header.manifestLength > archiveBytes.length - FOOTER_SIZE) {
    throw new Error("Archive manifest offsets are invalid");
  }

  const manifestBytes = archiveBytes.subarray(header.manifestOffset, header.manifestOffset + header.manifestLength);
  const manifestSha256 = await sha256Hex(manifestBytes);
  if (manifestSha256 !== footer.manifestSha256) {
    throw new Error("Archive manifest integrity check failed");
  }

  const manifest = JSON.parse(textDecoder.decode(manifestBytes));
  validateManifest(manifest, header);
  const rootName = sanitizeNameSegment(manifest.rootName || "transfer-folder");

  if (manifest.files.length > resolvedOptions.maxFileCount) {
    throw new Error(`Archive exceeds the supported file count limit of ${resolvedOptions.maxFileCount}`);
  }

  const blocksById = new Map();
  for (const block of manifest.blocks) {
    if (!Number.isInteger(block.blockId) || block.blockId < 0) {
      throw new Error("Archive block id is invalid");
    }
    if (blocksById.has(block.blockId)) {
      throw new Error(`Duplicate block id detected: ${block.blockId}`);
    }
    if (
      !Number.isInteger(block.compressedOffset)
      || !Number.isInteger(block.compressedSize)
      || !Number.isInteger(block.uncompressedSize)
      || block.compressedOffset < HEADER_SIZE
      || block.compressedSize < 0
      || block.uncompressedSize < 0
      || block.compressedOffset + block.compressedSize > header.manifestOffset
    ) {
      throw new Error("Archive block layout is invalid");
    }
    blocksById.set(block.blockId, block);
  }

  const extractedBlocks = new Map();
  for (const block of manifest.blocks) {
    const storedBytes = archiveBytes.subarray(block.compressedOffset, block.compressedOffset + block.compressedSize);
    const storedHash = await sha256Hex(storedBytes);
    if (storedHash !== block.sha256) {
      throw new Error(`Archive block checksum mismatch for block ${block.blockId}`);
    }

    let rawBytes;
    if (block.codec === "raw") {
      rawBytes = new Uint8Array(storedBytes);
    } else if (block.codec === "gzip") {
      rawBytes = gunzipSync(storedBytes);
    } else {
      throw new Error(`Unsupported archive codec: ${block.codec}`);
    }

    if (rawBytes.length !== block.uncompressedSize) {
      throw new Error(`Archive block size mismatch for block ${block.blockId}`);
    }
    extractedBlocks.set(block.blockId, rawBytes);
  }

  let extractedTotalBytes = 0;
  const seenPaths = new Set();
  const files = [];

  for (const file of manifest.files) {
    const path = sanitizeRelativePath(file.path);
    if (seenPaths.has(path)) {
      throw new Error(`Archive contains duplicate file path: ${path}`);
    }
    seenPaths.add(path);

    const block = blocksById.get(file.blockId);
    if (!block) {
      throw new Error(`Archive references missing block ${file.blockId}`);
    }
    if (
      !Number.isInteger(file.offsetInBlock)
      || !Number.isInteger(file.size)
      || file.offsetInBlock < 0
      || file.size < 0
      || file.offsetInBlock + file.size > block.uncompressedSize
    ) {
      throw new Error(`Archive file offset is invalid for ${path}`);
    }

    extractedTotalBytes += file.size;
    if (extractedTotalBytes > resolvedOptions.maxInputBytes) {
      throw new Error(`Archive expands beyond the supported size limit of ${resolvedOptions.maxInputBytes} bytes`);
    }

    const rawBlock = extractedBlocks.get(file.blockId);
    const fileBytes = rawBlock.slice(file.offsetInBlock, file.offsetInBlock + file.size);
    const fileHash = await sha256Hex(fileBytes);
    if (fileHash !== file.sha256) {
      throw new Error(`Archive file checksum mismatch for ${path}`);
    }

    files.push({
      path,
      size: file.size,
      mtime: Number.isFinite(file.mtime) ? file.mtime : 0,
      mimeType: typeof file.mimeType === "string" && file.mimeType ? file.mimeType : "application/octet-stream",
      bytes: fileBytes,
      blob: new Blob([fileBytes], {
        type: typeof file.mimeType === "string" && file.mimeType ? file.mimeType : "application/octet-stream"
      })
    });
  }

  return {
    fileName: typeof archive.name === "string" && archive.name ? archive.name : `${rootName}${ARCHIVE_EXTENSION}`,
    rootName,
    fileCount: files.length,
    totalInputBytes: header.totalInputBytes,
    files,
    manifest
  };
}

export async function createArchiveZipBlob(extractedArchive) {
  const zipBytes = zipSync(buildZipTree(extractedArchive), {
    level: 9
  });
  return {
    blob: new Blob([zipBytes], {
      type: "application/zip"
    }),
    fileName: `${safeFileStem(extractedArchive.rootName)}.zip`
  };
}

async function getUniqueChildDirectoryHandle(parentHandle, baseName) {
  const initialName = sanitizeNameSegment(baseName);
  let attempt = 0;

  while (attempt < 100) {
    const candidateName = attempt === 0 ? initialName : `${initialName}-${attempt + 1}`;
    try {
      await parentHandle.getDirectoryHandle(candidateName);
      attempt += 1;
    } catch (error) {
      if (error?.name !== "NotFoundError") {
        throw error;
      }
      return parentHandle.getDirectoryHandle(candidateName, { create: true });
    }
  }

  throw new Error("Could not allocate a unique output folder");
}

export async function saveExtractedArchiveToDirectory(extractedArchive, directoryHandle, options = {}) {
  if (!directoryHandle || directoryHandle.kind !== "directory") {
    throw new Error("A directory handle is required");
  }

  const outputRootHandle = await getUniqueChildDirectoryHandle(
    directoryHandle,
    safeFileStem(options.outputDirectoryName || extractedArchive.rootName)
  );

  for (const file of extractedArchive.files) {
    const segments = sanitizeRelativePath(file.path).split("/");
    let parentHandle = outputRootHandle;
    for (let index = 0; index < segments.length - 1; index += 1) {
      parentHandle = await parentHandle.getDirectoryHandle(segments[index], { create: true });
    }
    const fileHandle = await parentHandle.getFileHandle(segments[segments.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(await file.blob.arrayBuffer());
    } finally {
      await writable.close();
    }
  }

  return {
    directoryName: outputRootHandle.name,
    fileCount: extractedArchive.fileCount
  };
}

export async function isArchiveBlob(blobLike) {
  if (!blobLike || typeof blobLike.slice !== "function" || typeof blobLike.arrayBuffer !== "function") {
    return false;
  }
  if (blobLike.type === ARCHIVE_MIME_TYPE) {
    return true;
  }
  const headerSlice = blobLike.slice(0, 5);
  const bytes = new Uint8Array(await headerSlice.arrayBuffer());
  return readFixedAscii(bytes, 0, 5) === ARCHIVE_MAGIC;
}

export function supportsDirectorySave() {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}
