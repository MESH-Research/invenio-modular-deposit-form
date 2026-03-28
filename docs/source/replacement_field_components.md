# Replacement field components

This page lists the modules **re-exported** from `replacement_components/field_components/index.js`. Each is a **local** copy or fork of a field component that exists in **`invenio_rdm_records`** (or closely related packages), maintained so the modular deposit form can use **shared widgets** (`TextField`, `RemoteSelectField`, …) and **consistent error visibility** (notably “touched” rules) without patching `node_modules`.

For how these plug into layout/registry, see [Built-in field widget components](field_components.md).

```{warning}
Draft sections may evolve as upstream InvenioRDM changes. When in doubt, read the file header in each source module.
```

## Top-level widget shims

In addition to `field_components/*`, the top-level `replacement_components/index.js` exports shim/adapter widgets for stock custom-field `ui_widget` names:

- `Input` -> stock-like adapter over local `TextField`

These are used by the custom-field widget loader fallback (`@js/invenio_modular_deposit_form`) so stock widget names can resolve to touched-aware local replacements without changing backend `ui_widget` names.

The same top-level barrel also exports core replacement widgets directly:

- `SelectField`
- `Dropdown` (stock-like adapter over local `SelectField`)
- `AutocompleteDropdown` (stock-like adapter over local `RemoteSelectField`)
- `TextField`
- `TextArea`
- `RemoteSelectField`
- `MultiInput`

For `Input`, `Dropdown`, and `AutocompleteDropdown`, the local replacements intentionally mirror stock prop mapping/defaults while delegating rendering to local replacement fields (`TextField`, `SelectField`, `RemoteSelectField`). `Dropdown` and `AutocompleteDropdown` also pass through additional props to their underlying replacement field component.

### `SelectField` and Formik `touched`

Stock `react-invenio-forms` `SelectField` wires `onBlur={handleBlur}` on `Form.Dropdown`. Formik’s `handleBlur` decides which field to mark touched from **`event.target.name`** or **`event.target.id`**. For a **search** dropdown, the element that blurs is often **not** labeled with the Formik path, so touch can fail for the real `fieldPath`. The local replacement keeps stock-style **`handleBlur(e)`** and also calls **`form.setFieldTouched(fieldPath, true, false)`** on blur so touched-aware error gating (see file header) works. It also gates visible messages from **`form.errors`** on **`form.touched`** while leaving the stock **`error` prop** and **initial-value / `initialErrors`** branch unchanged.

**`RemoteSelectField`** passes **`searchInput={{ id: fieldPath, … }}`**, which can make **`handleBlur`’s `id` fallback** succeed on the inner search input; it still passes **`onBlur`** in spread-after-default order, which **replaces** the default dropdown `onBlur` on the root—if remote fields must match local touch behavior, the remote **`onBlur`** should chain **`handleBlur`** / **`setFieldTouched`** (or equivalent) as needed.

In addition, local `RemoteSelectField` now synchronizes selected suggestions to `formik.values.ui.<fieldPath>` on add/change. This keeps the UI label cache aligned with selected IDs so `initialSuggestions` can rehydrate readable labels after remount/recovery without changing the canonical submitted value shape.

## `FieldComponentWrapper` and `labelIcon`

Built-in section components wrap their default field widget in **`FieldComponentWrapper`**, which merges layout config (`label_modifications`, **`icon_modifications`** in deposit config, etc.) and passes props to the inner widget via `React.cloneElement`. The wrapper passes the field label icon as **`labelIcon`** (aligned with `invenio_rdm_records` field components such as `AccessRightField`). Legacy props **`icon`** on the wrapper or on merged custom-field props are still folded into the computed `labelIcon` so existing `custom_fields.ui` / YAML using `icon` continues to work. Replacement **`TextField`**, **`TextArea`**, and **`MultiInput`** take **`labelIcon` only** for that label icon (adapters such as **`Input`** / **`Dropdown`** may still accept stock **`icon`** and map it to `FieldLabel`).

## Enumeration (matches `field_components/index.js`)

The barrel file path is:

`invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/replacement_components/field_components/index.js`

| Export | Typical upstream analogue | Role of this replacement |
|--------|---------------------------|---------------------------|
| `AdditionalDescriptionsField` | `AdditionalDescriptionsField` in `invenio_rdm_records` | Stock copy; swaps in local replacement widgets (`TextField` / related) where the stock file used default form controls. |
| `AdditionalTitlesField` | `AdditionalTitlesField` | Same pattern: additional titles UI with local widgets. |
| `CopyrightsField` | `CopyrightsField` | Stock copy; uses `replacement_components/TextField.js` for the copyright string field. |
| `CreatibutorsField` | `CreatibutorsField` | Fork: uses a **local** `CreatibutorsModal` so `onModalClose` runs whenever the modal closes (cancel/close/save), allowing `setFieldTouched`; item/type/utils still imported from `@js/invenio_rdm_records`. |
| `DatesField` | `deposit/fields/DatesField/DatesField` | Fork: same layout and `InvenioRdmRecords.DatesField.*` Overridable ids as stock; local `TextField` / `SelectField`; `emptyDate` from `@js/.../DatesField/initialValues`; `sortOptions` from `@js/.../deposit/utils`. |
| `DescriptionsField` | `DescriptionsField` | Stock copy; uses local rich/text widgets where configured. |
| `IdentifiersField` | `deposit/fields/Identifiers/IdentifiersField` | Fork: row wrapper is bare `<GroupField>` like stock; local `TextField` / `SelectField`; `emptyIdentifier` from `@js/.../Identifiers/initialValues`. |
| `LanguagesField` | `LanguagesField` | Stock copy; uses local `RemoteSelectField` from this package instead of the stock select import. |
| `PIDField` | `deposit/fields/Identifiers/PIDField` | **Larger fork** (see below): touched-aware errors via `pid_components/fieldErrorsForDisplay.js`, local identifier components, `@js` deep imports for paths that do not resolve from this repo. |
| `PublisherField` | `PublisherField` | Stock copy; local replacement widgets. |
| `RelatedWorksField` | `deposit/fields/RelatedWorksField/RelatedWorksField` | Fork: same layout as stock; local `TextField` / `SelectField`; row `ResourceTypeField` from this folder (replacement `SelectField`); `emptyRelatedWork` from `@js/.../RelatedWorksField/initialValues`. |
| `ResourceTypeField` | `ResourceTypeField` | Stock copy; may use local vocabulary/select widgets. |
| `TitlesField` | `TitlesField` | Stock copy; `TextField` + `AdditionalTitlesField` from replacements. |
| `VersionField` | `VersionField` | Stock copy; local widgets. |

## `PIDField` (detailed)

Upstream layout (for comparison):

`invenio_rdm_records/.../src/deposit/fields/Identifiers/PIDField/`

Local layout:

- **`index.js`**, **`PIDFieldCmp.js`**, **`RequiredPIDField.js`**, **`OptionalPIDField.js`** at the folder root (same roles as upstream).
- **`pid_components/`** — not a full mirror of upstream `components/*`. It holds:
  - **`fieldErrorsForDisplay.js`** — adds `getFieldErrorsForDisplay` (aligned with `replacement_components/TextField.js`); stock only has `getFieldErrors`. **`pickDisplayableError`** merges nested Yup messages (e.g. `errors.pids.doi.identifier`) so the FastField bound to `pids.doi` still receives a single string for SUI `error=`.
  - **`UnmanagedIdentifierCmp.js`**, **`ManagedIdentifierCmp.js`** — identifier UIs with the new error helper and, for managed, `@js` imports for deposit API/state/buttons.

The deposit form imports `PIDField` from this tree (e.g. `DoiComponent` in `field_components.jsx`) so DOI/PID errors do not appear before touch in a way that disagrees with other fields.

(formik-touched-pidfield)=
### Formik `touched` and this fork

`getFieldErrorsForDisplay` shows validation errors when **`form.touched[fieldPath]`** is truthy (among other branches). Stock PID inputs are not plain Formik `<Field>` scalars, so **nothing** was marking the PID path touched. This fork wires **`touched`** explicitly (we use **`form.setFieldTouched(fieldPath)`** on unmanaged blur, not raw **`field.onBlur(e)`**: Formik’s blur handler uses **`e.target.name`**, which Semantic UI **`Form.Input`** often omits, so touch would incorrectly apply to **`undefined`**).

| Interaction | Where |
|-------------|--------|
| **Mount**, empty identifier, per **`doiDefaultSelection`** (`default_selected`) | **`RequiredPIDField.js` only** — seed `{ provider: "external", identifier: "" }` for `"yes"`, or `{}` for `"no"` when clearing a non-empty stale value. **`OptionalPIDField`** does not seed (optional DOI must not validate an empty field). |
| User blurs the **unmanaged** identifier text input | `pid_components/UnmanagedIdentifierCmp.js` — `onBlur` calls `form.setFieldTouched(fieldPath, true, true)` (touch + run validation; radios rely on `setFieldValue` + `validateOnChange`). `Form.Input` gets `name={field.name \|\| fieldPath}`. |
| User changes the **managed / unmanaged** radios (`ManagedUnmanagedSwitch`) | `RequiredPIDField.js` — `setFieldTouched(fieldPath, false, false)` (mark untouched; do not validate on that call). |
| User changes **optional DOI** radios (`OptionalDOIoptions`) | `OptionalPIDField.js` — same `false`, `false` on radio. |

Blur/input paths set `touched` so `getFieldErrorsForDisplay` can show errors after the user interacts. Radio toggles set **`touched` to `false`** and **`shouldValidate`** to **`false`** on that `setFieldTouched` call, so switching branches does not immediately validate or show errors for an empty PID.

(formik-pid-initial-provider)=
### Initial `pids.<scheme>` shape vs `default_selected`

Deposit config exposes per-scheme UI default as **`default_selected`** (`"yes"` / `"no"` / `"not_needed"` for optional DOI), passed to `PIDField` as **`doiDefaultSelection`**. The UI derives managed vs unmanaged from that plus the current identifier, but until the user types or toggles radios, Formik may still hold `{}` or a value **without** `provider: "external"` on the unmanaged branch.

**`RequiredPIDField`** runs **`componentDidMount`**: if the identifier is empty, **`doiDefaultSelection === "yes"`** sets **`{ provider: "external", identifier: "" }`** when `provider` is missing or not `"external"`; **`doiDefaultSelection === "no"`** sets **`{}`** if the value object still has keys (clear stale shape). **`OptionalPIDField`** does **not** do this: seeding external would make Yup treat the field as an external DOI branch and can flag an empty identifier even when optional DOI should not require one. **`not_needed`** is unchanged (no external seed from this block). This keeps required-PID Yup and the unmanaged input aligned with the visible default without relying on backend-only defaults.

**`OptionalPIDField`** also avoids setting **`provider: "external"`** when the user switches radios to the unmanaged branch: it clears **`pids`** (same as managed / not-needed), and **`provider: "external"`** is written only when the user types in the unmanaged identifier input (`onExternalIdentifierChanged`).

## Upstream changes that could remove these replacements

This section describes **what would need to exist in stock `invenio_rdm_records` (and sometimes `react-invenio-forms`)** so this package could **import field components only from `@js/invenio_rdm_records`** and delete the corresponding files under `replacement_components/field_components/`. It is **not** a commitment to upstream work; it is a design checklist.

### Shared / cross-cutting

1. **Pluggable text/select/inputs**  
   If upstream field components accepted **render props** or **injected component types** for “text input”, “select”, and “remote select” (instead of hard-coding `react-invenio-forms` / Semantic defaults), instances could pass **`TextField`** / **`RemoteSelectField`** from this package **without** copying whole field files.

2. **Error visibility**  
   If upstream standardized on Formik **`meta`** (or a small helper like `fieldErrorsForDisplay`) **everywhere**, including **PID** and **creators/contributors**, with the same “touched / initialError” policy as the rest of the form, the modular package would not need forks **only** to match `TextField` behavior.

### `PIDField` specifically

1. **`getFieldErrorsForDisplay` (or equivalent) in upstream**  
   Extend `PIDField/components/helpers.js` (or export a sibling) with a function that gates **visible** errors the same way as other fields, or add a **`showErrorWhen`** prop on `PIDField` / identifier components.

2. **Consistent `touched` for non-`Field` controls**  
   If upstream ensured **`touched`** for `pids.<scheme>` when users blur the unmanaged input or change managed/unmanaged (and optional-DOI) radios—e.g. by using Formik `Field`/`useField` for those controls or by documenting `setFieldTouched` in the stock handlers—apps would not need a local fork **only** for touch parity.

3. **Resolvable imports from consuming apps**  
   Export PID subcomponents (e.g. `UnmanagedIdentifierCmp`) from the **`@js/invenio_rdm_records`** public API so apps do not need relative paths; and/or export **deposit context** and **action types** from stable entry points (already partly true via deep paths).

4. **Optional composition**  
   Allow passing **custom** `ManagedIdentifierCmp` / `UnmanagedIdentifierCmp` as props so a host app can inject behavior without replacing the whole tree.

### `CreatibutorsField` / modal

1. **Lifecycle hooks on stock `CreatibutorsModal`**  
   An optional **`onModalClose`** (or `onDismiss`) callback invoked for **every** close path would let the parent call `setFieldTouched` without forking the modal.

### `CreatibutorsField`-level error display

If upstream **`CreatibutorsField`** (or `FeedbackLabel` usage) respected the same touched rules as `TextField`, the local field-level wrapper for “general creatibutors error” might be unnecessary.

### “Simple” widget-swap fields (`TitlesField`, `CopyrightsField`, `DatesField`, `IdentifiersField`, `RelatedWorksField`, …)

If **`TextField`** / **`SelectField`** (or equivalent) were **injected** per field via **theme** or **props** on stock `TitlesField`, `CopyrightsField`, `DatesField`, `IdentifiersField`, `RelatedWorksField`, etc., the **only** change in a downstream app would be configuration—**no** file copy. Today those replacements exist because stock files **import** specific components directly.

### Operational note

Even if upstream implements the above, **version alignment** matters: this package pins a specific `invenio-rdm-records` release. Removals here should be **one field at a time** behind a compatibility check.
