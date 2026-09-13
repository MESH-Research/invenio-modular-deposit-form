import { areDeeplyEqual } from "./utils";

describe("areDeeplyEqual", () => {
  it("treats identical objects as equal", () => {
    expect(areDeeplyEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
  });

  it("treats an ignored key present on only one side as equal", () => {
    expect(
      areDeeplyEqual({ files: { enabled: true } }, { files: { enabled: true, count: 0 } }, [
        "files.count",
      ])
    ).toBe(true);
  });

  it("still detects a real difference under an ignored sibling", () => {
    expect(
      areDeeplyEqual({ files: { enabled: true } }, { files: { enabled: false, count: 0 } }, [
        "files.count",
      ])
    ).toBe(false);
  });

  it("ignores a top-level key present on only one side", () => {
    expect(areDeeplyEqual({ title: "" }, { title: "", ui: { languages: [] } }, ["ui"])).toBe(
      true
    );
  });

  it("does not ignore a key that is not listed", () => {
    expect(
      areDeeplyEqual({ files: { enabled: true } }, { files: { enabled: true, count: 0 } })
    ).toBe(false);
  });
});
