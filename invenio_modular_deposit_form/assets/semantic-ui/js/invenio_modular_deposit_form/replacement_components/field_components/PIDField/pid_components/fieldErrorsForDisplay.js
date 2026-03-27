// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Related upstream: `invenio_rdm_records/.../PIDField/components/helpers.js`
//
// Stock exports `getFieldErrors(form, fieldPath)` = `errors || initialErrors` at the path,
// with no notion of “has the user touched this field yet?”. That makes PID errors show
// immediately on load when validation fails, unlike text fields that use
// `replacement_components/TextField.js`, which only shows validation errors after touch
// (or for initial-server errors while the value is still the initial value).
//
// This module keeps `getFieldErrors` (same behavior as stock) for parity, and adds
// `getFieldErrorsForDisplay(form, fieldPath, field)` which implements the same boolean
// visibility logic as `TextField.js` (touched + error, or initialError + unchanged value,
// with deep equality for object PID values via `areDeeplyEqual` from `utils.js`).
//
// Call sites: local `UnmanagedIdentifierCmp`, `ManagedIdentifierCmp`, and the
// Required/Optional PID field label rows.
//
// Preconditions: for the “validation error + touched” branch to ever apply, callers must
// ensure `form.touched[fieldPath]` becomes true — e.g. `UnmanagedIdentifierCmp` calls
// `form.setFieldTouched(fieldPath)` on blur (not `field.onBlur(e)`; see that file);
// `RequiredPIDField` / `OptionalPIDField` call `setFieldTouched(fieldPath, true, true)` when radios change.
// Documented in docs/source/replacement_field_components.md.
//
// Nested Yup errors: validation often attaches messages at `pids.doi.identifier`, while the
// FastField name is `pids.doi`. `pickDisplayableError` collapses parent path + known child
// keys (`identifier`, `provider`, …) into one string for SUI `error=`.

import { getIn } from "formik";
import { areDeeplyEqual } from "../../../../utils";

/** Leaf keys we merge when `errors[fieldPath]` is missing or is a nested object (PID shape). */
const PID_ERROR_LEAF_KEYS = ["identifier", "provider", "client"];

/**
 * Resolve a string message for display at `fieldPath`, including Yup/Formik leaf paths such as
 * `pids.doi.identifier` when the bound field is `pids.doi`.
 *
 * @param {object|null|undefined} formErrors `form.errors` or `form.initialErrors`
 * @param {string} fieldPath e.g. `pids.doi`
 * @returns {string|null|undefined}
 */
export function pickDisplayableError(formErrors, fieldPath) {
  if (!formErrors) {
    return null;
  }
  const direct = getIn(formErrors, fieldPath, null);
  if (typeof direct === "string") {
    return direct;
  }
  if (direct && typeof direct === "object" && !Array.isArray(direct)) {
    for (const key of PID_ERROR_LEAF_KEYS) {
      const v = direct[key];
      if (typeof v === "string") {
        return v;
      }
    }
  }
  for (const leaf of PID_ERROR_LEAF_KEYS) {
    const v = getIn(formErrors, `${fieldPath}.${leaf}`, null);
    if (typeof v === "string") {
      return v;
    }
  }
  return null;
}

/**
 * Combined error string for `fieldPath`, including nested PID leaves (`identifier`, …).
 * Stock helpers only used `getIn` at `fieldPath`; we merge leaf messages like
 * `getFieldErrorsForDisplay` so callers that still use this name see invalid-DOI text.
 *
 * @param {object} form Formik form bag
 * @param {string} fieldPath
 * @returns {string|null|undefined}
 */
export function getFieldErrors(form, fieldPath) {
  return (
    pickDisplayableError(form.errors, fieldPath) ||
    pickDisplayableError(form.initialErrors, fieldPath) ||
    null
  );
}

/**
 * Error value for SUI `error=` only when it should show (touched / initialError branch).
 *
 * Matches the visibility policy in `replacement_components/TextField.js`: show validation
 * errors when `form.touched[fieldPath]` is set (and there is a current error), or when the
 * value still matches the initial value and there is an initial error.
 *
 * @param {object} form
 * @param {string} fieldPath
 * @param {{ value?: unknown, onBlur?: function }|undefined} field Formik `field` from FastField
 * @returns {string|object|null|undefined} Error to pass to SUI, or null/undefined to hide
 */
export function getFieldErrorsForDisplay(form, fieldPath, field) {
  const err = pickDisplayableError(form.errors, fieldPath);
  const initialErr = pickDisplayableError(form.initialErrors, fieldPath);
  const touched =
    getIn(form.touched, fieldPath, false) ||
    PID_ERROR_LEAF_KEYS.some((leaf) =>
      getIn(form.touched, `${fieldPath}.${leaf}`, false)
    );
  const initialValue = getIn(form.initialValues, fieldPath);
  const value = field?.value;

  const showFromValidation = !!err && !!touched;
  const valueStillInitial =
    value !== undefined &&
    initialValue !== undefined &&
    (value === initialValue || areDeeplyEqual(value, initialValue, []));
  const showFromInitial = valueStillInitial && !!initialErr;

  if (showFromValidation) {
    return err;
  }
  if (showFromInitial) {
    return initialErr;
  }
  return null;
}
