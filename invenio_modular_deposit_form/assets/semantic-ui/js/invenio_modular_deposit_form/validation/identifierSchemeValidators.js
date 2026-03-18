// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

import { SCHEME_ID_TO_VALIDATOR } from "./validatorsForIds";

/**
 * Extract scheme id strings from vocabularies.creators.identifiers.scheme.
 * Expects array of { id, title_l10n } or { value, text }.
 *
 * @param {Object} config - Deposit config (e.g. from Redux store)
 * @returns {string[]} List of scheme ids, e.g. ["orcid", "isni", "gnd", "ror", "url"]
 */
export function getCreatorIdentifierSchemeIdsFromVocab(config) {
  const schemeVocab =
    config?.vocabularies?.metadata?.creators?.identifiers?.scheme ??
    config?.vocabularies?.creators?.identifiers?.scheme;
  if (!Array.isArray(schemeVocab)) return [];
  return schemeVocab.map((item) => item.id ?? item.value ?? "").filter(Boolean);
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

/**
 * Creator identifier error messages keyed by scheme id.
 * Used by makeCreatorIdentifierTest and by buildValidationSchema.
 */
export const CREATOR_IDENTIFIER_MESSAGES = {
  url: {
    invalid: i18next.t("Must be a valid URL (e.g. https://example.com)"),
    required: i18next.t("You must provide a URL or remove this row"),
  },
  orcid: {
    invalid: i18next.t("Must be a valid ORCID id (e.g., 0000-0001-2345-6789)"),
    required: i18next.t("You must provide an ORCID id or remove this row"),
  },
  isni: {
    invalid: i18next.t("Must be a valid ISNI id (e.g., 0000-0001-2345-6789)"),
    required: i18next.t("You must provide an ISNI id or remove this row"),
  },
  gnd: {
    invalid: i18next.t("Must be a valid GND id (e.g., gnd:118627813)"),
    required: i18next.t("You must provide a GND id or remove this row"),
  },
  ror: {
    invalid: i18next.t("Must be a valid ROR id (e.g., 03rjyp183)"),
    required: i18next.t("You must provide a ROR id or remove this row"),
  },
};

const DEFAULT_REQUIRED_MSG = i18next.t("You must provide an identifier or remove this row");

/** Scheme ids that have a validator in SCHEME_ID_TO_VALIDATOR (creator/contributor identifiers). */
export const CREATOR_SCHEME_IDS = Object.keys(SCHEME_ID_TO_VALIDATOR);

/**
 * Same set of scheme ids used for record identifiers (metadata.identifiers, metadata.related_identifiers).
 * RDM_RECORDS_IDENTIFIERS_SCHEMES includes all of these; backend may restrict via config.
 */
export const RECORD_SCHEME_IDS = Object.keys(SCHEME_ID_TO_VALIDATOR);

/**
 * Extract scheme id strings from vocabularies.metadata.identifiers.scheme.
 * Used for metadata.identifiers and metadata.related_identifiers validation.
 *
 * @param {Object} config - Deposit config (e.g. from Redux store)
 * @returns {string[]} List of scheme ids, e.g. ["doi", "ark", "url", "isbn", ...]
 */
export function getRecordIdentifierSchemeIdsFromVocab(config) {
  const schemeVocab =
    config?.vocabularies?.metadata?.identifiers?.scheme ??
    config?.vocabularies?.identifiers?.scheme;
  if (!Array.isArray(schemeVocab)) return [];
  return schemeVocab.map((item) => item.id ?? item.value ?? "").filter(Boolean);
}

/**
 * Build the record identifier yup chain for the given scheme ids.
 * Same logic as buildCreatorIdentifierChain; used for metadata.identifiers and metadata.related_identifiers.
 *
 * @param {import("yup").StringSchema} base - yupString().required("...")
 * @param {string[]} allowedSchemeIds - From getRecordIdentifierSchemeIdsFromVocab(config)
 * @param {Object} yupString - The yup string schema (with addMethod from SCHEME_ID_TO_VALIDATOR)
 * @returns {import("yup").StringSchema}
 */
export function buildRecordIdentifierChain(base, allowedSchemeIds, yupString) {
  let chain = base;
  const schemes = allowedSchemeIds.length ? allowedSchemeIds : RECORD_SCHEME_IDS;
  for (const schemeId of schemes) {
    if (!SCHEME_ID_TO_VALIDATOR[schemeId]) continue;
    const msgs = CREATOR_IDENTIFIER_MESSAGES[schemeId] ?? {
      invalid: i18next.t("Invalid identifier for this scheme"),
      required: DEFAULT_REQUIRED_MSG,
    };
    const thenSchema = yupString().required(msgs.required)[schemeId](msgs.invalid);
    chain = chain.when("scheme", { is: schemeId, then: thenSchema });
  }
  return chain;
}

/**
 * Build the creator identifier yup chain for the given scheme ids.
 * Uses SCHEME_ID_TO_VALIDATOR: only adds .when() for schemes that have a validator and messages.
 *
 * @param {import("yup").StringSchema} base - yupString().required("A value is required for each identifier")
 * @param {string[]} allowedSchemeIds - From getCreatorIdentifierSchemeIdsFromVocab(config)
 * @param {Object} yupString - The yup string schema (with addMethod already applied from SCHEME_ID_TO_VALIDATOR)
 * @returns {import("yup").StringSchema}
 */
export function buildCreatorIdentifierChain(base, allowedSchemeIds, yupString) {
  let chain = base;
  const schemes = allowedSchemeIds.length ? allowedSchemeIds : CREATOR_SCHEME_IDS;
  for (const schemeId of schemes) {
    if (!SCHEME_ID_TO_VALIDATOR[schemeId]) continue;
    const msgs = CREATOR_IDENTIFIER_MESSAGES[schemeId] ?? {
      invalid: i18next.t("Invalid identifier for this scheme"),
      required: DEFAULT_REQUIRED_MSG,
    };
    const thenSchema = yupString().required(msgs.required)[schemeId](msgs.invalid);
    chain = chain.when("scheme", { is: schemeId, then: thenSchema });
  }
  return chain;
}

/**
 * Returns a yup test function for creator identifiers that validates by parent.scheme.
 * Applies the correct validation function from SCHEME_ID_TO_VALIDATOR for the scheme.
 *
 * @param {string[]} allowedSchemeIds - From getCreatorIdentifierSchemeIdsFromVocab(config)
 * @param {Object} yupString - yup string schema with methods added from SCHEME_ID_TO_VALIDATOR
 * @returns {function} Yup test function
 */
export function makeCreatorIdentifierTest(allowedSchemeIds, yupString) {
  const schemes = allowedSchemeIds.length ? allowedSchemeIds : CREATOR_SCHEME_IDS;
  return function (value, context) {
    const { createError, path } = this;
    const scheme = this.parent?.scheme;
    if (!scheme) return true;
    const validatorFn = SCHEME_ID_TO_VALIDATOR[scheme];
    if (!validatorFn && !schemes.includes(scheme)) return true;
    const msgs = CREATOR_IDENTIFIER_MESSAGES[scheme];
    const requiredMsg = msgs?.required ?? DEFAULT_REQUIRED_MSG;
    const schema = validatorFn
      ? yupString().required(requiredMsg)[scheme](msgs?.invalid)
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
