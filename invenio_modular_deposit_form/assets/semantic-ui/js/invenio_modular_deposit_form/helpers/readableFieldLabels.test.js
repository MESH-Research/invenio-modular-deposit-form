import {
  getLabelFromCustomFieldsUI,
  getReadableFieldLabel,
} from "./readableFieldLabels";

const sampleCustomFieldsUI = [
  {
    section: "KCR",
    fields: [
      {
        field: "kcr:publication_url",
        props: { label: "Publication URL" },
      },
      {
        field: "kcr:course_title",
        props: { label: "Course title" },
      },
      {
        field: "kcr:discipline",
        props: { label: "Discipline" },
      },
      {
        field: "kcr:volumes.volume",
        props: { label: "Volume" },
      },
      {
        field: "kcr:ai_usage",
        props: {
          label: "AI Usage",
          ai_used: { label: "Was AI Used" },
        },
      },
      {
        field: "journal:journal",
        props: {
          label: "Journal",
          title: { label: "Title" },
          volume: { label: "Volume" },
        },
      },
    ],
  },
];

describe("getLabelFromCustomFieldsUI", () => {
  it("resolves a top-level custom field label", () => {
    expect(
      getLabelFromCustomFieldsUI(
        "custom_fields.kcr:publication_url",
        sampleCustomFieldsUI
      )
    ).toBe("Publication URL");
  });

  it("resolves a dotted field name that is a full UI entry", () => {
    expect(
      getLabelFromCustomFieldsUI(
        "custom_fields.kcr:volumes.volume",
        sampleCustomFieldsUI
      )
    ).toBe("Volume");
  });

  it("resolves nested props labels on compound widgets", () => {
    expect(
      getLabelFromCustomFieldsUI(
        "custom_fields.kcr:ai_usage.ai_used",
        sampleCustomFieldsUI
      )
    ).toBe("Was AI Used");
    expect(
      getLabelFromCustomFieldsUI(
        "custom_fields.journal:journal.title",
        sampleCustomFieldsUI
      )
    ).toBe("Title");
  });

  it("returns null for non-custom-field paths or missing UI", () => {
    expect(getLabelFromCustomFieldsUI("metadata.title", sampleCustomFieldsUI)).toBeNull();
    expect(getLabelFromCustomFieldsUI("custom_fields.kcr:discipline", null)).toBeNull();
    expect(
      getLabelFromCustomFieldsUI("custom_fields.kcr:missing", sampleCustomFieldsUI)
    ).toBeNull();
  });
});

describe("getReadableFieldLabel", () => {
  it("prefers custom_fields.ui over the static map for custom fields", () => {
    // Static map would say "Journal title"; UI nested label is "Title".
    expect(
      getReadableFieldLabel("custom_fields.journal:journal.title", sampleCustomFieldsUI)
    ).toBe("Title");
  });

  it("uses custom_fields.ui for site kcr fields missing from the static map", () => {
    expect(
      getReadableFieldLabel("custom_fields.kcr:course_title", sampleCustomFieldsUI)
    ).toBe("Course title");
    expect(
      getReadableFieldLabel("custom_fields.kcr:discipline", sampleCustomFieldsUI)
    ).toBe("Discipline");
  });

  it("falls back to the static map when UI is omitted", () => {
    expect(getReadableFieldLabel("metadata.title")).toBe("Title");
    expect(getReadableFieldLabel("custom_fields.journal:journal.title")).toBe(
      "Journal title"
    );
  });

  it("returns the raw path when nothing matches", () => {
    expect(getReadableFieldLabel("custom_fields.kcr:unknown_field")).toBe(
      "custom_fields.kcr:unknown_field"
    );
  });
});
