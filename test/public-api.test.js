import { beforeEach, describe, expect, it, vi } from "vitest";

let receiverScenario = { kind: "file" };

vi.mock("../src/sender.js", () => {
  class MockSender {
    constructor(options = {}) {
      this.canvas = options.canvas ?? null;
      this.prepared = null;
      this.frameIndex = 0;
      this.loopIndex = 0;
      this.running = false;
    }

    async prepare(fileLike, options = {}) {
      const buffer = await fileLike.arrayBuffer();
      this.prepared = {
        sessionId: options.sessionId ?? "mock-session",
        fileName: options.fileName ?? fileLike.name ?? "transfer.bin",
        mimeType: options.mimeType ?? fileLike.type ?? "application/octet-stream",
        fileSize: buffer.byteLength,
        totalChunks: Math.max(1, Math.ceil(buffer.byteLength / 4)),
        symbolsPerFrame: options.symbolsPerFrame ?? 1,
        parityBlockDataChunks: options.parityBlockDataChunks ?? 0,
        displayFrames: [{}, {}],
        estimatedStats: {
          fileSize: buffer.byteLength,
          chunkByteSize: options.chunkByteSize ?? 220,
          frameIntervalMs: options.frameIntervalMs ?? 250,
          symbolsPerFrame: options.symbolsPerFrame ?? 1,
          totalChunks: Math.max(1, Math.ceil(buffer.byteLength / 4)),
          totalSymbols: Math.max(1, Math.ceil(buffer.byteLength / 4)) + 1,
          totalFrames: 2,
          loopDurationMs: 500,
          bytesPerSecond: buffer.byteLength / 0.5
        }
      };
      return this.prepared;
    }

    async renderFrameAt() {
      return [];
    }

    async start() {
      if (!this.prepared) {
        throw new Error("No transfer prepared");
      }
      this.running = true;
    }

    stop() {
      this.running = false;
    }
  }

  return {
    AnimatedQrSender: MockSender
  };
});

vi.mock("../src/receiver.js", () => {
  class FakeEmitter {
    constructor() {
      this.listeners = new Map();
    }

    on(eventName, listener) {
      const listeners = this.listeners.get(eventName) ?? new Set();
      listeners.add(listener);
      this.listeners.set(eventName, listeners);
      return () => this.off(eventName, listener);
    }

    off(eventName, listener) {
      this.listeners.get(eventName)?.delete(listener);
    }

    emit(eventName, payload) {
      for (const listener of this.listeners.get(eventName) ?? []) {
        listener(payload);
      }
    }
  }

  class MockReceiver extends FakeEmitter {
    constructor(options = {}) {
      super();
      this.video = options.video ?? null;
      this.scanCanvas = options.scanCanvas ?? null;
      this.stream = null;
      this.scanning = false;
    }

    async start() {
      if (receiverScenario.kind === "start-error") {
        throw new Error("Camera permission denied");
      }
      this.scanning = true;
      this.stream = { id: "mock-stream" };
      this.emit("camera-start", { stream: this.stream });
      this.emit("camera-tuned", { optimized: true, settings: { width: 1280, height: 720, frameRate: 30 } });
      this.emit("scan-start", {});
      queueMicrotask(() => {
        this.emit("decoder-mode", { mode: "worker" });
        this.emit("manifest", {
          sessionId: "mock-session",
          fileName: receiverScenario.kind === "folder" ? "folder.sarc1" : "demo.txt",
          mimeType: receiverScenario.kind === "folder"
            ? "application/vnd.animated-data-qr.sarc1"
            : "text/plain",
          fileSize: 12,
          chunkByteSize: 4,
          symbolsPerFrame: 1,
          parityBlockDataChunks: 0,
          totalChunks: 3
        });
        this.emit("progress", {
          sessionId: "mock-session",
          receivedChunks: 3,
          totalChunks: 3,
          ratio: 1
        });
        this.emit("diagnostics", {
          sessionId: "mock-session",
          totalFramesSeen: 3,
          newFrames: 3,
          duplicateFrames: 0,
          uniqueFrameRatio: 1,
          manifestFrames: 1,
          chunkFrames: 2,
          parityFrames: 0,
          parityRecoveries: 0,
          receivedChunks: 3,
          totalChunks: 3
        });
        this.emit("complete", receiverScenario.kind === "folder"
          ? {
              sessionId: "mock-session",
              blob: new Blob(["archive"], { type: "application/vnd.animated-data-qr.sarc1" }),
              fileName: "folder.sarc1",
              mimeType: "application/vnd.animated-data-qr.sarc1",
              size: 7,
              totalChunks: 3,
              receivedChunks: 3
            }
          : {
              sessionId: "mock-session",
              blob: new Blob(["hello"], { type: "text/plain" }),
              fileName: "demo.txt",
              mimeType: "text/plain",
              size: 5,
              totalChunks: 3,
              receivedChunks: 3
            });
        this.scanning = false;
        this.emit("scan-stop", {});
      });
    }

    stop() {
      this.scanning = false;
      this.emit("scan-stop", {});
      this.emit("camera-stop", {});
    }

    stopCamera() {
      this.emit("camera-stop", {});
    }

    reset() {}
  }

  return {
    AnimatedQrReceiver: MockReceiver,
    createDownloadLink(result, anchorElement = null) {
      const anchor = anchorElement ?? { href: "", download: "" };
      anchor.download = result.fileName;
      anchor.href = `blob:${result.fileName}`;
      return {
        url: anchor.href,
        anchor
      };
    }
  };
});

vi.mock("../src/archive.js", async () => {
  return {
    createArchive: vi.fn(async (inputs, options = {}) => ({
      blob: new Blob(["archive-data"], { type: "application/vnd.animated-data-qr.sarc1" }),
      fileName: `${options.rootName ?? "transfer-folder"}.sarc1`,
      manifestPreview: {
        format: "SARC1",
        version: 1,
        rootName: options.rootName ?? "transfer-folder",
        fileCount: inputs.length ?? 0,
        totalInputBytes: 10,
        archiveSize: 12,
        blockCount: 1
      }
    })),
    extractArchive: vi.fn(async () => ({
      fileName: "folder.sarc1",
      rootName: "transfer-folder",
      fileCount: 1,
      totalInputBytes: 11,
      files: [
        {
          path: "docs/readme.txt",
          size: 11,
          mtime: 0,
          mimeType: "text/plain",
          bytes: new Uint8Array([104, 101, 108, 108, 111]),
          blob: new Blob(["hello"], { type: "text/plain" })
        }
      ],
      manifest: {
        format: "SARC1",
        version: 1,
        createdAt: new Date().toISOString(),
        rootName: "transfer-folder",
        settings: {},
        blocks: [],
        files: []
      }
    })),
    isArchiveBlob: vi.fn(async (blob) => blob.type === "application/vnd.animated-data-qr.sarc1"),
    createArchiveZipBlob: vi.fn(),
    saveExtractedArchiveToDirectory: vi.fn()
  };
});

import {
  createQrSender,
  createQrReceiver
} from "../src/index.js";

function createFakeNode(tagName) {
  return {
    tagName,
    style: {},
    className: "",
    dataset: {},
    width: 0,
    height: 0,
    autoplay: false,
    muted: false,
    playsInline: false,
    parentNode: null,
    setAttribute(name, value) {
      this[name] = value;
    },
    getContext() {
      return {
        clearRect() {}
      };
    }
  };
}

function createFakeTarget() {
  return {
    children: [],
    appendChild(node) {
      this.children.push(node);
      node.parentNode = this;
      return node;
    },
    removeChild(node) {
      this.children = this.children.filter((child) => child !== node);
      node.parentNode = null;
      return node;
    }
  };
}

beforeEach(() => {
  receiverScenario = { kind: "file" };
  globalThis.document = {
    createElement(tagName) {
      return createFakeNode(tagName.toUpperCase());
    }
  };
});

describe("library-first public API", () => {
  it("mounts a sender, accepts text/bytes/blob inputs, and owns the canvas", async () => {
    const target = createFakeTarget();
    const sender = createQrSender(target, {
      frameIntervalMs: 200
    });

    expect(target.children).toHaveLength(1);
    expect(sender.getState().elements.canvas).toBe(target.children[0]);

    const textSummary = await sender.loadText("hello", { fileName: "hello.txt" });
    expect(textSummary.inputKind).toBe("text");
    expect(textSummary.fileName).toBe("hello.txt");

    const bytesSummary = await sender.loadBytes(new Uint8Array([1, 2, 3]), { fileName: "bytes.bin" });
    expect(bytesSummary.inputKind).toBe("bytes");
    expect(bytesSummary.fileName).toBe("bytes.bin");

    const blobSummary = await sender.loadBlob(new Blob(["blob-data"], { type: "text/plain" }), {
      fileName: "blob.txt"
    });
    expect(blobSummary.inputKind).toBe("blob");
    expect(sender.getState().status).toBe("prepared");

    await sender.start();
    expect(sender.getState().status).toBe("running");
    sender.stop();
    expect(sender.getState().status).toBe("prepared");

    sender.clear();
    expect(sender.getState().status).toBe("idle");
    sender.destroy();
    expect(target.children).toHaveLength(0);
  });

  it("packs folder inputs through the sender wrapper", async () => {
    const target = createFakeTarget();
    const sender = createQrSender(target);
    const files = [
      Object.assign(new Blob(["hello"], { type: "text/plain" }), {
        name: "readme.txt",
        webkitRelativePath: "transfer-folder/readme.txt"
      })
    ];

    const summary = await sender.loadFolder(files, { rootName: "transfer-folder" });
    expect(summary.inputKind).toBe("folder");
    expect(summary.archive?.rootName).toBe("transfer-folder");
  });

  it("resolves file receive results and invokes callbacks", async () => {
    const target = createFakeTarget();
    const calls = {
      manifest: 0,
      progress: 0,
      diagnostics: 0,
      cameraStart: 0,
      cameraStop: 0
    };
    const receiver = createQrReceiver(target, {
      onManifest() {
        calls.manifest += 1;
      },
      onProgress() {
        calls.progress += 1;
      },
      onDiagnostics() {
        calls.diagnostics += 1;
      },
      onCameraStart() {
        calls.cameraStart += 1;
      },
      onCameraStop() {
        calls.cameraStop += 1;
      }
    });

    const result = await receiver.start();
    expect(result.kind).toBe("file");
    expect(result.fileName).toBe("demo.txt");
    expect(receiver.getState().status).toBe("completed");
    expect(calls.manifest).toBe(1);
    expect(calls.progress).toBe(1);
    expect(calls.diagnostics).toBe(1);
    expect(calls.cameraStart).toBe(1);

    receiver.destroy();
    expect(target.children).toHaveLength(0);
  });

  it("resolves folder receive results after archive extraction", async () => {
    receiverScenario = { kind: "folder" };
    const target = createFakeTarget();
    const receiver = createQrReceiver(target);

    const result = await receiver.start();
    expect(result.kind).toBe("folder");
    expect(result.archiveFileName).toBe("folder.sarc1");
    expect(result.extracted.rootName).toBe("transfer-folder");
  });

  it("rejects receiver.start() when camera startup fails", async () => {
    receiverScenario = { kind: "start-error" };
    const target = createFakeTarget();
    const receiver = createQrReceiver(target);

    await expect(receiver.start()).rejects.toThrow("Camera permission denied");
    expect(receiver.getState().status).toBe("error");
  });

  it("rejects invalid mount targets", () => {
    expect(() => createQrSender(null)).toThrow(/DOM element container/);
    expect(() => createQrReceiver({})).toThrow(/DOM element container/);
  });
});
