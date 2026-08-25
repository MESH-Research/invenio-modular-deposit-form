// Part of invenio-modular-deposit-form
// Copyright (C) 2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import * as yup from "yup";

import {
  isDraftSaveBlockingError,
  validateForDraftSave,
  validateSchemaToFormikErrors,
} from "./validateForDraftSave";

describe("isDraftSaveBlockingError", () => {
  it("does not block required or min Yup types", () => {
    expect(isDraftSaveBlockingError({ type: "required" })).toBe(false);
    expect(isDraftSaveBlockingError({ type: "min" })).toBe(false);
  });

  it("blocks other Yup types (format / consistency)", () => {
    expect(isDraftSaveBlockingError({ type: "matches" })).toBe(true);
    expect(isDraftSaveBlockingError({ type: "edtf" })).toBe(true);
    expect(isDraftSaveBlockingError({ type: undefined })).toBe(true);
    expect(isDraftSaveBlockingError(null)).toBe(true);
  });
});

describe("validateForDraftSave", () => {
  const presenceSchema = yup.object({
    creators: yup
      .array()
      .of(yup.object())
      .min(1, "At least one creator must be listed")
      .required("At least one creator must be listed"),
    title: yup.string().min(1, "Title min").required("A title is required"),
  });

  const withFormatSchema = presenceSchema.shape({
    identifier: yup.string().matches(/^https?:\/\//, "Must be a valid URL"),
  });

  it("omits min/required failures and does not mark draft as blocked", async () => {
    const result = await validateForDraftSave(presenceSchema, {
      creators: [],
      title: "",
    });
    expect(result.errors).toEqual({});
    expect(result.hasDraftBlockingClientErrors).toBe(false);
  });

  it("keeps format errors and marks draft as blocked", async () => {
    const result = await validateForDraftSave(withFormatSchema, {
      creators: [{}],
      title: "A title",
      identifier: "not-a-url",
    });
    expect(result.errors).toEqual({ identifier: "Must be a valid URL" });
    expect(result.hasDraftBlockingClientErrors).toBe(true);
  });
});

describe("validateSchemaToFormikErrors", () => {
  const schema = yup.object({
    creators: yup
      .array()
      .of(yup.object())
      .min(1, "At least one creator must be listed")
      .required("At least one creator must be listed"),
  });

  it("returns all errors but only treats non-allowlisted types as draft-blocking", async () => {
    const result = await validateSchemaToFormikErrors(schema, { creators: [] });
    expect(result.errors).toEqual({
      creators: "At least one creator must be listed",
    });
    expect(result.hasDraftBlockingClientErrors).toBe(false);
  });
});
