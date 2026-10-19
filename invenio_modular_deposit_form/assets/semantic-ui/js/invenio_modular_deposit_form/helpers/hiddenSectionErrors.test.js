import {
  getHiddenErrors,
  getHiddenValuedFields,
  suggestResourceTypesForPaths,
} from "./hiddenSectionErrors";

/**
 * Minimal formSectionFields-shaped fixtures.
 * page "1" has publisher for type-a only; journal for type-b only;
 * abstract for both.
 */
const sectionsConfig = [
  {
    pageId: "1",
    resourceTypes: ["type-a"],
    fields: ["metadata.publisher", "metadata.abstract"],
  },
  {
    pageId: "1",
    resourceTypes: ["type-b"],
    fields: ["metadata.journal", "metadata.abstract"],
  },
  {
    pageId: "2",
    resourceTypes: ["type-a", "type-b"],
    fields: ["metadata.creators"],
  },
];

/** Current type is type-a on page 1: publisher + abstract visible; journal hidden. */
const currentFormPageFieldsTypeA = {
  "1": ["metadata.publisher", "metadata.abstract"],
};

describe("getHiddenErrors", () => {
  it("returns flagged error paths that are hidden but configured on this page", () => {
    const result = getHiddenErrors(
      [{ error_fields: ["metadata.journal", "metadata.publisher"] }],
      sectionsConfig,
      "type-a",
      currentFormPageFieldsTypeA,
      "1"
    );

    expect(result.hiddenPaths).toEqual(["metadata.journal"]);
    expect(result.suggestedResourceTypes).toContain("type-b");
    expect(result.suggestedResourceTypes).not.toContain("type-a");
  });

  it("excludes errors only configured on another page", () => {
    const result = getHiddenErrors(
      [{ error_fields: ["metadata.creators"] }],
      sectionsConfig,
      "type-a",
      currentFormPageFieldsTypeA,
      "1"
    );

    expect(result.hiddenPaths).toEqual([]);
    expect(result.suggestedResourceTypes).toEqual([]);
  });

  it("dedupes error paths across flagged sections", () => {
    const result = getHiddenErrors(
      [
        { error_fields: ["metadata.journal"] },
        { error_fields: ["metadata.journal", "metadata.journal.title"] },
      ],
      sectionsConfig,
      "type-a",
      currentFormPageFieldsTypeA,
      "1"
    );

    // journal.title matches journal via fieldMatches and is configured on page
    expect(result.hiddenPaths).toEqual([
      "metadata.journal",
      "metadata.journal.title",
    ]);
  });

  it("handles empty / invalid inputs", () => {
    expect(
      getHiddenErrors(null, null, "type-a", null, "1")
    ).toEqual({ hiddenPaths: [], suggestedResourceTypes: [] });
  });
});

describe("getHiddenValuedFields", () => {
  it("lists non-empty hidden configured paths and all page-hidden paths for touching", () => {
    const values = {
      metadata: {
        journal: "Nature",
        publisher: "Springer",
        abstract: "  ",
      },
    };

    const result = getHiddenValuedFields(
      values,
      sectionsConfig,
      "type-a",
      currentFormPageFieldsTypeA,
      "1",
      undefined,
      []
    );

    expect(result.hiddenConfiguredPaths).toEqual(["metadata.journal"]);
    expect(result.hiddenPaths).toEqual(["metadata.journal"]);
    expect(result.suggestedResourceTypes).toContain("type-b");
  });

  it("treats empty / whitespace / empty collections as not valued", () => {
    const values = {
      metadata: {
        journal: "",
        publisher: {},
      },
    };

    const result = getHiddenValuedFields(
      values,
      sectionsConfig,
      "type-a",
      currentFormPageFieldsTypeA,
      "1",
      undefined,
      []
    );

    expect(result.hiddenConfiguredPaths).toEqual(["metadata.journal"]);
    expect(result.hiddenPaths).toEqual([]);
  });

  it("excludes paths already covered by hidden errors (including parent/child match)", () => {
    const values = {
      metadata: {
        journal: { title: "Nature" },
      },
    };

    const result = getHiddenValuedFields(
      values,
      sectionsConfig,
      "type-a",
      currentFormPageFieldsTypeA,
      "1",
      undefined,
      [{ error_fields: ["metadata.journal.title"] }]
    );

    // journal is configured+hidden+valued, but matches the hidden error path
    expect(result.hiddenPaths).toEqual([]);
    expect(result.hiddenConfiguredPaths).toEqual(["metadata.journal"]);
  });

  it("counts false and 0 as non-empty values", () => {
    const config = [
      {
        pageId: "1",
        resourceTypes: ["type-b"],
        fields: ["metadata.flag", "metadata.count"],
      },
    ];
    const values = { metadata: { flag: false, count: 0 } };

    const result = getHiddenValuedFields(
      values,
      config,
      "type-a",
      { "1": [] },
      "1",
      undefined,
      []
    );

    expect(result.hiddenPaths.sort()).toEqual(
      ["metadata.count", "metadata.flag"].sort()
    );
  });
});

describe("suggestResourceTypesForPaths", () => {
  it("returns covering types other than the current one", () => {
    const types = suggestResourceTypesForPaths(
      ["metadata.journal"],
      sectionsConfig,
      "type-a",
      "1",
      {
        getLabel: (id) => (id === "type-b" ? "Zeta" : id),
      }
    );

    expect(types).toEqual(["type-b"]);
  });

  it("scopes to the current page", () => {
    const types = suggestResourceTypesForPaths(
      ["metadata.creators"],
      sectionsConfig,
      "type-a",
      "1"
    );

    expect(types).toEqual([]);
  });

  it("scatter-samples within the nearest proximity band when over maxSuggestions", () => {
    // type-a..type-j share family "type"; current type-a → 9 same-band candidates
    const manyTypes = Array.from(
      { length: 10 },
      (_, i) => `type-${String.fromCharCode(97 + i)}`
    );
    const config = [
      {
        pageId: "1",
        resourceTypes: manyTypes,
        fields: ["metadata.journal"],
      },
    ];

    const types = suggestResourceTypesForPaths(
      ["metadata.journal"],
      config,
      "type-a",
      "1",
      { maxSuggestions: 3 }
    );

    // Same-family band, scatter-sampled: first, middle, last of [type-b … type-j]
    expect(types).toEqual(["type-b", "type-f", "type-j"]);
  });

  it("prefers same-family covering types over farther families", () => {
    const config = [
      {
        pageId: "1",
        resourceTypes: [
          "presentation-slides",
          "textDocument-book",
          "image-figure",
        ],
        fields: ["metadata.journal"],
      },
    ];

    const types = suggestResourceTypesForPaths(
      ["metadata.journal"],
      config,
      "textDocument-journalArticle",
      "1",
      { maxSuggestions: 3 }
    );

    expect(types[0]).toBe("textDocument-book");
    expect(types[1]).toBe("presentation-slides");
    expect(types[2]).toBe("image-figure");
  });

  it("returns empty for empty paths or config", () => {
    expect(
      suggestResourceTypesForPaths([], sectionsConfig, "type-a", "1")
    ).toEqual([]);
    expect(
      suggestResourceTypesForPaths(["metadata.journal"], [], "type-a", "1")
    ).toEqual([]);
  });

  it("requireAll keeps only types that cover every path (unioning section rows)", () => {
    const config = [
      {
        pageId: "1",
        resourceTypes: ["type-b"],
        fields: ["metadata.journal"],
      },
      {
        pageId: "1",
        resourceTypes: ["type-b"],
        fields: ["metadata.publisher"],
      },
      {
        pageId: "1",
        resourceTypes: ["type-c"],
        fields: ["metadata.journal"],
      },
    ];

    const anyCovering = suggestResourceTypesForPaths(
      ["metadata.journal", "metadata.publisher"],
      config,
      "type-a",
      "1"
    );
    expect(anyCovering.sort()).toEqual(["type-b", "type-c"]);

    const allCovering = suggestResourceTypesForPaths(
      ["metadata.journal", "metadata.publisher"],
      config,
      "type-a",
      "1",
      { requireAll: true }
    );
    expect(allCovering).toEqual(["type-b"]);
  });
});
