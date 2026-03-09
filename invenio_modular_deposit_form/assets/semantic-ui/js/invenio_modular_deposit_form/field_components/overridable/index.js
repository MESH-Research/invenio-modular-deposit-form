// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable components: fully generic implementations that simply shadow
// stock components (replacement DatesFieldAlternate, PIDField). Import directly from
// field_components/overridable when you need these replacement versions.
// (SizesComponent has no stock component in RDM—it lives in field_components/contrib.)

export { OverrideAdditionalDatesComponent } from "./AdditionalDatesComponent";
export { OverrideCommunitiesComponent } from "./CommunitiesComponent";
export { OverrideDoiComponent } from "./DoiComponent";
export { OverrideLanguagesComponent } from "./LanguagesComponent";
export { OverrideResourceTypeComponent } from "./ResourceTypeComponent";
export { OverrideSubmissionComponent } from "./SubmissionComponent";
