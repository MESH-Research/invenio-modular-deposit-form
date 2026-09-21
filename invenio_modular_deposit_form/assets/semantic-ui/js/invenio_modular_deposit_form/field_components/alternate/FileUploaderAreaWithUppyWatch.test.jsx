import { hasUnconfirmedUppyFiles } from "./FileUploaderAreaWithUppyWatch";

describe("hasUnconfirmedUppyFiles", () => {
  it("returns false when uppy is missing", () => {
    expect(hasUnconfirmedUppyFiles(null)).toBe(false);
    expect(hasUnconfirmedUppyFiles(undefined)).toBe(false);
  });

  it("returns false when the queue is empty", () => {
    expect(hasUnconfirmedUppyFiles({ getFiles: () => [] })).toBe(false);
  });

  it("returns true when a file has not started uploading", () => {
    const uppy = {
      getFiles: () => [{ progress: { uploadStarted: null } }],
    };
    expect(hasUnconfirmedUppyFiles(uppy)).toBe(true);
  });

  it("returns false when every file has started uploading", () => {
    const uppy = {
      getFiles: () => [
        { progress: { uploadStarted: 1 } },
        { progress: { uploadStarted: Date.now() } },
      ],
    };
    expect(hasUnconfirmedUppyFiles(uppy)).toBe(false);
  });

  it("returns true if any file is still unstarted", () => {
    const uppy = {
      getFiles: () => [
        { progress: { uploadStarted: 1 } },
        { progress: { uploadStarted: undefined } },
      ],
    };
    expect(hasUnconfirmedUppyFiles(uppy)).toBe(true);
  });
});
