// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable components: fully generic implementations that simply shadow
// stock components (e.g. replacement PIDField). Import from field_components/overridable
// when you need these replacement versions. Alternate field UIs (e.g. additional
// dates) live under field_components/alternate/.
// (SizesComponent has no stock component in RDM—it lives in field_components/contrib.)

export { OverrideDoiComponent } from "./DoiComponent";
export { OverrideLanguagesComponent } from "./LanguagesComponent";
export { OverrideSubmissionComponent } from "./SubmissionComponent";
