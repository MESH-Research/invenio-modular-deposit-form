// Replacement field-components package summary:
// - Default pattern: these files mirror stock invenio-rdm-records field components
//   and only swap low-level widget imports to local replacement widgets from the
//   parent `replacement_components` folder (mainly `TextField` / `SelectField`).
// - Itemized exceptions:
//   1) `PIDField.js`:
//      - new KCWorks replacement (no stock file previously in this folder),
//      - custom unmanaged DOI/PID error-display timing (touched or initialErrors),
//      - managed DOI reserve/unreserve UI intentionally disabled, with doi.org label.
//   2) Any future non-widget behavioral divergence should be documented here.
export { AdditionalDescriptionsField } from "./AdditionalDescriptionsField";
export { AdditionalTitlesField } from "./AdditionalTitlesField";
export { CopyrightsField } from "./CopyrightsField";
export { DescriptionsField } from "./DescriptionsField";
export { LanguagesField } from "./LanguagesField";
export { PIDField } from "./PIDField";
export { PublisherField } from "./PublisherField";
export { ResourceTypeField } from "./ResourceTypeField";
export { TitlesField } from "./TitlesField";
export { VersionField } from "./VersionField";
