import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import {
  ARCHIVE_MIME_TYPE,
  createArchive,
  createArchiveZipBlob,
  extractArchive,
  isArchiveBlob,
  saveExtractedArchiveToDirectory
} from "../src/archive.js";

function createFolderFile(path, contents, type = "text/plain") {
  const fileName = path.split("/").pop();
  const file = new File([contents], fileName, {
    type,
    lastModified: 1_710_000_000_000
  });
  Object.defineProperty(file, "webkitRelativePath", {
    configurable: true,
    value: path
  });
  return file;
}

class MemoryFileHandle {
  constructor(name) {
    this.kind = "file";
    this.name = name;
    this.bytes = new Uint8Array(0);
  }

  async createWritable() {
    return {
      write: async (data) => {
        this.bytes = data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      },
      close: async () => {}
    };
  }
}

class MemoryDirectoryHandle {
  constructor(name) {
    this.kind = "directory";
    this.name = name;
    this.directories = new Map();
    this.files = new Map();
  }

  async getDirectoryHandle(name, options = {}) {
    if (this.directories.has(name)) {
      return this.directories.get(name);
    }
    if (options.create) {
      const handle = new MemoryDirectoryHandle(name);
      this.directories.set(name, handle);
      return handle;
    }
    const error = new Error(`Directory not found: ${name}`);
    error.name = "NotFoundError";
    throw error;
  }

  async getFileHandle(name, options = {}) {
    if (this.files.has(name)) {
      return this.files.get(name);
    }
    if (options.create) {
      const handle = new MemoryFileHandle(name);
      this.files.set(name, handle);
      return handle;
    }
    const error = new Error(`File not found: ${name}`);
    error.name = "NotFoundError";
    throw error;
  }
}

describe("archive flow", () => {
  it("creates and extracts a folder archive round-trip", async () => {
    const inputs = [
      createFolderFile("project/src/app.ts", "export const answer = 42;\n"),
      createFolderFile("project/README.md", "# Demo\n")
    ];

    const archive = await createArchive(inputs);
    expect(archive.blob.type).toBe(ARCHIVE_MIME_TYPE);
    expect(archive.fileName).toBe("project.sarc1");

    const extracted = await extractArchive(archive.blob);
    expect(extracted.rootName).toBe("project");
    expect(extracted.fileCount).toBe(2);
    expect(extracted.files.map((file) => file.path)).toEqual([
      "src/app.ts",
      "README.md"
    ]);
    expect(await extracted.files[0].blob.text()).toBe("export const answer = 42;\n");
    expect(await extracted.files[1].blob.text()).toBe("# Demo\n");
    expect(await isArchiveBlob(archive.blob)).toBe(true);
  });

  it("rejects unsafe relative paths", async () => {
    const input = createFolderFile("project/../secret.txt", "shh");

    await expect(createArchive([input])).rejects.toThrow(/Relative traversal/);
  });

  it("creates a standard zip fallback from an extracted archive", async () => {
    const archive = await createArchive([
      createFolderFile("bundle/docs/guide.md", "guide"),
      createFolderFile("bundle/src/main.js", "console.log('ok');\n", "text/javascript")
    ]);

    const extracted = await extractArchive(archive.blob);
    const zipArtifact = await createArchiveZipBlob(extracted);
    const zipBytes = new Uint8Array(await zipArtifact.blob.arrayBuffer());
    const files = unzipSync(zipBytes);

    expect(zipArtifact.fileName).toBe("bundle.zip");
    expect(Object.keys(files).filter((name) => !name.endsWith("/")).sort()).toEqual([
      "bundle/docs/guide.md",
      "bundle/src/main.js"
    ]);
  });

  it("saves extracted files into a unique subdirectory", async () => {
    const archive = await createArchive([
      createFolderFile("workspace/notes/todo.txt", "ship it")
    ]);
    const extracted = await extractArchive(archive.blob);

    const root = new MemoryDirectoryHandle("root");
    await root.getDirectoryHandle("workspace", { create: true });
    const result = await saveExtractedArchiveToDirectory(extracted, root);

    expect(result.directoryName).toBe("workspace-2");
    const savedRoot = await root.getDirectoryHandle("workspace-2");
    const notesDir = await savedRoot.getDirectoryHandle("notes");
    const fileHandle = await notesDir.getFileHandle("todo.txt");
    expect(new TextDecoder().decode(fileHandle.bytes)).toBe("ship it");
  });
});
