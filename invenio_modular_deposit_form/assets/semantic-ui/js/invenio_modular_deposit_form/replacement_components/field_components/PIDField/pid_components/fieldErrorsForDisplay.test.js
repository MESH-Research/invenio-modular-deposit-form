import {
  getFieldErrorsForDisplay,
  pickDisplayableError,
} from "./fieldErrorsForDisplay";

describe("pickDisplayableError", () => {
  it("returns a string error at the field path", () => {
    expect(
      pickDisplayableError({ pids: { doi: "Top-level message" } }, "pids.doi")
    ).toBe("Top-level message");
  });

  it("returns identifier leaf when path is pids.doi (nested Yup path)", () => {
    expect(
      pickDisplayableError(
        { pids: { doi: { identifier: "Invalid DOI" } } },
        "pids.doi"
      )
    ).toBe("Invalid DOI");
  });

});

describe("getFieldErrorsForDisplay", () => {
  const fieldPath = "pids.doi";
  const field = { value: { provider: "external", identifier: "x" } };

  it("shows nested identifier error when parent path is touched", () => {
    const form = {
      errors: { pids: { doi: { identifier: "You must provide a valid DOI" } } },
      initialErrors: {},
      initialValues: { pids: { doi: { provider: "external", identifier: "" } } },
      touched: { pids: { doi: true } },
    };
    expect(getFieldErrorsForDisplay(form, fieldPath, field)).toBe(
      "You must provide a valid DOI"
    );
  });
});
