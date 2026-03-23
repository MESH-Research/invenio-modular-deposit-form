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
//   2) `CreatibutorsField.js`:
//      - explicit replacement for creators/contributors field-level behavior,
//      - imports upstream modal/item/type and sortOptions by @js alias to avoid
//        overriding additional child files,
//      - gates field error display on touched to avoid pre-interaction errors,
//      - marks metadata.creators touched when opening Add and after save so
//        required empty-array validation appears after user interaction.
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
