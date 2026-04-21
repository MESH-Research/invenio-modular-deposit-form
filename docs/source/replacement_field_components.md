# Replacement field components

This page covers the field components re-exported from
`replacement_components/field_components/index.js` — local copies and forks of
field components that exist in **`invenio_rdm_records`** (and a few in
`react-invenio-forms`). They ship in this package so the modular deposit form
can use **shared widgets** and **consistent UX** without patching
`node_modules`.

For how these plug into layout and the components registry, see
[Built-in field widget components](field_components.md).

## Why these replacements exist

A small number of cross-cutting issues account for almost every replacement on
this page. Knowing them up front makes the catalog below much easier to read:

1. **Touched-aware error visibility.** Upstream field components don't all gate
   visible errors on Formik's `touched` flag the same way `TextField` does.
   The replacements use a shared `getFieldErrorsForDisplay` helper and
   explicitly mark `touched` on controls that aren't plain Formik `<Field>`s
   (PID radios and the unmanaged identifier input, search dropdowns, the
   creators/contributors modal). The result: validation errors only appear
   after a user has interacted with the field, consistently across the form.

2. **Help text above and below the widget.** `react-invenio-forms` typically
   collapses `helpText ?? description` into a single string rendered below the
   field. The replacements treat **`description`** (above the control) and
   **`helpText`** (below) as separate slots, matching the convention used by
   the rest of this package's section components.

3. **Keyboard / focus a11y.** Search dropdowns can drop focus into a hard-to-
   recover state after selection; modal lifecycle and ID/name plumbing on
   non-`<Field>` controls also affect screen-reader and keyboard behavior.
   The replacements add small, opt-in fixes (e.g. `focusFieldPathAfterSelect`
   on `RemoteSelectField`) and keep blur/touched wiring sensible. Inline
   reorder buttons for the flat creator/contributor list live with that
   component — see [Alternate components](field_components.md#alternate-components).

4. **Layout and registry hooks.** Layout config (`label_modifications`,
   `icon_modifications`, etc.) needs a consistent path from
   `FieldComponentWrapper` into the inner widget. The replacements accept
   **`labelIcon`** (aligned with `invenio_rdm_records`) and forward props
   predictably.

Most of the "stock copy" entries in [The replacement field components](#the-replacement-field-components)
below exist *only* so they can `import` this package's `TextField` /
`SelectField` / `RemoteSelectField` instead of the upstream defaults. They
aren't doing anything novel themselves — they're conduits for the changes
above.

```{warning}
Draft sections may evolve as upstream InvenioRDM changes. When in doubt, read
the file header in each source module.
```

## Top-level replacement widgets

`replacement_components/index.js` re-exports the core widgets and a small set
of stock-name adapters:

- **Core widgets:** `TextField`, `TextArea`, `SelectField`, `RemoteSelectField`,
  `MultiInput`.
- **Stock-name adapters:** `Input`, `Dropdown`, `AutocompleteDropdown`. These
  are thin wrappers that delegate to `TextField`, `SelectField`, and
  `RemoteSelectField`, respectively. They exist so backend custom-field
  `ui_widget` names (`Input`, `Dropdown`, `AutocompleteDropdown`) resolve to
  the touched-aware local widgets without you having to change those names in
  YAML or in `RDM_CUSTOM_FIELDS_UI`.

All of these expose **`description`** (rendered above the control) and
**`helpText`** (rendered below) as separate props. Two known exceptions keep
their own helptext behavior: `PIDField` and `ResourceTypeSelectorField`.

### `SelectField` and `RemoteSelectField` — notes worth knowing

A few behaviors are worth knowing if you wrap or extend these widgets:

- **`SelectField` marks touched on blur.** Formik's `handleBlur` decides what
  to mark from `event.target.name` / `id`, and a search dropdown's blur event
  often doesn't carry the Formik path. The local `SelectField` calls
  `form.setFieldTouched(fieldPath, true, false)` on blur in addition to
  `handleBlur`, so the touched-aware error gating works.

- **`SelectField` chains a caller-provided `onBlur`.** If you pass an `onBlur`
  prop (e.g. from `RemoteSelectField`), it runs **after** `handleBlur` and
  `setFieldTouched`. You can extend blur behavior without accidentally
  dropping touched-marking.

- **`RemoteSelectField` opt-in props.** All default to `false` / unset:

  - `commitSearchOnBlur` — for single-value fields, blur commits trimmed
    search text as a free-text choice. Doesn't require Semantic UI's
    `allowAdditions`.
  - `hideAdditionMenuItem` — sets `allowAdditions={false}` on the
    `Form.Dropdown`, hiding Semantic UI's synthetic "Add …" row. Pair with
    `commitSearchOnBlur` (or list-only values) when free text must still apply.
  - `focusFieldPathAfterSelect` — DOM `id` (or name path) to focus after a
    selection. Used by the flat creators UI to jump from family-name to
    given-name after picking a person.

- **Label survives remount.** `RemoteSelectField` writes
  `ui.<fieldPath> = { id, title_l10n }` for the selected value(s) so the
  visible label can be recovered from `initialSuggestions` after remount,
  without changing the canonical value shape.

## `FieldComponentWrapper` and `labelIcon`

Built-in section components wrap their inner widget in
**`FieldComponentWrapper`**, which merges layout config (`label_modifications`,
`icon_modifications`, etc.) and forwards props to the inner widget via
`React.cloneElement`.

The wrapper passes the field's label icon as **`labelIcon`** (matching
`invenio_rdm_records` field components such as `AccessRightField`). Legacy
`icon` props on the wrapper or merged into custom-field props are still folded
into the computed `labelIcon`, so existing `custom_fields.ui` / YAML using
`icon` continues to work.

Replacement **`TextField`**, **`TextArea`**, and **`MultiInput`** accept
**`labelIcon` only** for that label icon. The stock-name adapters **`Input`**
and **`Dropdown`** may still accept stock **`icon`** and map it to
`FieldLabel`.

## The replacement field components

The barrel is at:

`invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/replacement_components/field_components/index.js`

### Stock copies that only swap in the local input widgets

The following are mostly thin copies of the upstream field whose only
meaningful change is to `import` this package's `TextField` / `SelectField` /
`RemoteSelectField` (and a few helpers like `emptyDate` / `emptyIdentifier`)
so the touched-aware widgets and dual help text apply throughout:

- `AdditionalDescriptionsField`
- `AdditionalTitlesField`
- `CopyrightsField`
- `DatesField`
- `DescriptionsField`
- `IdentifiersField`
- `LanguagesField` (uses local `RemoteSelectField` instead of the stock select)
- `PublisherField`
- `RelatedWorksField` (row `ResourceTypeField` from this folder, replacement
  `SelectField`)
- `ResourceTypeField`
- `TitlesField`
- `VersionField`

If you customize layouts, you'd typically reach for these via the components
registry — see [Built-in field widget components](field_components.md).

### Forks with substantive behavior changes

- **`CreatibutorsField`** — uses a local `CreatibutorsModal` so an
  `onModalClose` callback runs whenever the modal closes (cancel, dismiss,
  save). That's how the parent gets a chance to `setFieldTouched`, so any
  existing errors become visible after editing. Item, type, and util
  components are still imported from `@js/invenio_rdm_records`.

  For an inline (non-modal) alternative with extra a11y affordances (Up/Down
  reorder buttons, "Add myself", focus management), see the flat creator UI
  in [Alternate components](field_components.md#alternate-components).

- **`PIDField`** — the largest fork; see below.

## `PIDField` (touched and DOI selection)

The replacement `PIDField` exists for two reasons.

**Touched-aware errors.** Stock `PIDField` doesn't wrap the identifier input
or the managed/unmanaged radios in plain Formik `<Field>` controls, so nothing
was ever marking the PID path "touched". Without that, `pids.<scheme>` errors
could appear before the user interacted with the field — out of step with
every other field in the form. The replacement marks `touched` explicitly at
three interaction points:

- **Blur of the unmanaged identifier input** — `setFieldTouched(fieldPath, true, true)`
  (touch + run validation).
- **Toggle of the managed/unmanaged radios** — `setFieldTouched(fieldPath, false, false)`
  (untouched, no validation on that call) so switching branches doesn't
  immediately validate or show errors for an empty PID. Validation re-engages
  when the user actually edits the new branch.
- **Toggle of the optional-DOI radios** (`managed` / `unmanaged` / `not_needed`) —
  same pattern: `setFieldTouched(fieldPath, false, false)`, plus a write to
  `values.ui.pids.doi.managed_selection` so the choice survives a remount or a
  cleared `pids` object.

**Branch state survives remount.** Stock `RequiredPIDField` keeps "is the user
on the managed or unmanaged branch?" in component state (`isManagedSelected`),
which is lost on remount and can disagree with the actual Formik values. The
replacement persists the choice in `values.ui.<fieldPath>.managed_selection`
(values: `"managed"` / `"unmanaged"`) so the right radio stays selected after
remount. `OptionalPIDField` does the same with
`"managed"` / `"unmanaged"` / `"not_needed"` so optional DOI doesn't snap back
to "managed" after a remount when the user had picked something else.

```{note}
Stock `PIDField` has no `componentDidMount` seeding from `default_selected`.
The replacement adds limited mount-time seeding for **`RequiredPIDField`
only** — it sets `{ provider: "external", identifier: "" }` for `"yes"`, or
clears the value for `"no"` (only when the existing value isn't already an
explicit unmanaged shape). **`OptionalPIDField` deliberately does not seed on
mount**, so an empty optional DOI never validates as an external identifier.
```

(formik-touched-pidfield)=

### Where the touched wiring lives

If you're customizing PID behavior or debugging visible errors, the relevant
files under
`replacement_components/field_components/PIDField/` are:

- **`pid_components/fieldErrorsForDisplay.js`** — the touched-aware error
  helper used on the label row and identifier components. `pickDisplayableError`
  merges nested Yup messages (e.g. `errors.pids.doi.identifier`) so the
  FastField bound to `pids.doi` still receives a single string for SUI's
  `error=` prop.
- **`RequiredPIDField.js`** — managed/unmanaged radio handler; mount-time
  seeding (described above); `componentDidUpdate` keeps
  `draft_managed_pid_backup` in sync while the managed branch is selected.
- **`OptionalPIDField.js`** — optional-DOI radio handler; no mount-time
  seeding; the unmanaged radio avoids `provider: "external"` until the user
  actually types in the unmanaged identifier.
- **`pid_components/UnmanagedIdentifierCmp.js`** — `onBlur` calls
  `setFieldTouched(fieldPath, true, true)`. The Semantic UI `Form.Input`
  receives `name={field.name || fieldPath}` so Formik's blur handler can
  identify the path correctly even when the inner element doesn't carry it.

The deposit form imports `PIDField` from this tree (e.g. `DoiComponent` in
`field_components.jsx`), so DOI/PID errors don't appear before touch in a way
that disagrees with the rest of the form.

## Form feedback components (cross-reference)

The form-feedback UI used in this package's layouts (`FormFeedback`,
`FormFeedbackSummary`) lives under `replacement_components/alternate_components/`
rather than `replacement_components/field_components/`. See
[Form feedback (errors and action state)](field_components.md#form-feedback-errors-and-action-state)
for behavior and props.

## Internal notes

Design notes for what would need to change upstream to retire each replacement
live in `docs/internal/upstream-replacement-removal-checklist.md` (not
published as part of the manual). Notes on the flat creatibutor name UX live
in `docs/internal/creatibutors-field-flat-person-names.md`.
