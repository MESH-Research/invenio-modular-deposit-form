// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import { string as yupString } from "yup";
import _get from "lodash/get";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

import {
  DEFAULT_LOCATION_SCHEME_IDS,
  DEFAULT_PERSONORG_SCHEME_IDS,
  DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS,
} from "../constants";
import {
  DEFAULT_GENERIC_IDENTIFIER_INVALID_MESSAGE,
  identifierMessagesForScheme,
  SCHEME_ID_TO_VALIDATOR,
  schemeIdLabelUppercase,
} from "./validatorsForIds";

const DEFAULT_ID_REQUIRED_MSG = i18next.t("Add an identifier or remove this row");

/** Shown when `parent.scheme` is not in the configured `allowedSchemeIds` list. */
const SCHEME_NOT_ALLOWED_MSG = i18next.t("This identifier scheme is not allowed.");

/**
 * Order for trying schemes when the UI only has a free-text identifier (creatibutor modal).
 * Matches common ambiguity resolution (ORCID vs other person/org PIDs).
 */
const CREATOR_IDENTIFIER_INFERENCE_ORDER = ["orcid", "isni", "ror", "gnd"];

/**
 * Extract scheme id strings from configured vocabularies.
 * Expects array of { id, title_l10n } or { value, text }.
 * If missing or empty, returns a copy of default schemes list.
 *
 * @param {Object} config - Deposit config (e.g. from Redux store)
 * @param {string} fieldPath - Dot path under `config.vocabularies` (e.g. `"metadata.identifiers.scheme"`)
 * @returns {string[]} Allowed scheme ids — always use this list as the single restriction set.
 */
function getIdentifierSchemeIds(config, fieldPath) {
  const fieldSchemeDefaults = {
    "metadata.contributors.identifiers.scheme": DEFAULT_PERSONORG_SCHEME_IDS,
    "metadata.creators.identifiers.scheme": DEFAULT_PERSONORG_SCHEME_IDS,
    "metadata.identifiers.scheme": DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS,
    "metadata.locations.identifiers.scheme": DEFAULT_LOCATION_SCHEME_IDS,
  };
  const schemeVocab = _get(config?.vocabularies, fieldPath);
  const ids = Array.isArray(schemeVocab)
    ? schemeVocab.map((item) => item.id ?? item.value ?? "").filter(Boolean)
    : [];
  if (ids.length > 0) {
    return ids;
  }
  const fallback = fieldSchemeDefaults[fieldPath];
  return fallback != null ? [...fallback] : [];
}

/**
 * Infer which allowed creator/person-org scheme validates the given string, using the same
 * per-scheme Yup methods as the deposit form and backend idutils-based checks.
 *
 * @param {string|null|undefined} rawValue - User-entered identifier string
 * @param {string[]} allowedSchemeIds - From {@link getIdentifierSchemeIds}
 * @returns {string|null} Scheme id or null if nothing matches
 */
function inferCreatorIdentifierScheme(rawValue, allowedSchemeIds) {
  const v = rawValue == null ? "" : String(rawValue).trim();
  if (!v) return null;
  const allowed = Array.isArray(allowedSchemeIds) ? allowedSchemeIds : [];
  if (allowed.length === 0) return null;

  const ordered = [
    ...CREATOR_IDENTIFIER_INFERENCE_ORDER.filter((id) => allowed.includes(id)),
    ...allowed.filter((id) => !CREATOR_IDENTIFIER_INFERENCE_ORDER.includes(id)),
  ];

  for (const scheme of ordered) {
    const validatorFn = SCHEME_ID_TO_VALIDATOR[scheme];
    if (!validatorFn) continue;
    const msgs = identifierMessagesForScheme(scheme);
    try {
      yupString().required(msgs.required)[scheme](msgs.invalid).validateSync(v);
      return scheme;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * User-facing message when a non-empty string does not match any allowed creator scheme.
 *
 * @param {string[]} allowedSchemeIds
 * @returns {string}
 */
function unrecognizedCreatorIdentifierMessage(allowedSchemeIds) {
  const labels = (allowedSchemeIds ?? []).map(schemeIdLabelUppercase).join(", ");
  return i18next.t("This identifier is not valid for any supported scheme ({{schemes}}).", {
    schemes: labels,
  });
}

/**
 * Yup test: validate identifier string using `this.parent.scheme` and
 * {@link SCHEME_ID_TO_VALIDATOR}. Shared by record- and creator-style rows.
 *
 * - **`inferSchemeWhenEmpty: false`** (record / related / references / locations): if there is
 *   no scheme on the parent, the test passes (other schema rules handle required scheme).
 * - **`inferSchemeWhenEmpty: true`** (creators): if scheme is empty, {@link inferCreatorIdentifierScheme}
 *   is tried; a non-empty value that still has no resolvable scheme fails with
 *   {@link unrecognizedCreatorIdentifierMessage}.
 *
 * @param {Object} options
 * @param {string[]} options.allowedSchemeIds - `parent.scheme` (after optional inference) must be in this list.
 * @param {Object} options.yupString - Yup `string()` factory with per-scheme methods registered.
 * @param {boolean} [options.inferSchemeWhenEmpty=false]
 * @returns {function} Yup `.test` callback (`true`, or `createError(...)`)
 */
function makeSchemeBasedIdentifierTest({
  allowedSchemeIds,
  yupString,
  inferSchemeWhenEmpty = false,
}) {
  return function (value) {
    const { createError, path } = this;
    const rawScheme = this.parent?.scheme;
    let scheme = rawScheme == null ? "" : String(rawScheme).trim();
    if (!scheme && inferSchemeWhenEmpty) {
      scheme = inferCreatorIdentifierScheme(value, allowedSchemeIds) ?? "";
    }
    if (!scheme) {
      if (inferSchemeWhenEmpty && value != null && String(value).trim() !== "") {
        return createError({
          path,
          message: unrecognizedCreatorIdentifierMessage(allowedSchemeIds),
        });
      }
      return true;
    }
    if (!allowedSchemeIds.includes(scheme)) {
      return createError({ path, message: SCHEME_NOT_ALLOWED_MSG });
    }
    const validatorFn = SCHEME_ID_TO_VALIDATOR[scheme];
    const msgs = identifierMessagesForScheme(scheme);
    const requiredMsg = msgs.required;
    const schema = validatorFn
      ? yupString().required(requiredMsg)[scheme](msgs.invalid)
      : yupString().required(DEFAULT_ID_REQUIRED_MSG);
    try {
      schema.validateSync(value);
      return true;
    } catch (err) {
      const message = err.errors?.[0] ?? err.message;
      return createError({ path, message });
    }
  };
}

/**
 * Schema method: validates identifier string using `this.parent.scheme` and per-scheme Yup validators.
 * Register with `addMethod(yupString, "validIdentifierForScheme", validIdentifierForScheme)` after
 * per-scheme validators are attached to `yup.string`.
 *
 * @param {string[]} allowedSchemeIds - From {@link getIdentifierSchemeIds}(config, vocab path under `config.vocabularies`)
 * @param {boolean} [inferSchemeWhenEmpty=false] - `true` for creator `person_or_org.identifiers` (infer scheme from value when empty); `false` for record/related/references/location rows
 */
function validIdentifierForScheme(allowedSchemeIds, inferSchemeWhenEmpty = false) {
  return this.test(
    "identifier-by-parent-scheme",
    DEFAULT_GENERIC_IDENTIFIER_INVALID_MESSAGE,
    makeSchemeBasedIdentifierTest({
      allowedSchemeIds,
      yupString,
      inferSchemeWhenEmpty,
    })
  );
}

export { getIdentifierSchemeIds, makeSchemeBasedIdentifierTest, validIdentifierForScheme };
