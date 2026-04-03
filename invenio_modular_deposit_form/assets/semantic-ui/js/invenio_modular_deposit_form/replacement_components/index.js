export * from "./alternate_components";
export * from "./field_components";
export * from "./PublishButton";
// Top-level custom-field widget shims/adapters (stock ui_widget names):
// - Input -> local TextField; passes `description` + `helpText` separately (above / below).
export * from "./Input";
// Top-level core replacement widgets:
// - SelectField / Dropdown / AutocompleteDropdown / TextField / TextArea
// - RemoteSelectField / MultiInput
// SelectField (vs stock react-invenio-forms):
// - Gates visible `form.errors` on `form.touched`; merges `classnames` into `className`.
// - On blur: `handleBlur(e)` then `setFieldTouched(fieldPath)` (Dropdown blur target fix),
//   then optional `onBlur(e, { formikProps })` so callers extend blur without dropping touch.
// RemoteSelectField (vs stock):
// - `ui.<fieldPath>` label cache on add/change for `initialSuggestions` rehydration.
// - Optional `commitSearchOnBlur`, `hideAdditionMenuItem` (semantic-ui-react Dropdown additions),
//   `focusFieldPathAfterSelect` (see file header).
// - Search string ref + debounce cancel on unmount.
// Dropdown / AutocompleteDropdown: pass `description` + `helpText` through to SelectField /
// RemoteSelectField (above / below), not merged like stock.
// Published departures: docs/source/replacement_field_components.md (Sphinx docs in this tree).
export * from "./SelectField";
export * from "./Dropdown";
export * from "./AutocompleteDropdown";
export * from "./TextField";
export * from "./TextArea";
export * from "./RemoteSelectField";
export { default as MultiInput } from "./MultiInput";
