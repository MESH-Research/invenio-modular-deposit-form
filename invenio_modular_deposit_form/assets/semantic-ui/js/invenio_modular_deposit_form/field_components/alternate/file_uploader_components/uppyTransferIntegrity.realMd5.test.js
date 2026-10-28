/**
 * Real hash-wasm MD5 against a committed fixture (Node crypto as oracle).
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { attachUppyTransferIntegrity, hashFileMd5Hex } = require("./uppyTransferIntegrity");

const FIXTURE_PATH = path.join(__dirname, "__fixtures__", "sample.bin");

function createFakeUppy() {
  const handlers = {};
  return {
    handlers,
    on(event, fn) {
      handlers[event] = handlers[event] || [];
      handlers[event].push(fn);
    },
    off(event, fn) {
      handlers[event] = (handlers[event] || []).filter((h) => h !== fn);
    },
    info: jest.fn(),
    getPlugin: jest.fn(),
    async emit(event, ...args) {
      for (const fn of handlers[event] || []) {
        // eslint-disable-next-line no-await-in-loop
        await fn(...args);
      }
    },
  };
}

describe("uppyTransferIntegrity real MD5 (fixture)", () => {
  const fixtureBytes = fs.readFileSync(FIXTURE_PATH);
  const expectedHex = crypto.createHash("md5").update(fixtureBytes).digest("hex");

  it("hashFileMd5Hex matches Node crypto for the fixture (chunked)", async () => {
    const blob = new Blob([fixtureBytes]);
    const hex = await hashFileMd5Hex(blob, 1024);
    expect(hex).toBe(expectedHex);
  });

  it("attachUppyTransferIntegrity keeps the file when remote md5 matches", async () => {
    const uppy = createFakeUppy();
    const deleteFile = jest.fn(async () => {});
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checksum: `md5:${expectedHex}` }),
    });

    attachUppyTransferIntegrity(uppy, {
      deleteFile,
      fetchImpl,
      intervalMs: 1,
      timeoutMs: 100,
    });

    const file = {
      id: "real-ok",
      name: "sample.bin",
      data: new Blob([fixtureBytes]),
      meta: { links: { self: "/api/files/real-ok" } },
    };

    await uppy.emit("file-added", file);
    await uppy.emit("upload-success", file);

    expect(deleteFile).not.toHaveBeenCalled();
  });

  it("attachUppyTransferIntegrity deletes when remote md5 differs", async () => {
    const uppy = createFakeUppy();
    const deleteFile = jest.fn(async () => {});
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checksum: "md5:00000000000000000000000000000000" }),
    });

    attachUppyTransferIntegrity(uppy, {
      deleteFile,
      fetchImpl,
      intervalMs: 1,
      timeoutMs: 100,
    });

    const file = {
      id: "real-bad",
      name: "sample.bin",
      data: new Blob([fixtureBytes]),
      meta: { links: { self: "/api/files/real-bad" } },
    };

    await uppy.emit("file-added", file);
    await uppy.emit("upload-success", file);

    expect(deleteFile).toHaveBeenCalledWith(file);
    expect(uppy.info).toHaveBeenCalledWith(
      expect.stringContaining("Transfer integrity check failed"),
      "error",
      expect.any(Number)
    );
  });
});
