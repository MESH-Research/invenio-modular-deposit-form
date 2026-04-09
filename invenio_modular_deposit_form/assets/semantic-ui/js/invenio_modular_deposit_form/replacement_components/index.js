export * from "./alternate_components";
export * from "./field_components";

// Forks vs stock react-invenio-forms (and related Invenio JS). Each module’s file header is the
// full changelog; this file is the barrel + a **short** index. Longer narrative:
// docs/source/replacement_field_components.md
//
// ArrayField — optional `onAfterAdd` / `onAfterRemove` (after Formik push / wrapped `remove`);
// `FieldLabel` from `react-invenio-forms` (fork lives outside the package). See ArrayField.js.
//
// AutocompleteDropdown — local `FieldLabel`; renders replacement `RemoteSelectField`; `description` /
// `helpText` passed through separately (stock merges). See AutocompleteDropdown.js.
//
// Dropdown — local `FieldLabel`; renders replacement `SelectField`; `description` / `helpText`
// passed through separately (stock merges into one `helpText`). See Dropdown.js.
//
// Input — stock `ui_widget` name for plain text input: local `FieldLabel`; delegates to replacement
// `TextField`; passes `description` and `helpText` separately (above / below). Stock merges
// `helpText ?? description` into one `helpText` on the underlying field. See Input.js.
//
// MultiInput — tag-style values via `SelectField` (`multiple`, `allowAdditions`); renders
// `description` / `helpText` around it (passes empty `description` / `helpText` into `SelectField`).
// Default export re-exported as named `MultiInput` below.
//
// RemoteSelectField — builds on replacement `SelectField`; `ui.<fieldPath>` sync, search ref +
// debounced fetch + cancel, optional blur commit / focus-after-select, etc. See RemoteSelectField.js.
//
// SelectField — `classnames` merged into `className` on `Form.Dropdown`; shared helpers imported from
// the `react-invenio-forms` package root (no `utils` subpath). **When errors show:** `error` prop if
// set, else `errors[fieldPath]` if `touched[fieldPath]`, else `initialErrors[fieldPath]` if value
// still equals the initial value. **Blur:** `handleBlur` then `setFieldTouched(fieldPath)` (dropdown
// blur target fix), then optional `onBlurFromProps`. Optional `description` / `helpText` slots.
// See SelectField.jsx.
//
// TextArea — **same when-to-show rule** as TextField for `Form.Field`’s `error` flag; also renders
// `ErrorLabel` when that rule is true. `optimized` switches FastField vs Field.
//
// TextField — `description` / `helpText` placement (see TextField.js header). **When `Form.Field` /
// `Form.Input` show error:** `(meta.error && meta.touched) || error prop || (value still initial &&
// meta.initialError)`. Always uses Formik `Field` here (`optimized`/FastField left as FIXME in file).
export * from "./ArrayField";
export * from "./AutocompleteDropdown";
export * from "./Dropdown";
export * from "./Input";
export { default as MultiInput } from "./MultiInput";
export * from "./RemoteSelectField";
export * from "./SelectField";
export * from "./TextArea";
export * from "./TextField";
