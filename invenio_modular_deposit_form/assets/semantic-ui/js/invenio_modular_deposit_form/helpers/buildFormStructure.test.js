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
        section: "page-1",
        label: "Type & Title",
        subsections: [
          { section: "resource_type", label: "Resource Type", component: "ResourceTypeComponent" },
          { section: "doi", label: "DOI", component: "DoiComponent" },
          { section: "titles", label: "Title", component: "TitlesComponent" },
        ],
      },
      {
        section: "page-2",
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
    "page-2": [
      { section: "extra_section", label: "Extra", component: "TitlesComponent" },
    ],
  },
};

describe("buildFormSections", () => {
  it("returns a flat array of section entries from base pages", () => {
    const result = buildFormSections(commonFields, null, registry);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toContainEqual({
      pageId: "page-1",
      sectionId: "resource_type",
      pageLabel: "Type & Title",
      sectionLabel: "Resource Type",
      fields: ["metadata.resource_type"],
      resourceTypes: [],
    });
    expect(result).toContainEqual({
      pageId: "page-1",
      sectionId: "doi",
      pageLabel: "Type & Title",
      sectionLabel: "DOI",
      fields: ["pids.doi"],
      resourceTypes: [],
    });
    expect(result).toContainEqual({
      pageId: "page-2",
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
      pageId: "page-2",
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
    const multiType = {
      dataset: { "page-2": [{ section: "extra_section", label: "Extra", component: "TitlesComponent" }] },
      image: { "page-2": [{ section: "extra_section", label: "Extra", component: "TitlesComponent" }] },
    };
    const result = buildFormSections(commonFields, multiType, registry);
    const extra = result.filter((e) => e.sectionId === "extra_section");
    expect(extra).toHaveLength(1);
    expect(extra[0].resourceTypes).toEqual(expect.arrayContaining(["dataset", "image"]));
    expect(extra[0].resourceTypes).toHaveLength(2);
  });

  it("uses section id as label fallback", () => {
    const minimal = [
      {
        component: "FormPages",
        subsections: [
          {
            section: "page-1",
            subsections: [{ section: "foo", component: "DoiComponent" }],
          },
        ],
      },
    ];
    const result = buildFormSections(minimal, {}, registry);
    const entry = result.find((e) => e.sectionId === "foo");
    expect(entry).toEqual({
      pageId: "page-1",
      sectionId: "foo",
      pageLabel: "page-1",
      sectionLabel: "foo",
      fields: ["pids.doi"],
      resourceTypes: [],
    });
  });
});
