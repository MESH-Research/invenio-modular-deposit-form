// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

/**
 * Top-level keys that correspond to Formik values / Yup validation on the deposit record.
 */
const RECORD_FIELD_ERROR_ROOTS = Object.freeze([
  "metadata",
  "access",
  "pids",
  "custom_fields",
  "files",
]);

/** Error severity levels */
const SEVERITIES = Object.freeze(["error", "warning", "info"]);

/**
 * Allowed string values for `access.files` and `access.record` on the deposit record (Invenio RDM).
 */
const RDM_RECORD_ACCESS_LEVELS = Object.freeze(["public", "restricted"]);

/** Default `metadata.title` max length when `config.max_title_length` is unset (matches typical RDM default). */
const DEFAULT_TITLE_MAX_LENGTH = 260;

const SIDEBAR_DEFAULTS_WIDTHS = {
  mobile: 16,
  tablet: 16,
  computer: 3,
  largeScreen: 3,
  widescreen: 3,
};

/*
 * Default keys of `RDM_RECORDS_IDENTIFIERS_SCHEMES` in
 * `invenio_rdm_records.config` (stock InvenioRDM). Used when record identifier
 * vocab is missing or empty; instances override via config / merge_deposit_config.
 */
const DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS = [
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

/**
 * Default keys of `RDM_RECORDS_PERSONORG_SCHEMES` in
 * `invenio_rdm_records.config` (stock InvenioRDM). Used when creator identifier
 * vocab is missing or empty; instances override via config / merge_deposit_config.
 */
const DEFAULT_PERSONORG_SCHEME_IDS = ["orcid", "isni", "gnd", "ror"];

/**
 * Default keys of `RDM_RECORDS_LOCATION_SCHEMES` in
 * `invenio_rdm_records.config` (stock InvenioRDM). Used when location identifier
 * vocab is missing or empty.
 */
const DEFAULT_LOCATION_SCHEME_IDS = ["wikidata", "geonames"];

export {
  DEFAULT_LOCATION_SCHEME_IDS,
  DEFAULT_PERSONORG_SCHEME_IDS,
  DEFAULT_RECORD_IDENTIFIER_SCHEME_IDS,
  DEFAULT_TITLE_MAX_LENGTH,
  RECORD_FIELD_ERROR_ROOTS,
  RDM_RECORD_ACCESS_LEVELS,
  SEVERITIES,
  SIDEBAR_DEFAULTS_WIDTHS,
};
