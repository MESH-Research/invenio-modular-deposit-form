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
  it("returns covering types other than the current one, sorted by label", () => {
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

  it("scatter-samples when there are more covering types than maxSuggestions", () => {
    // type-a..type-j; current is type-a → 9 covering types after sort
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

    // Evenly spaced across [type-b … type-j]: first, middle, last
    expect(types).toEqual(["type-b", "type-f", "type-j"]);
  });

  it("returns empty for empty paths or config", () => {
    expect(
      suggestResourceTypesForPaths([], sectionsConfig, "type-a", "1")
    ).toEqual([]);
    expect(
      suggestResourceTypesForPaths(["metadata.journal"], [], "type-a", "1")
    ).toEqual([]);
  });
});
