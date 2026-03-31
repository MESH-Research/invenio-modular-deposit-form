// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Upstream equivalent: `invenio_rdm_records/.../deposit/fields/Identifiers/PIDField/index.js`
// (same one-line re-export).
//
// This file exists so the modular deposit app imports `PIDField` from this package’s
// `replacement_components/field_components/PIDField` tree. The implementation it points
// to (`./PIDFieldCmp`) is a local copy because sibling files (`RequiredPIDField`,
// `OptionalPIDField`, `pid_components/*`) are maintained here with deposit-form–specific
// wiring, touched-aware errors (`getFieldErrorsForDisplay`), and explicit
// `setFieldTouched(fieldPath, false, false)` on PID radios (untouched, no validate on that call); see
// docs/source/replacement_field_components.md (“Formik touched and this fork”).
// `RequiredPIDField` seeds `provider: "external"` (or clears stale non-external shape for
// managed default) on mount when there is no identifier; persists **`managed_selection`** and
// **`draft_*_pid_backup`** under **`values.ui.<fieldPath>`**; radio **`restoreFromBackup`**;
// debounced unmanaged backup; **`componentDidUpdate`** syncs **`draft_managed_pid_backup`**
// when managed branch + `pids.<scheme>` reference changes. Switch **`disabled`**: **`hasDoi`**
// from **`record.pids.doi`**, **`isDoiCreated`** from draft field (stock parity).
// `OptionalPIDField` does not seed, persists optional-DOI radios in
// `values.ui.pids.doi.managed_selection`, and its unmanaged radio clears `pids` without
// `external` (optional DOI). Same doc.

export { PIDField } from "./PIDFieldCmp";
