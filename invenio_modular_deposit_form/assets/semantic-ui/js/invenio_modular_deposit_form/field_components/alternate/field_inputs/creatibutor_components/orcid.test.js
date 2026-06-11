// Jest test suite for orcid.js (browser-direct ORCID Public API integration for the
// inline creatibutors family-name picker). Uses the workspace `__mocks__/axios.js`
// stub which exposes jest.fn()-based methods and is reset between tests via the
// `resetMocks: true` jest config.

import axios from "axios";
import {
  fetchOrcidPersonSuggestions,
  orcidHitToNameRecord,
} from "./orcid";

// One canonical ORCID `expanded-result` entry, useful as a base for per-test overrides.
const baseOrcidHit = {
  "orcid-id": "0000-0001-2345-6789",
  "given-names": "Alice",
  "family-names": "Smith",
  "credit-name": "Alice Smith",
  "institution-name": ["Example University", "Other Institute"],
};

describe("fetchOrcidPersonSuggestions", () => {
  test("returns [] and does NOT call axios for queries shorter than 4 chars", async () => {
    const result = await fetchOrcidPersonSuggestions(Promise.resolve([]), "smi");
    expect(result).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("returns [] and does NOT call axios for empty/whitespace queries", async () => {
    const a = await fetchOrcidPersonSuggestions(Promise.resolve([]), "");
    const b = await fetchOrcidPersonSuggestions(Promise.resolve([]), "   ");
    expect(a).toEqual([]);
    expect(b).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("returns mapped records for 4+ char queries when there are no local conflicts", async () => {
    axios.get.mockResolvedValueOnce({
      data: { "expanded-result": [baseOrcidHit] },
    });

    const result = await fetchOrcidPersonSuggestions(Promise.resolve([]), "smith");

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "orcid:0000-0001-2345-6789",
      family_name: "Smith",
      given_name: "Alice",
      identifiers: [{ scheme: "orcid", identifier: "0000-0001-2345-6789" }],
      affiliations: [{ name: "Example University" }, { name: "Other Institute" }],
    });
  });

  test("calls ORCID expanded-search with the documented URL, params, and Accept header", async () => {
    axios.get.mockResolvedValueOnce({ data: { "expanded-result": [] } });

    await fetchOrcidPersonSuggestions(Promise.resolve([]), "smith");

    expect(axios.get).toHaveBeenCalledWith(
      "https://pub.orcid.org/v3.0/expanded-search/",
      expect.objectContaining({
        params: { q: "smith", rows: 10, start: 0 },
        headers: { Accept: "application/json" },
      })
    );
  });

  test("trims the query before sending", async () => {
    axios.get.mockResolvedValueOnce({ data: { "expanded-result": [] } });

    await fetchOrcidPersonSuggestions(Promise.resolve([]), "  smith  ");

    expect(axios.get).toHaveBeenCalledWith(
      "https://pub.orcid.org/v3.0/expanded-search/",
      expect.objectContaining({ params: expect.objectContaining({ q: "smith" }) })
    );
  });

  describe("de-dup against local hits", () => {
    test("drops ORCID hit whose iD matches a local hit's bare-iD identifier", async () => {
      const localHits = [
        {
          id: "abc",
          identifiers: [
            { scheme: "orcid", identifier: "0000-0001-2345-6789" },
          ],
        },
      ];
      axios.get.mockResolvedValueOnce({
        data: { "expanded-result": [baseOrcidHit] },
      });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve(localHits),
        "smith"
      );

      expect(result).toEqual([]);
    });

    test("matches scheme case-insensitively (local 'ORCID' vs ORCID 'orcid-id')", async () => {
      const localHits = [
        {
          id: "abc",
          identifiers: [
            { scheme: "ORCID", identifier: "0000-0001-2345-6789" },
          ],
        },
      ];
      axios.get.mockResolvedValueOnce({
        data: { "expanded-result": [baseOrcidHit] },
      });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve(localHits),
        "smith"
      );

      expect(result).toEqual([]);
    });

    test("matches local URL-form ORCID against ORCID's bare iD", async () => {
      const localHits = [
        {
          id: "abc",
          identifiers: [
            {
              scheme: "orcid",
              identifier: "https://orcid.org/0000-0001-2345-6789",
            },
          ],
        },
      ];
      axios.get.mockResolvedValueOnce({
        data: { "expanded-result": [baseOrcidHit] },
      });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve(localHits),
        "smith"
      );

      expect(result).toEqual([]);
    });

    test("matches local sandbox URL-form ORCID against ORCID's bare iD", async () => {
      const localHits = [
        {
          id: "abc",
          identifiers: [
            {
              scheme: "orcid",
              identifier: "https://sandbox.orcid.org/0000-0001-2345-6789",
            },
          ],
        },
      ];
      axios.get.mockResolvedValueOnce({
        data: { "expanded-result": [baseOrcidHit] },
      });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve(localHits),
        "smith"
      );

      expect(result).toEqual([]);
    });

    test("keeps ORCID hits whose iD is NOT in the local set, drops only matching ones", async () => {
      const localHits = [
        {
          id: "abc",
          identifiers: [
            { scheme: "orcid", identifier: "0000-0001-2345-6789" },
          ],
        },
      ];
      const otherHit = {
        ...baseOrcidHit,
        "orcid-id": "0000-0002-9999-9999",
        "given-names": "Bob",
        "family-names": "Jones",
      };
      axios.get.mockResolvedValueOnce({
        data: { "expanded-result": [baseOrcidHit, otherHit] },
      });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve(localHits),
        "smith"
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("orcid:0000-0002-9999-9999");
    });

    test("local hits without orcid identifiers do not affect filtering", async () => {
      const localHits = [
        { id: "abc", identifiers: [{ scheme: "isni", identifier: "1234" }] },
        { id: "def" }, // no identifiers key at all
      ];
      axios.get.mockResolvedValueOnce({
        data: { "expanded-result": [baseOrcidHit] },
      });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve(localHits),
        "smith"
      );

      expect(result).toHaveLength(1);
    });
  });

  describe("soft-fail behavior", () => {
    test("returns [] when axios.get rejects (network/CORS error)", async () => {
      axios.get.mockRejectedValueOnce(new Error("network down"));

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve([]),
        "smith"
      );

      expect(result).toEqual([]);
    });

    test("returns [] when ORCID response is missing 'expanded-result'", async () => {
      axios.get.mockResolvedValueOnce({ data: { "num-found": 0 } });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve([]),
        "smith"
      );

      expect(result).toEqual([]);
    });

    test("returns [] when ORCID response is empty", async () => {
      axios.get.mockResolvedValueOnce({ data: {} });

      const result = await fetchOrcidPersonSuggestions(
        Promise.resolve([]),
        "smith"
      );

      expect(result).toEqual([]);
    });
  });
});

describe("orcidHitToNameRecord", () => {
  test("maps a fully-populated hit into the Names-vocab record shape", () => {
    expect(orcidHitToNameRecord(baseOrcidHit)).toEqual({
      id: "orcid:0000-0001-2345-6789",
      name: "Alice Smith",
      given_name: "Alice",
      family_name: "Smith",
      identifiers: [{ scheme: "orcid", identifier: "0000-0001-2345-6789" }],
      affiliations: [{ name: "Example University" }, { name: "Other Institute" }],
    });
  });

  test("prefers credit-name over composed 'family, given' for the display name", () => {
    const hit = { ...baseOrcidHit, "credit-name": "Jan van der Berg" };
    expect(orcidHitToNameRecord(hit).name).toBe("Jan van der Berg");
  });

  test("trims whitespace from credit-name and treats blank as absent", () => {
    const hit = { ...baseOrcidHit, "credit-name": "   " };
    expect(orcidHitToNameRecord(hit).name).toBe("Smith, Alice");
  });

  test("falls back to 'family, given' composition when credit-name is absent", () => {
    const hit = { ...baseOrcidHit, "credit-name": undefined };
    expect(orcidHitToNameRecord(hit).name).toBe("Smith, Alice");
  });

  test("handles missing given-names by falling back to 'Family' as the display name", () => {
    const hit = {
      ...baseOrcidHit,
      "credit-name": undefined,
      "given-names": undefined,
    };
    expect(orcidHitToNameRecord(hit).name).toBe("Smith");
  });

  test("handles missing family-names by falling back to 'Given' as the display name", () => {
    const hit = {
      ...baseOrcidHit,
      "credit-name": undefined,
      "family-names": undefined,
    };
    expect(orcidHitToNameRecord(hit).name).toBe("Alice");
  });

  test("falls back to the bare ORCID iD when credit-name and both parts are missing", () => {
    const hit = {
      ...baseOrcidHit,
      "credit-name": undefined,
      "family-names": "",
      "given-names": "",
    };
    expect(orcidHitToNameRecord(hit).name).toBe("0000-0001-2345-6789");
  });

  test("accepts institution-name as a single string and wraps it in a one-item list", () => {
    const hit = { ...baseOrcidHit, "institution-name": "Solo University" };
    expect(orcidHitToNameRecord(hit).affiliations).toEqual([
      { name: "Solo University" },
    ]);
  });

  test("returns empty affiliations when institution-name is missing", () => {
    const hit = { ...baseOrcidHit, "institution-name": undefined };
    expect(orcidHitToNameRecord(hit).affiliations).toEqual([]);
  });

  test("returns empty identifiers when orcid-id is missing", () => {
    const hit = { ...baseOrcidHit, "orcid-id": "" };
    expect(orcidHitToNameRecord(hit).identifiers).toEqual([]);
  });
});
