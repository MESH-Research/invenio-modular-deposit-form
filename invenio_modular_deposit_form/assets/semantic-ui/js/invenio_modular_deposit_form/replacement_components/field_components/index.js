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
//   are not plain Formik Field scalars, this fork sets `touched` on unmanaged-input blur
//   (`UnmanagedIdentifierCmp`, true); radio changes use `setFieldTouched(fieldPath, false, false)`
//   (`RequiredPIDField` / `OptionalPIDField`); see Sphinx
//   docs/source/replacement_field_components.md § “Formik touched and this fork”.
//   **Initial `provider` (required PID only):** `RequiredPIDField` on mount, if there is no
//   identifier yet, seeds `pids.<scheme>` from `doiDefaultSelection` (`default_selected`).
//   `OptionalPIDField` does not seed (optional DOI must not validate empty); its unmanaged
//   radio clears `pids` without `provider: "external"` (external only on input). Sphinx:
//   replacement_field_components.md (PIDField).
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
// IdentifiersField.js
//   Fork of upstream `deposit/fields/Identifiers/IdentifiersField.js`. Row wrapper is bare
//   `<GroupField>` like stock (baseline — no `fieldPath` / `optimized` on the group). Other
//   divergences: local `TextField` / `SelectField` from `replacement_components/`; `emptyIdentifier`
//   from `@js/invenio_rdm_records/.../Identifiers/initialValues`. Layout/markup otherwise matches
//   upstream. `labelIcon` is supplied by `FieldComponentWrapper` like stock.
//
// DatesField.js
//   Fork of upstream `deposit/fields/DatesField/DatesField.js`. Local `TextField` / `SelectField`;
//   `emptyDate` from `@js/.../DatesField/initialValues`. Overridable ids unchanged.
//
// RelatedWorksField.js
//   Fork of upstream `deposit/fields/RelatedWorksField/RelatedWorksField.js`. Local `TextField` /
//   `SelectField`; row `ResourceTypeField` from this folder; `emptyRelatedWork` from `@js/...`.
//
// Any new non–import-only divergence must be summarized in this header and in
// docs/source/replacement_field_components.md.
export { AdditionalDescriptionsField } from "./AdditionalDescriptionsField";
export { AdditionalTitlesField } from "./AdditionalTitlesField";
export { CopyrightsField } from "./CopyrightsField";
export { CreatibutorsField } from "./CreatibutorsField";
export { DatesField } from "./DatesField";
export { DescriptionsField } from "./DescriptionsField";
export { IdentifiersField } from "./IdentifiersField";
export { LanguagesField } from "./LanguagesField";
export { PIDField } from "./PIDField";
export { PublisherField } from "./PublisherField";
export { RelatedWorksField } from "./RelatedWorksField";
export { ResourceTypeField } from "./ResourceTypeField";
export { TitlesField } from "./TitlesField";
export { VersionField } from "./VersionField";
