import { addMethod } from "yup";
import * as yup from "yup";
import { SCHEME_ID_TO_VALIDATOR } from "./validatorsForIds";

// Register all scheme validators (mirrors validatorsForIds.test.js)
for (const [schemeId, validatorFn] of Object.entries(SCHEME_ID_TO_VALIDATOR)) {
  addMethod(yup.string, schemeId, validatorFn);
}

describe("validatorPids (doi validation)", () => {
  const schema = yup.string().doi("Invalid DOI identifier");

  it("accepts DOI strings that match idutils.is_doi", async () => {
    const valid = [
      "10.1234/abc",
      "10.1234/abc.def",
      "doi:10.1234/abc",
      "DOI:10.1234/abc",
      "https://doi.org/10.1234/abc",
      "http://doi.org/10.1234/abc",
      "doi.org/10.1234/abc",
      "https://dx.doi.org/10.1234/abc",
      "dx.doi.org/10.1234/abc",
    ];

    for (const value of valid) {
      await expect(schema.validate(value)).resolves.toBeTruthy();
    }
  });

  it("rejects invalid DOI strings", async () => {
    const invalid = [
      "10.1234", // missing slash/suffix
      "10.1234/", // empty suffix
      "doi:10.1234", // missing slash/suffix
      "https://example.com/10.1234/abc", // wrong host
      "10.xxxx/abc", // non-numeric prefix
    ];

    for (const value of invalid) {
      await expect(schema.validate(value)).rejects.toThrow("Invalid DOI identifier");
    }
  });
});

