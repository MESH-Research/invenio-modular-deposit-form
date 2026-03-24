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
// wiring and error-display behavior; see those files for deltas vs stock.

export { PIDField } from "./PIDFieldCmp";
