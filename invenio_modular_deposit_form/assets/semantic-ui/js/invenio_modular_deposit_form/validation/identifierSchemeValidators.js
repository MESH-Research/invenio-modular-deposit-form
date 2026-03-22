// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import { string as yupString } from "yup";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

import { identifierMessagesForScheme, SCHEME_ID_TO_VALIDATOR } from "./validatorsForIds";

/**
 * Default keys of `RDM_RECORDS_PERSONORG_SCHEMES` in
 * `invenio_rdm_records.config` (stock InvenioRDM). Used when creator identifier
 * vocab is missing or empty; instances override via config / merge_deposit_config.
 */
export const DEFAULT_PERSONORG_SCHEME_IDS = ["orcid", "isni", "gnd", "ror"];

/**
 * Default keys of `RDM_RECORDS_IDENTIFIERS_SCHEMES` in
 * `invenio_rdm_records.config` (stock InvenioRDM). Used when record identifier
 * vocab is missing or empty; instances override via config / merge_deposit_config.
 */
export const DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS = [
  "ark",
  "arxiv",
  "ads",
  "crossreffunderid",
  "doi",
  "ean13",
  "eissn",
  "grid",
  "handle",
  "igsn",
  "isbn",
  "isni",
  "issn",
  "istc",
  "lissn",
  "lsid",
  "pmid",
  "purl",
  "upc",
  "url",
  "urn",
  "w3id",
  "other",
];

/** All scheme ids that have a JS validator in {@link SCHEME_ID_TO_VALIDATOR}. */
export const VALIDATOR_SCHEME_IDS = Object.keys(SCHEME_ID_TO_VALIDATOR);

/**
 * Extract scheme id strings from vocabularies.creators.identifiers.scheme.
 * Expects array of { id, title_l10n } or { value, text }.
 * If missing or empty, returns a copy of {@link DEFAULT_PERSONORG_SCHEME_IDS}
 * (matches default `RDM_RECORDS_PERSONORG_SCHEMES` in invenio-rdm-records).
 *
 * @param {Object} config - Deposit config (e.g. from Redux store)
 * @returns {string[]} Allowed scheme ids — always use this list as the single restriction set.
 */
export function getCreatorIdentifierSchemeIdsFromVocab(config) {
  const schemeVocab =
    config?.vocabularies?.metadata?.creators?.identifiers?.scheme ??
    config?.vocabularies?.creators?.identifiers?.scheme;
  if (!Array.isArray(schemeVocab)) return [...DEFAULT_PERSONORG_SCHEME_IDS];
  const ids = schemeVocab.map((item) => item.id ?? item.value ?? "").filter(Boolean);
  return ids.length > 0 ? ids : [...DEFAULT_PERSONORG_SCHEME_IDS];
}

/**
 * Extract option values from a vocabulary array (for .oneOf()).
 * Expects array of { id, title_l10n } or { value, text }.
 *
 * @param {Array} vocab - Vocabulary array
 * @returns {string[]} List of values
 */
export function getVocabOptionValues(vocab) {
  if (!Array.isArray(vocab)) return [];
  return vocab.map((item) => item.id ?? item.value ?? "").filter(Boolean);
}

const DEFAULT_REQUIRED_MSG = i18next.t("You must provide an identifier or remove this row");

export { identifierMessagesForScheme } from "./validatorsForIds";

/** @deprecated Use {@link identifierMessagesForScheme} */
export const CREATOR_IDENTIFIER_MESSAGES = new Proxy(
  {},
  {
    get(_, schemeId) {
      return identifierMessagesForScheme(String(schemeId));
    },
  }
);

/** Shown when `parent.scheme` is not in the configured `allowedSchemeIds` list. */
const SCHEME_NOT_ALLOWED_MSG = i18next.t(
  "This identifier scheme is not allowed."
);

/**
 * Extract scheme id strings from vocabularies.metadata.identifiers.scheme.
 * Used for metadata.identifiers and metadata.related_identifiers validation.
 * If missing or empty, returns a copy of {@link DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS}
 * (matches default `RDM_RECORDS_IDENTIFIERS_SCHEMES` in invenio-rdm-records).
 *
 * @param {Object} config - Deposit config (e.g. from Redux store)
 * @returns {string[]} Allowed scheme ids — always use this list as the single restriction set.
 */
export function getRecordIdentifierSchemeIdsFromVocab(config) {
  const schemeVocab =
    config?.vocabularies?.metadata?.identifiers?.scheme ??
    config?.vocabularies?.identifiers?.scheme;
  if (!Array.isArray(schemeVocab)) return [...DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS];
  const ids = schemeVocab.map((item) => item.id ?? item.value ?? "").filter(Boolean);
  return ids.length > 0 ? ids : [...DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS];
}

/**
 * Default keys of `RDM_RECORDS_LOCATION_SCHEMES` in
 * `invenio_rdm_records.config` (stock InvenioRDM). Used when location identifier
 * vocab is missing or empty.
 */
export const DEFAULT_LOCATION_SCHEME_IDS = ["wikidata", "geonames"];

/**
 * Extract scheme id strings for `metadata.locations.features[].identifiers`
 * (same registry as {@link DEFAULT_LOCATION_SCHEME_IDS}).
 *
 * @param {Object} config - Deposit config (e.g. from Redux store)
 * @returns {string[]} Allowed scheme ids for location identifiers
 */
export function getLocationIdentifierSchemeIdsFromVocab(config) {
  const schemeVocab =
    config?.vocabularies?.metadata?.locations?.identifiers?.scheme ??
    config?.vocabularies?.locations?.identifiers?.scheme;
  if (!Array.isArray(schemeVocab)) return [...DEFAULT_LOCATION_SCHEME_IDS];
  const ids = schemeVocab.map((item) => item.id ?? item.value ?? "").filter(Boolean);
  return ids.length > 0 ? ids : [...DEFAULT_LOCATION_SCHEME_IDS];
}

/**
 * Returns a yup test function for record identifiers that validates by parent.scheme.
 * Looks up `this.parent.scheme`, builds `yupString().required(...)[scheme](...)`, and runs
 * validateSync on the identifier value — so any scheme in SCHEME_ID_TO_VALIDATOR is handled
 * in one place without chaining .when() per scheme.
 *
 * Used by {@link validRecordIdentifierForScheme} for
 * `metadata.identifiers`, `related_identifiers`, `references`, and location
 * identifier rows (see validator.js).
 *
 * @param {string[]} allowedSchemeIds - Allowed schemes only; `parent.scheme` must be in this list.
 *   Callers should pass {@link getRecordIdentifierSchemeIdsFromVocab} (which defaults to
 *   {@link DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS} when vocab is empty).
 * @param {Object} yupString - yup string schema with methods added from SCHEME_ID_TO_VALIDATOR
 * @returns {function} Yup test function
 */
export function makeRecordIdentifierTest(allowedSchemeIds, yupString) {
  return function (value, context) {
    const { createError, path } = this;
    const scheme = this.parent?.scheme;
    if (!scheme) return true;
    if (!allowedSchemeIds.includes(scheme)) {
      return createError({ path, message: SCHEME_NOT_ALLOWED_MSG });
    }
    const validatorFn = SCHEME_ID_TO_VALIDATOR[scheme];
    const msgs = identifierMessagesForScheme(scheme);
    const requiredMsg = msgs.required;
    const schema = validatorFn
      ? yupString().required(requiredMsg)[scheme](msgs.invalid)
      : yupString().required(DEFAULT_REQUIRED_MSG);
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
 * Returns a yup test function for creator identifiers that validates by parent.scheme.
 * Looks up `this.parent.scheme`, builds `yupString().required(...)[scheme](...)`, and runs
 * validateSync on the identifier value — so any scheme in SCHEME_ID_TO_VALIDATOR is handled
 * in one place without chaining .when() per scheme.
 *
 * Used by {@link validIdentifierForScheme} for
 * `metadata.creators[].person_or_org.identifiers[].identifier` (schema built in validator.js).
 *
 * @param {string[]} allowedSchemeIds - Allowed schemes only; `parent.scheme` must be in this list.
 *   Callers should pass {@link getCreatorIdentifierSchemeIdsFromVocab} (which defaults to
 *   {@link DEFAULT_PERSONORG_SCHEME_IDS} when vocab is empty).
 * @param {Object} yupString - yup string schema with methods added from SCHEME_ID_TO_VALIDATOR
 * @returns {function} Yup test function
 */
export function makeCreatorIdentifierTest(allowedSchemeIds, yupString) {
  return function (value, context) {
    const { createError, path } = this;
    const scheme = this.parent?.scheme;
    if (!scheme) return true;
    if (!allowedSchemeIds.includes(scheme)) {
      return createError({ path, message: SCHEME_NOT_ALLOWED_MSG });
    }
    const validatorFn = SCHEME_ID_TO_VALIDATOR[scheme];
    const msgs = identifierMessagesForScheme(scheme);
    const requiredMsg = msgs.required;
    const schema = validatorFn
      ? yupString().required(requiredMsg)[scheme](msgs.invalid)
      : yupString().required(DEFAULT_REQUIRED_MSG);
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
 * Schema method (same pattern as orcidValidator): returns `this.test(...)` with
 * {@link makeCreatorIdentifierTest} as the inner callback. Register with
 * `addMethod(yupString, "validIdentifierForScheme", validIdentifierForScheme)` after
 * per-scheme validators are attached to `yup.string`.
 *
 * @param {string[]} allowedSchemeIds - From getCreatorIdentifierSchemeIdsFromVocab(config)
 */
export function validIdentifierForScheme(allowedSchemeIds) {
  return this.test(
    "creator-identifier-by-scheme",
    i18next.t("This is not a valid identifier for this scheme."),
    makeCreatorIdentifierTest(allowedSchemeIds, yupString)
  );
}

/**
 * Schema method for record / related identifiers: returns `this.test(...)` with
 * {@link makeRecordIdentifierTest}. Register with
 * `addMethod(yupString, "validRecordIdentifierForScheme", validRecordIdentifierForScheme)` after
 * per-scheme validators are attached to `yup.string`.
 *
 * @param {string[]} allowedSchemeIds - From getRecordIdentifierSchemeIdsFromVocab(config) or
 *   {@link getLocationIdentifierSchemeIdsFromVocab} for location rows.
 */
export function validRecordIdentifierForScheme(allowedSchemeIds) {
  return this.test(
    "record-identifier-by-scheme",
    i18next.t("This is not a valid identifier for this scheme."),
    makeRecordIdentifierTest(allowedSchemeIds, yupString)
  );
}
