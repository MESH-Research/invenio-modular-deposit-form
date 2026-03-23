// Replacement field-components package summary:
// - Default pattern: these files mirror stock invenio-rdm-records field components
//   and only swap low-level widget imports to local replacement widgets from the
//   parent `replacement_components` folder (mainly `TextField` / `SelectField`).
// - Itemized exceptions:
//   1) `PIDField.js`:
//      - new KCWorks replacement (no stock file previously in this folder),
//      - custom unmanaged DOI/PID error-display timing (touched or initialErrors),
//      - unmanaged/default external state retains `provider: "external"` with
//        empty identifier so blur/touched validation keeps a stable field path,
//      - managed DOI reserve/unreserve UI intentionally disabled, with doi.org label.
//   2) `CreatibutorsField.js` + `creatibutor_components/CreatibutorsModal.js`:
//      - explicit replacement for creators/contributors field-level behavior,
//      - local fork of upstream modal only: `onModalClose` runs in `closeModal()`
//        so parent can setFieldTouched when modal dismisses (cancel/close/save),
//      - field item/type/utils still imported from @js/invenio_rdm_records,
//      - gates field error display on touched to avoid pre-interaction errors.
//   3) Any future non-widget behavioral divergence should be documented here.
export { AdditionalDescriptionsField } from "./AdditionalDescriptionsField";
export { AdditionalTitlesField } from "./AdditionalTitlesField";
export { CopyrightsField } from "./CopyrightsField";
export { CreatibutorsField } from "./CreatibutorsField";
export { DescriptionsField } from "./DescriptionsField";
export { LanguagesField } from "./LanguagesField";
export { PIDField } from "./PIDField";
export { PublisherField } from "./PublisherField";
export { ResourceTypeField } from "./ResourceTypeField";
export { TitlesField } from "./TitlesField";
export { VersionField } from "./VersionField";
