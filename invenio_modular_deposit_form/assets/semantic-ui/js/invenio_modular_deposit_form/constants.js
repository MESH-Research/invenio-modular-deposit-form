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

export {
  DEFAULT_TITLE_MAX_LENGTH,
  RECORD_FIELD_ERROR_ROOTS,
  RDM_RECORD_ACCESS_LEVELS,
  SEVERITIES,
};

