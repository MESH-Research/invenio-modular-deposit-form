import {
  buildRecordForModal,
  fillMissingFromRedux,
  mergeShareRecordIntoFormik,
  shouldFillFromRedux,
} from "./depositShareRecord";

describe("shouldFillFromRedux", () => {
  it("fills when Formik is nullish and Redux has a value", () => {
    expect(shouldFillFromRedux(undefined, { a: 1 })).toBe(true);
    expect(shouldFillFromRedux(null, { a: 1 })).toBe(true);
  });

  it("fills empty Formik objects from non-empty Redux objects", () => {
    expect(shouldFillFromRedux({}, { a: 1 })).toBe(true);
  });

  it("does not overwrite existing Formik values", () => {
    expect(shouldFillFromRedux({ a: 1 }, { a: 2 })).toBe(false);
    expect(shouldFillFromRedux([], [1])).toBe(false);
  });

  it("does not fill when Redux is nullish", () => {
    expect(shouldFillFromRedux(undefined, null)).toBe(false);
  });
});

describe("fillMissingFromRedux", () => {
  const settings = {
    allow_user_requests: false,
    allow_guest_requests: false,
    secret_link_expiration: 0,
  };

  it("returns the same reference when nothing is missing", () => {
    const values = {
      expanded: { x: 1 },
      links: { self: "/a" },
      parent: { access: { settings } },
    };
    const record = {
      expanded: { x: 1 },
      links: { self: "/a" },
      parent: { access: { settings } },
    };
    expect(fillMissingFromRedux(values, record)).toBe(values);
  });

  it("copies settings from Redux when Formik lacks them", () => {
    const values = {
      expanded: { x: 1 },
      links: { self: "/a" },
      parent: { access: { owned_by: { user: 1 } } },
    };
    const record = {
      expanded: { x: 1 },
      links: { self: "/a" },
      parent: { access: { owned_by: { user: 1 }, settings } },
    };
    const filled = fillMissingFromRedux(values, record);
    expect(filled).not.toBe(values);
    expect(filled.parent.access.settings).toEqual(settings);
    expect(filled.parent.access.owned_by).toEqual({ user: 1 });
  });

  it("does not mutate the Redux record", () => {
    const values = { parent: { access: {} } };
    const record = {
      parent: { access: { settings } },
    };
    fillMissingFromRedux(values, record);
    expect(record.parent.access).toEqual({ settings });
  });
});

describe("buildRecordForModal", () => {
  it("clones parent.access so modal mutations stay isolated", () => {
    const values = {
      id: "1",
      parent: { access: { settings: { a: 1 }, grants: [] } },
    };
    const snapshot = buildRecordForModal(values);
    snapshot.parent.access.settings = { a: 2 };
    expect(values.parent.access.settings).toEqual({ a: 1 });
  });
});

describe("mergeShareRecordIntoFormik", () => {
  it("merges only share-related paths", () => {
    const values = {
      metadata: { title: "Draft title" },
      parent: { access: { owned_by: { user: 1 } } },
    };
    const modalRecord = {
      metadata: { title: "Should not win" },
      expanded: { e: 1 },
      links: { access: "/access" },
      parent: {
        access: {
          settings: { allow_user_requests: true },
          grants: [{ id: "g1" }],
        },
      },
    };
    const merged = mergeShareRecordIntoFormik(values, modalRecord);
    expect(merged.metadata.title).toBe("Draft title");
    expect(merged.expanded).toEqual({ e: 1 });
    expect(merged.links).toEqual({ access: "/access" });
    expect(merged.parent.access.settings).toEqual({
      allow_user_requests: true,
    });
    expect(merged.parent.access.grants).toEqual([{ id: "g1" }]);
    expect(merged.parent.access.owned_by).toEqual({ user: 1 });
  });
});
