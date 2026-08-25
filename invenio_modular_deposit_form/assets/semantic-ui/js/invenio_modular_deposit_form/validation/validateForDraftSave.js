// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { getIn, setIn, yupToFormErrors } from "formik";

/**
 * Yup `ValidationError.type` values that do not block draft save.
 * Presence / emptiness constraints (e.g. empty creators `.min(1)`, missing `.required()`)
 * are allowed through so incomplete drafts can still be saved. Format/consistency types
 * are not listed here and remain blocking.
 *
 * @type {ReadonlySet<string>}
 */
const DRAFT_SAVE_NON_BLOCKING_YUP_TYPES = new Set(["required", "min"]);

/**
 * @typedef {Object} ClientValidationResult
 * @property {Object} errors - Formik-shaped errors (string leaves)
 * @property {boolean} hasDraftBlockingClientErrors - true when any Yup failure is not in
 *   {@link DRAFT_SAVE_NON_BLOCKING_YUP_TYPES}
 */

/**
 * Whether a Yup ValidationError should block draft save.
 * Presence/emptiness failures (`required`, `min`) are allowed through; format/consistency
 * errors are not.
 *
 * @param {{ type?: string }|null|undefined} err
 * @returns {boolean}
 */
function isDraftSaveBlockingError(err) {
  return !DRAFT_SAVE_NON_BLOCKING_YUP_TYPES.has(err?.type);
}

/**
 * Build a Formik errors object from Yup ValidationError instances (string leaves).
 * First message wins per path (same rule as Formik's yupToFormErrors).
 *
 * @param {import("yup").ValidationError[]} yupErrors
 * @returns {Object}
 */
function formikErrorsFromYupErrors(yupErrors) {
  let errors = {};
  for (const err of yupErrors) {
    if (!err?.path) continue;
    if (!getIn(errors, err.path)) {
      errors = setIn(errors, err.path, err.message);
    }
  }
  return errors;
}

/**
 * Run a Yup schema and return Formik-shaped string errors plus draft-blocking meta.
 * Meta is derived from raw Yup `type` before conversion to strings.
 *
 * @param {import("yup").ObjectSchema|undefined} schema
 * @param {object} values
 * @returns {Promise<ClientValidationResult>}
 */
async function validateSchemaToFormikErrors(schema, values) {
  if (!schema) {
    return { errors: {}, hasDraftBlockingClientErrors: false };
  }
  try {
    await schema.validate(values, { abortEarly: false });
    return { errors: {}, hasDraftBlockingClientErrors: false };
  } catch (err) {
    if (err?.name !== "ValidationError") {
      throw err;
    }
    const candidates = !err.inner?.length ? [err] : err.inner;
    return {
      errors: yupToFormErrors(err),
      hasDraftBlockingClientErrors: candidates.some(isDraftSaveBlockingError),
    };
  }
}

/**
 * Validate for draft save: omit presence/emptiness Yup failures (`required`, `min`) from
 * returned errors so incomplete drafts can still be saved. Meta reflects whether any
 * blocking Yup type was present.
 *
 * @param {import("yup").ObjectSchema|undefined} schema
 * @param {object} values
 * @returns {Promise<ClientValidationResult>}
 */
async function validateForDraftSave(schema, values) {
  if (!schema) {
    return { errors: {}, hasDraftBlockingClientErrors: false };
  }
  try {
    await schema.validate(values, { abortEarly: false });
    return { errors: {}, hasDraftBlockingClientErrors: false };
  } catch (err) {
    if (err?.name !== "ValidationError") {
      throw err;
    }
    const candidates = !err.inner?.length ? [err] : err.inner;
    const blocking = candidates.filter(isDraftSaveBlockingError);
    return {
      errors: formikErrorsFromYupErrors(blocking),
      hasDraftBlockingClientErrors: blocking.length > 0,
    };
  }
}

export {
  isDraftSaveBlockingError,
  validateForDraftSave,
  validateSchemaToFormikErrors,
};
