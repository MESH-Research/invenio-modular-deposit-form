import { addMethod } from "yup";
import * as yup from "yup";

import {
  buildCreatorIdentifierChain,
  buildRecordIdentifierChain,
  CREATOR_SCHEME_IDS,
  RECORD_SCHEME_IDS,
} from "./identifierSchemeValidators";
import { SCHEME_ID_TO_VALIDATOR } from "./validatorsForIds";

// Register all scheme validators from the map (mirrors validator.js)
for (const [schemeId, validatorFn] of Object.entries(SCHEME_ID_TO_VALIDATOR)) {
  addMethod(yup.string, schemeId, validatorFn);
}

describe("validatorsForIds", () => {
  describe("rorValidator", () => {
    const schema = yup.object().shape({
      ror: yup.string().nullable().ror(),
    });

    it("should validate correct ROR format", async () => {
      const validRORs = [
        "0w4pz9h89",
        "https://ror.org/0w4pz9h89",
        "http://ror.org/0w4pz9h89",
        "ror.org/0w4pz9h89",
      ];

      for (const ror of validRORs) {
        await expect(schema.validate({ ror })).resolves.toBeTruthy();
      }
    });

    it("should reject invalid ROR format", async () => {
      const invalidRORs = [
        "invalid",
        "12345678", // too short
        "0w4pz9h8", // too short
        "0w4pz9h890", // too long
        "https://example.com/0w4pz9h89", // wrong domain
        "https://ror.org/0w4pz9h8", // too short
        "https://ror.org/0w4pz9h890", // too long
      ];

      for (const ror of invalidRORs) {
        await expect(schema.validate({ ror }))
          .rejects.toThrow("Invalid ROR identifier");
      }
    });

    it("should handle null and undefined values", async () => {
      await expect(schema.validate({ ror: null }))
        .rejects.toThrow("ROR identifier cannot be empty");
      await expect(schema.validate({ ror: undefined }))
        .rejects.toThrow("ROR identifier cannot be empty");
      await expect(schema.validate({}))
        .rejects.toThrow("ROR identifier cannot be empty");
    });
  });

  describe("isniValidator", () => {
    const schema = yup.object().shape({
      isni: yup.string().isni(),
    });

    it("should validate correct ISNI format", async () => {
      const validISNIs = [
        "000000012146438X",
        "0000-0001-2146-438X",
        "0000 0001 2146 438X",
      ];

      for (const isni of validISNIs) {
        await expect(schema.validate({ isni })).resolves.toBeTruthy();
      }
    });

    it("should reject invalid ISNI format", async () => {
      const invalidISNIs = [
        "invalid",
        "1234567890123456",
        "0000000121464389",
      ];

      for (const isni of invalidISNIs) {
        await expect(schema.validate({ isni })).rejects.toThrow();
      }
    });

    it("should handle null and undefined values", async () => {
      await expect(schema.validate({ isni: null })).rejects.toThrow();
      await expect(schema.validate({ isni: undefined })).rejects.toThrow();
      await expect(schema.validate({})).rejects.toThrow();
    });
  });

  describe("gndValidator", () => {
    const schema = yup.object().shape({
      gnd: yup.string().nullable().gnd(),
    });

    it("should validate correct GND format", async () => {
      const validGNDs = [
        // Pattern 1: Start with 1 followed by optional 0, 1, or 2, then 7 digits and a check digit (X or number)
        "123456789", // starts with 1, 9 digits total
        "12345678X", // starts with 1, X check digit
        "100000000", // starts with 10, 10 digits total
        "101234567", // starts with 10, example with numbers
        "10123456X", // starts with 10, X check digit
        "111234567", // starts with 11, 10 digits total
        "1270543776", // starts with 12, 10 digits total (real-world example)

        // Pattern 2: Start with 4 or 7 followed by 6 digits and a hyphen and a digit
        "4000000-0",  // starts with 4
        "4123456-7",  // starts with 4, example with numbers
        "7000000-0",  // starts with 7
        "7123456-7",  // starts with 7, example with numbers

        // Pattern 3: Start with 1-9 followed by 0-7 digits and a hyphen and a check digit (X or number)
        "2-0",        // starts with 2, minimum length
        "21-7",       // starts with 2, 1 digit
        "212-7",      // starts with 2, 2 digits
        "2123-7",     // starts with 2, 3 digits
        "21234-7",    // starts with 2, 4 digits
        "212345-7",   // starts with 2, 5 digits
        "2123456-7",  // starts with 2, 6 digits
        "21234567-7", // starts with 2, 7 digits
        "21234567-X", // starts with 2, X check digit
        "5-0",        // starts with 5, minimum length
        "51-7",       // starts with 5, 1 digit
        "512-7",      // starts with 5, 2 digits
        "5123-7",     // starts with 5, 3 digits
        "51234-7",    // starts with 5, 4 digits
        "512345-7",   // starts with 5, 5 digits
        "5123456-7",  // starts with 5, 6 digits
        "51234567-7", // starts with 5, 7 digits
        "51234567-X", // starts with 5, X check digit

        // Pattern 4: Start with 3 followed by 7 digits and a check digit (X or number)
        "300000000", // starts with 3
        "312345678", // starts with 3, example with numbers
        "30000000X", // starts with 3, X check digit
        "31234567X", // starts with 3, example with numbers, X check digit

        // With prefixes
        "http://d-nb.info/gnd/100000000",
        "GND:100000000",
        "gnd:100000000",
      ];

      for (const gnd of validGNDs) {
        await expect(schema.validate({ gnd })).resolves.toBeTruthy();
      }
    });

    it("should reject invalid GND format", async () => {
      const invalidGNDs = [
        "invalid",                    // not a number
        "12345678",                  // missing hyphen/check digit
        "12345678-",                 // incomplete check digit
        "12345678-XX",               // invalid check digit format (two X's)
        "123456789-0",               // too many digits (8) before hyphen
        "0123456-7",                 // starts with 0 (not allowed)
        "4000000",                   // missing hyphen and check digit
        "https://example.com/100000000", // wrong domain
      ];

      for (const gnd of invalidGNDs) {
        await expect(schema.validate({ gnd }))
          .rejects.toThrow("Invalid GND");
      }
    });

    it("should handle null and undefined values", async () => {
      await expect(schema.validate({ gnd: null }))
        .rejects.toThrow("GND identifier cannot be empty");
      await expect(schema.validate({ gnd: undefined }))
        .rejects.toThrow("GND identifier cannot be empty");
      await expect(schema.validate({}))
        .rejects.toThrow("GND identifier cannot be empty");
    });
  });

  describe("orcidValidator", () => {
    const schema = yup.object().shape({
      orcid: yup.string().orcid(),
    });

    it("should validate correct ORCID format", async () => {
      const validORCIDs = [
        "0000-0001-2345-6789",
        "https://orcid.org/0000-0001-2345-6789",
        "http://orcid.org/0000-0001-2345-6789",
      ];

      for (const orcid of validORCIDs) {
        await expect(schema.validate({ orcid })).resolves.toBeTruthy();
      }
    });

    it("should reject invalid ORCID format", async () => {
      const invalidORCIDs = [
        "invalid",
        "1234-5678-9012-3456",
        "https://example.com/0000-0001-2345-6789",
      ];

      for (const orcid of invalidORCIDs) {
        await expect(schema.validate({ orcid })).rejects.toThrow();
      }
    });

    it("should handle null and undefined values", async () => {
      await expect(schema.validate({ orcid: null })).rejects.toThrow();
      await expect(schema.validate({ orcid: undefined })).rejects.toThrow();
      await expect(schema.validate({})).rejects.toThrow();
    });
  });

  describe("urlValidator", () => {
    const schema = yup.object().shape({
      url: yup.string().nullable().url(),
    });

    it("should validate correct URL format", async () => {
      const validURLs = ["https://example.com", "http://example.org/path", "https://sub.example.com/foo?q=1"];
      for (const url of validURLs) {
        await expect(schema.validate({ url })).resolves.toBeTruthy();
      }
    });

    it("should reject invalid URL format", async () => {
      const invalidURLs = ["not a url", "ftp://example.com", "javascript:alert(1)"];
      for (const url of invalidURLs) {
        await expect(schema.validate({ url })).rejects.toThrow();
      }
    });
  });

  describe("applies the correct validation function for each identifier scheme", () => {
    const identifierSchema = yup.object().shape({
      scheme: yup.string().required(),
      identifier: buildCreatorIdentifierChain(
        yup.string().required(),
        CREATOR_SCHEME_IDS,
        yup.string
      ),
    });

    const validPerScheme = {
      ark: "ark:/12345/x7q84",
      arxiv: "2101.12345",
      ads: "2021arXiv210112345A",
      crossreffunderid: "100000001",
      doi: "10.1234/example.12345",
      ean13: "5901234123457",
      eissn: "2049-3630",
      grid: "grid.12345.6",
      handle: "20.1000/100",
      igsn: "AU1234",
      isbn: "978-0-262-03293-3",
      isni: "000000012146438X",
      issn: "2049-3630",
      istc: "A02-2009-000004B3-9",
      lissn: "2049-3630",
      lsid: "urn:lsid:ubio.org:namebank:11815",
      pmid: "12345678",
      purl: "https://purl.org/example",
      upc: "012345678905",
      url: "https://example.com",
      urn: "urn:nbn:de:123",
      w3id: "https://w3id.org/example",
      other: "any",
      orcid: "0000-0001-2345-6789",
      gnd: "118627813",
      ror: "0w4pz9h89",
    };

    const invalidPerScheme = {
      ark: "not-an-ark",
      arxiv: "99.9999",
      ads: "short",
      crossreffunderid: "", // required fails
      doi: "not-a-doi",
      ean13: "123",
      eissn: "123",
      grid: "", // required fails
      handle: "invalid",
      igsn: "", // required fails
      isbn: "000",
      isni: "0000000121464389",
      issn: "1234",
      istc: "A02-2009-000004B3-X",
      lissn: "12",
      lsid: "urn:invalid:lsid",
      pmid: "abc",
      purl: "https://example.com/not-purl",
      upc: "", // required fails
      url: "not-a-url",
      urn: "http://example.com",
      w3id: "", // required fails
      other: "", // required fails
      orcid: "0000-0001-2345-678X",
      gnd: "invalid",
      ror: "short",
    };

    for (const schemeId of CREATOR_SCHEME_IDS) {
      it(`${schemeId}: accepts valid identifier`, async () => {
        const value = validPerScheme[schemeId];
        await expect(
          identifierSchema.validate({ scheme: schemeId, identifier: value })
        ).resolves.toBeTruthy();
      });

      it(`${schemeId}: rejects invalid identifier`, async () => {
        const value = invalidPerScheme[schemeId];
        await expect(
          identifierSchema.validate({ scheme: schemeId, identifier: value })
        ).rejects.toThrow();
      });
    }
  });

  describe("metadata.identifiers / record identifiers: applies the correct validation per scheme", () => {
    const recordIdentifierSchema = yup.object().shape({
      scheme: yup.string().required(),
      identifier: buildRecordIdentifierChain(
        yup.string().required(),
        RECORD_SCHEME_IDS,
        yup.string
      ),
    });

    const validPerScheme = {
      ark: "ark:/12345/x7q84",
      arxiv: "2101.12345",
      ads: "2021arXiv210112345A",
      crossreffunderid: "100000001",
      doi: "10.1234/example.12345",
      ean13: "5901234123457",
      eissn: "2049-3630",
      grid: "grid.12345.6",
      handle: "20.1000/100",
      igsn: "AU1234",
      isbn: "978-0-262-03293-3",
      isni: "000000012146438X",
      issn: "2049-3630",
      istc: "A02-2009-000004B3-9",
      lissn: "2049-3630",
      lsid: "urn:lsid:ubio.org:namebank:11815",
      pmid: "12345678",
      purl: "https://purl.org/example",
      upc: "012345678905",
      url: "https://example.com",
      urn: "urn:nbn:de:123",
      w3id: "https://w3id.org/example",
      other: "any",
      orcid: "0000-0001-2345-6789",
      gnd: "118627813",
      ror: "0w4pz9h89",
    };

    const invalidPerScheme = {
      ark: "not-an-ark",
      arxiv: "99.9999",
      ads: "short",
      crossreffunderid: "",
      doi: "not-a-doi",
      ean13: "123",
      eissn: "123",
      grid: "",
      handle: "invalid",
      igsn: "",
      isbn: "000",
      isni: "0000000121464389",
      issn: "1234",
      istc: "A02-2009-000004B3-X",
      lissn: "12",
      lsid: "urn:invalid:lsid",
      pmid: "abc",
      purl: "https://example.com/not-purl",
      upc: "",
      url: "not-a-url",
      urn: "http://example.com",
      w3id: "",
      other: "",
      orcid: "0000-0001-2345-678X",
      gnd: "invalid",
      ror: "short",
    };

    for (const schemeId of RECORD_SCHEME_IDS) {
      it(`${schemeId}: accepts valid identifier`, async () => {
        const value = validPerScheme[schemeId];
        await expect(
          recordIdentifierSchema.validate({ scheme: schemeId, identifier: value })
        ).resolves.toBeTruthy();
      });

      it(`${schemeId}: rejects invalid identifier`, async () => {
        const value = invalidPerScheme[schemeId];
        await expect(
          recordIdentifierSchema.validate({ scheme: schemeId, identifier: value })
        ).rejects.toThrow();
      });
    }
  });
});

