import {
  familyDistance,
  rankAndSampleByProximity,
  resourceTypeFamily,
  resourceTypeProximityDistance,
} from "./resourceTypeProximity";

describe("resourceTypeFamily", () => {
  it("returns the hyphen prefix or the whole id", () => {
    expect(resourceTypeFamily("textDocument-journalArticle")).toBe("textDocument");
    expect(resourceTypeFamily("publication-article")).toBe("publication");
    expect(resourceTypeFamily("poster")).toBe("poster");
    expect(resourceTypeFamily("")).toBe("");
  });
});

describe("familyDistance / resourceTypeProximityDistance", () => {
  it("gives distance 0 for the same family", () => {
    expect(
      resourceTypeProximityDistance(
        "textDocument-journalArticle",
        "textDocument-book"
      )
    ).toBe(0);
    expect(familyDistance("presentation", "presentation")).toBe(0);
  });

  it("bridges textDocument and publication in one hop", () => {
    expect(
      resourceTypeProximityDistance(
        "textDocument-journalArticle",
        "publication-article"
      )
    ).toBe(1);
  });

  it("ranks presentation closer than image from textual types", () => {
    const from = "textDocument-report";
    const toPresentation = resourceTypeProximityDistance(
      from,
      "presentation-slides"
    );
    const toImage = resourceTypeProximityDistance(from, "image-photograph");
    expect(toPresentation).toBeLessThan(toImage);
  });

  it("connects KC audiovisual to upstream video/audio", () => {
    expect(resourceTypeProximityDistance("audiovisual-podcastEpisode", "video")).toBe(
      1
    );
    expect(resourceTypeProximityDistance("image-figure", "video")).toBe(2);
  });
});

describe("rankAndSampleByProximity", () => {
  it("prefers same-family types before cross-family neighbors", () => {
    const ranked = rankAndSampleByProximity(
      "textDocument-journalArticle",
      [
        "presentation-slides",
        "textDocument-book",
        "publication-article",
        "image-figure",
        "textDocument-report",
      ],
      { maxSuggestions: 5 }
    );

    expect(ranked.slice(0, 2).sort()).toEqual([
      "textDocument-book",
      "textDocument-report",
    ]);
    // publication and presentation are both 1 hop; alphabetical within the band
    expect(ranked.slice(2, 4)).toEqual([
      "presentation-slides",
      "publication-article",
    ]);
    expect(ranked[4]).toBe("image-figure");
  });

  it("fills nearest bands first when capping suggestions", () => {
    const ranked = rankAndSampleByProximity(
      "textDocument-essay",
      [
        "textDocument-book",
        "textDocument-report",
        "textDocument-thesis",
        "publication-article",
        "presentation-slides",
        "image-figure",
      ],
      { maxSuggestions: 3 }
    );

    expect(ranked).toHaveLength(3);
    expect(ranked.every((id) => id.startsWith("textDocument-"))).toBe(true);
  });

  it("scatter-samples within a band when it exceeds remaining slots", () => {
    const manySameFamily = Array.from(
      { length: 10 },
      (_, i) => `type-${String.fromCharCode(97 + i)}`
    );
    // current type-a → family "type"; all candidates same family
    const ranked = rankAndSampleByProximity("type-a", manySameFamily.slice(1), {
      maxSuggestions: 3,
    });

    expect(ranked).toEqual(["type-b", "type-f", "type-j"]);
  });

  it("sorts alphabetically by label within a band", () => {
    const ranked = rankAndSampleByProximity(
      "publication-book",
      ["publication-thesis", "publication-article", "publication-report"],
      {
        getLabel: (id) => {
          if (id === "publication-article") return "Zebra";
          if (id === "publication-report") return "Alpha";
          return "Middle";
        },
        maxSuggestions: 5,
      }
    );

    expect(ranked).toEqual([
      "publication-report",
      "publication-thesis",
      "publication-article",
    ]);
  });
});
