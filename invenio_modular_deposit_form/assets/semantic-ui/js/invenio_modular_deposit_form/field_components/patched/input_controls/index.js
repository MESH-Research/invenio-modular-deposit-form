// Patched react-invenio-forms input components for the modular deposit form.
// Each module's file header is the changelog against stock. Longer narrative:
// docs/source/replacement_field_components.md
//
// The patches share a few reasons:
// - Show validation errors only after the field is touched (plus an explicit `error`
//   prop, and initial errors while the value is still the initial value).
// - Keep `description` (above the control) and `helpText` (below) as separate slots.
//   Stock usually collapses `helpText ?? description` into one string below the field.
// - Layout hooks: `classnames`, width, and a plain control inside `Form.Field` so
//   Semantic UI does not nest an extra `.field`.
// - Focus, blur, and label wiring so `htmlFor`, aria descriptions, and Formik
//   `touched` still work for plain inputs and search dropdowns.
//
export * from "./ArrayField";
export * from "./AutocompleteDropdown";
export * from "./Dropdown";
export * from "./Input";
export { default as MultiInput } from "./MultiInput";
export * from "./RemoteSelectField";
export * from "./SelectField";
export * from "./TextArea";
export * from "./TextField";
