// Replacement field-components (re-exports below)
// =================================================
// These modules mirror `invenio_rdm_records` deposit field components but adapt them for
// Invenio Modular Deposit Form: local widgets (`replacement_components/TextField`, etc.),
// touched-aware errors, or import paths that only resolve inside this bundle.
//
// Full enumeration, per-field notes, and “what upstream could change” live in the Sphinx doc:
//   docs/source/replacement_field_components.md
//
// Default pattern (most files in this folder)
// -------------------------------------------
// Copy of the stock field file with the same class/API; only imports change so basic
// controls use `../TextField`, `../RemoteSelectField`, or other replacements from
// `replacement_components/` instead of `react-invenio-forms` defaults where applicable.
//
// Exceptions (larger forks — summary only; see doc + file headers)
// -----------------------------------------------------------------
// PIDField/
//   Fork of upstream `deposit/fields/Identifiers/PIDField` (layout: `PIDFieldCmp`,
//   `RequiredPIDField`, `OptionalPIDField` at folder root; `pid_components/` for local
//   identifier UIs + `fieldErrorsForDisplay`). Stock uses `getFieldErrors` (show as soon
//   as validation fails); here `getFieldErrorsForDisplay` aligns visible errors with
//   `replacement_components/TextField.js` (touch / initial-error rules). Because PID inputs
//   are not plain Formik Field scalars, this fork sets `form.touched[fieldPath]` on
//   unmanaged-input blur (`UnmanagedIdentifierCmp`) and when managed/unmanaged or optional
//   DOI radios change (`RequiredPIDField` / `OptionalPIDField`); see Sphinx
//   docs/source/replacement_field_components.md § “Formik touched and this fork”.
//   Leaf widgets that are unchanged are deep-imported from `@js/invenio_rdm_records/...`;
//   deposit API/state imports use `@js` because relative paths from upstream
//   (`../../../../api/...`) do not resolve from this package. Eliminating this fork would
//   require upstream to expose a pluggable error-visibility strategy (or the same helper)
//   on PIDField / helpers, plus equivalent touched wiring for radios and unmanaged input.
//
// CreatibutorsField.js + creatibutor_components/CreatibutorsModal.js
//   Local modal fork: `onModalClose` in `closeModal()` so the parent can `setFieldTouched`
//   when the modal closes (any path). CreatibutorsFieldItem/type/utils still from `@js`.
//   Upstream could add an optional `onModalClose` (or equivalent) on stock modal to avoid
//   forking the modal file.
//
// Any new non–import-only divergence must be summarized in this header and in
// docs/source/replacement_field_components.md.
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
