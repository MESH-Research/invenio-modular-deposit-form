import {
  attachUppyTransferIntegrity,
  checksumsMatch,
  disableCheckPartIntegrity,
  waitForMd5Checksum,
} from "./uppyTransferIntegrity";

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

describe("checksumsMatch", () => {
  it("matches md5: prefix case-insensitively", () => {
    expect(checksumsMatch("abcDEF", "md5:abcdef")).toBe(true);
    expect(checksumsMatch("abcdef", "MD5:ABCDEF")).toBe(true);
  });

  it("rejects non-md5 or mismatched digests", () => {
    expect(checksumsMatch("abcdef", "multipart:etag-1")).toBe(false);
    expect(checksumsMatch("abcdef", "md5:000000")).toBe(false);
    expect(checksumsMatch("", "md5:abcdef")).toBe(false);
    expect(checksumsMatch("abcdef", null)).toBe(false);
  });
});

describe("waitForMd5Checksum", () => {
  it("returns once checksum is md5:", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ checksum: "multipart:etag-5" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ checksum: "md5:abc123" }),
      });
    const sleep = jest.fn(async () => {});

    await expect(
      waitForMd5Checksum("/api/files/1", {
        fetchImpl,
        sleep,
        intervalMs: 1,
        timeoutMs: 1000,
      })
    ).resolves.toBe("md5:abc123");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("throws on timeout", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checksum: "multipart:etag-5" }),
    });
    const sleep = jest.fn(async () => {});

    await expect(
      waitForMd5Checksum("/api/files/1", {
        fetchImpl,
        sleep,
        intervalMs: 10,
        timeoutMs: 5,
      })
    ).rejects.toThrow(/Timed out/);
  });
});

describe("disableCheckPartIntegrity", () => {
  it("sets checkPartIntegrity false on the RDM plugin", () => {
    const setOptions = jest.fn();
    const uppy = {
      getPlugin: jest.fn(() => ({ setOptions })),
    };
    disableCheckPartIntegrity(uppy);
    expect(uppy.getPlugin).toHaveBeenCalledWith("RDMUppyUploaderPlugin");
    expect(setOptions).toHaveBeenCalledWith({ checkPartIntegrity: false });
  });

  it("no-ops when plugin is missing", () => {
    expect(() => disableCheckPartIntegrity({ getPlugin: () => null })).not.toThrow();
    expect(() => disableCheckPartIntegrity(null)).not.toThrow();
  });
});

describe("attachUppyTransferIntegrity", () => {
  it("warns and keeps the file when md5 checksum never appears", async () => {
    const uppy = createFakeUppy();
    const deleteFile = jest.fn(async () => {});
    const hashFile = jest.fn(async () => "aabbcc");
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checksum: "multipart:etag-9" }),
    });

    attachUppyTransferIntegrity(uppy, {
      deleteFile,
      hashFile,
      fetchImpl,
      intervalMs: 10,
      timeoutMs: 5,
    });

    const file = {
      id: "f3",
      name: "slow.pdf",
      data: new Blob([Uint8Array.from([1])]),
      meta: { links: { self: "/api/files/f3" } },
    };

    await uppy.emit("file-added", file);
    await uppy.emit("upload-success", file);

    expect(deleteFile).not.toHaveBeenCalled();
    expect(uppy.info).toHaveBeenCalledWith(
      expect.stringContaining("Could not confirm transfer integrity"),
      "warning",
      expect.any(Number)
    );
  });
});
