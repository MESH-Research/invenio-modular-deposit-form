import { buildFormSections } from "./buildFormStructure";

const registry = {
  ResourceTypeComponent: [null, ["metadata.resource_type"]],
  DoiComponent: [null, ["pids.doi"]],
  TitlesComponent: [null, ["metadata.title"]],
  PublisherComponent: [null, ["metadata.publisher"]],
};

const commonFields = [
  {
    component: "FormPages",
    subsections: [
      {
        section: "1",
        label: "Type & Title",
        subsections: [
          { section: "resource_type", label: "Resource Type", component: "ResourceTypeComponent" },
          { section: "doi", label: "DOI", component: "DoiComponent" },
          { section: "titles", label: "Title", component: "TitlesComponent" },
        ],
      },
      {
        section: "2",
        label: "Details",
        subsections: [
          { section: "publisher", label: "Publisher", component: "PublisherComponent" },
        ],
      },
    ],
  },
];

const fieldsByType = {
  dataset: {
    "2": {
      subsections: [
        { section: "extra_section", label: "Extra", component: "TitlesComponent" },
      ],
    },
  },
};

describe("buildFormSections", () => {
  it("returns a flat array of section entries from base pages", () => {
    const result = buildFormSections(commonFields, null, registry);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toContainEqual({
      pageId: "1",
      sectionId: "resource_type",
      pageLabel: "Type & Title",
      sectionLabel: "Resource Type",
      fields: ["metadata.resource_type"],
      resourceTypes: [],
    });
    expect(result).toContainEqual({
      pageId: "1",
      sectionId: "doi",
      pageLabel: "Type & Title",
      sectionLabel: "DOI",
      fields: ["pids.doi"],
      resourceTypes: [],
    });
    expect(result).toContainEqual({
      pageId: "2",
      sectionId: "publisher",
      pageLabel: "Details",
      sectionLabel: "Publisher",
      fields: ["metadata.publisher"],
      resourceTypes: [],
    });
  });

  it("includes by_type sections with correct page labels", () => {
    const result = buildFormSections(commonFields, fieldsByType, registry);
    expect(result).toContainEqual({
      pageId: "2",
      sectionId: "extra_section",
      pageLabel: "Details",
      sectionLabel: "Extra",
      fields: ["metadata.title"],
      resourceTypes: ["dataset"],
    });
  });

  it("handles empty or missing config", () => {
    expect(buildFormSections([], {}, registry)).toEqual([]);
    expect(buildFormSections(null, null, null)).toEqual([]);
    expect(buildFormSections(commonFields, null, registry).length).toBeGreaterThan(0);
  });

  it("merges resourceTypes when same section appears in multiple type overrides", () => {
    const page2Override = {
      subsections: [{ section: "extra_section", label: "Extra", component: "TitlesComponent" }],
    };
    const multiType = {
      dataset: { "2": { ...page2Override } },
      image: { "2": { ...page2Override } },
    };
    const result = buildFormSections(commonFields, multiType, registry);
    const merged = result.filter((e) => e.sectionId === "extra_section");
    expect(merged).toHaveLength(1);
    expect(merged[0].resourceTypes).toEqual(expect.arrayContaining(["dataset", "image"]));
    expect(merged[0].resourceTypes).toHaveLength(2);
  });

  it("adds consumer resource type via same_as without duplicating section rows", () => {
    const common = [
      {
        component: "FormPages",
        subsections: [
          {
            section: "page-c",
            label: "C",
            subsections: [{ section: "y", label: "Y", component: "TitlesComponent" }],
          },
        ],
      },
    ];
    const byType = {
      template: {
        "page-c": {
          subsections: [{ section: "y", label: "Y", component: "TitlesComponent" }],
        },
      },
      consumer: {
        "page-c": { same_as: "template" },
      },
    };
    const result = buildFormSections(common, byType, registry);
    const yRows = result.filter((e) => e.pageId === "page-c" && e.sectionId === "y");
    expect(yRows).toHaveLength(1);
    expect(yRows[0].resourceTypes).toEqual(expect.arrayContaining(["template", "consumer"]));
    expect(yRows[0].resourceTypes).toHaveLength(2);
  });

  it("propagates resource types along multi-hop same_as chains", () => {
    const common = [
      {
        component: "FormPages",
        subsections: [
          {
            section: "p",
            label: "P",
            subsections: [{ section: "s", component: "DoiComponent" }],
          },
        ],
      },
    ];
    const byType = {
      root: {
        p: { subsections: [{ section: "s", component: "DoiComponent" }] },
      },
      mid: { p: { same_as: "root" } },
      leaf: { p: { same_as: "mid" } },
    };
    const result = buildFormSections(common, byType, registry);
    const rows = result.filter((e) => e.pageId === "p" && e.sectionId === "s");
    expect(rows).toHaveLength(1);
    expect(rows[0].resourceTypes.sort()).toEqual(["leaf", "mid", "root"]);
  });

  it("uses section id as label fallback", () => {
    const minimal = [
      {
        component: "FormPages",
        subsections: [
          {
            section: "1",
            subsections: [{ section: "foo", component: "DoiComponent" }],
          },
        ],
      },
    ];
    const result = buildFormSections(minimal, {}, registry);
    const entry = result.find((e) => e.sectionId === "foo");
    expect(entry).toEqual({
      pageId: "1",
      sectionId: "foo",
      pageLabel: "1",
      sectionLabel: "foo",
      fields: ["pids.doi"],
      resourceTypes: [],
    });
  });
});
