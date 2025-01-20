import {
  areDeeplyEqual,
  getTouchedParent,
  moveToArrayStart,
  pushToArrayEnd,
  flattenKeysDotJoined,
} from "./utils";

describe("areDeeplyEqual", () => {
  // test that the function returns true if the objects are nested four levels deep and are deeply equal
  test("returns true if the objects are deeply equal", () => {
    expect(
      areDeeplyEqual(
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" },
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" }
      )
    ).toBe(true);
  });

  test("returns false if int values are different", () => {
    expect(
      areDeeplyEqual(
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" },
        { a: 2, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" }
      )
    ).toBe(false);
  });

  test("returns false if string values are different", () => {
    expect(
      areDeeplyEqual(
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" },
        { a: 1, b: ["foo", "baz"], c: { d: 1, e: 2 }, f: "FOO" }
      )
    ).toBe(false);
  });

  test("returns false if nested objects are different", () => {
    expect(
      areDeeplyEqual(
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" },
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 3 }, f: "FOO" }
      )
    ).toBe(false);
  });

  test("returns false if top-level string values are different", () => {
    expect(
      areDeeplyEqual(
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "FOO" },
        { a: 1, b: ["foo", "bar"], c: { d: 1, e: 2 }, f: "BAR" }
      )
    ).toBe(false);
  });

  test("returns true if the objects are deeply equal with ignoreKeys", () => {
    expect(areDeeplyEqual({ a: 1 }, { a: 2 }, ["a"])).toBe(true);
  });

  test("works with nested objects and arrays four levels deep", () => {
    expect(
      areDeeplyEqual(
        { a: { b: { c: { d: 1 } } }, e: { f: { g: { h: 2 } } } },
        { a: { b: { c: { d: 2 } } }, e: { f: { g: { h: 2 } } } },
        ["a.b.c.d"]
      )
    ).toBe(true);
  });

  test("works with nested objects and arrays four levels deep using an ignoreKey that identifies a key in the first level", () => {
    expect(
      areDeeplyEqual(
        { a: { b: { c: { d: 1 } } }, e: { f: { g: { h: 2 } } } },
        { a: { b: { c: { d: 2 } } }, e: { f: { g: { h: 2 } } } },
        ["a"]
      )
    ).toBe(true);
  });

  test("ignoreKeys works when identifying a key in the second level of nested objects", () => {
    expect(
      areDeeplyEqual(
        { a: { b: { c: { d: 1 } } }, e: { f: { g: { h: 2 } } } },
        { a: { b: { c: { d: 2 } } }, e: { f: { g: { h: 2 } } } },
        ["a.b"]
      )
    ).toBe(true);
  });
});

describe("moveToArrayStart", () => {
  test("moves the objects with the given key values to the start of the array", () => {
    expect(
      moveToArrayStart(
        [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }],
        [{ a: 3 }, { a: 2 }],
        "a"
      )
    ).toEqual([{ a: 3 }, { a: 2 }, { a: 1 }, { a: 4 }]);
  });
});

describe("pushToArrayEnd", () => {
  test("pushes the elements with the given key values to the end of the array", () => {
    expect(
      pushToArrayEnd([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }], [{ a: 3 }, { a: 2 }], "a")
    ).toEqual([{ a: 1 }, { a: 4 }, { a: 3 }, {a: 2 }]);
  });
});

describe("flattenKeysDotJoined", () => {
  test("flattens the keys of the given object into a single string", () => {
    expect(flattenKeysDotJoined({ a: { b: { c: 1 }, d: { e: { f: 2, g: 3 } }, h: 4 } })).toEqual(["a.b.c", "a.d.e.f", "a.d.e.g", "a.h"]);
  });
});

// FIXME: Figure out how to properly mock the touched object
// describe("getTouchedParent", () => {
//   test("returns the first ancestor of the field that is touched, or false if no ancestor is touched", () => {
//     expect(
//       getTouchedParent({ a: true, "a.b": false, "a.b.c": false }, "a.b.c")
//     ).toEqual("a.b");
//   });
// });
