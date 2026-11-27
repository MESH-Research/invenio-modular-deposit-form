import {
  creatibutorNameFromPersonSuggestion,
  creatibutorNameFromProfile,
} from "./creatibutorDisplayName";

describe("creatibutorNameFromProfile", () => {
  it("prefers display_name over full_name", () => {
    expect(
      creatibutorNameFromProfile({
        display_name: "Curie, Marie",
        full_name: "Marie Curie",
      })
    ).toBe("Curie, Marie");
  });

  it("falls back to full_name when display_name is missing", () => {
    expect(creatibutorNameFromProfile({ full_name: "Marie Curie" })).toBe(
      "Marie Curie"
    );
  });

  it("returns empty string for empty profile", () => {
    expect(creatibutorNameFromProfile(undefined)).toBe("");
    expect(creatibutorNameFromProfile({})).toBe("");
  });
});

describe("creatibutorNameFromPersonSuggestion", () => {
  it("prefers Names props.display_name over top-level name", () => {
    expect(
      creatibutorNameFromPersonSuggestion({
        name: "Marie Curie",
        props: { display_name: "Curie, Marie Skłodowska" },
      })
    ).toBe("Curie, Marie Skłodowska");
  });

  it("falls back to name for ORCID-style hits without props.display_name", () => {
    expect(
      creatibutorNameFromPersonSuggestion({
        name: "Marie Curie",
      })
    ).toBe("Marie Curie");
  });

  it("returns empty string when suggestion is missing", () => {
    expect(creatibutorNameFromPersonSuggestion(null)).toBe("");
    expect(creatibutorNameFromPersonSuggestion(undefined)).toBe("");
  });
});
