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

For `Input`, `Dropdown`, and `AutocompleteDropdown`, the local replacements delegate to `TextField`, `SelectField`, and `RemoteSelectField`. They pass **`description`** and **`helpText`** as **separate** props: optional copy **above** the control (`description`) and **below** (`helpText`), matching replacement `TextField`, `TextArea`, `MultiInput`, and `SelectField`. This differs from stock `react-invenio-forms`, which typically uses `helpText ?? description` as a single string below the field. PID fields and `ResourceTypeSelectorField` are exceptions with their own helptext behavior.

### `SelectField` and Formik `touched`

Stock `react-invenio-forms` `SelectField` wires `onBlur={handleBlur}` on `Form.Dropdown`. Formik’s `handleBlur` decides which field to mark touched from **`event.target.name`** or **`event.target.id`**. For a **search** dropdown, the element that blurs is often **not** labeled with the Formik path, so touch can fail for the real `fieldPath`. The local replacement keeps stock-style **`handleBlur(e)`** and also calls **`form.setFieldTouched(fieldPath, true, false)`** on blur so touched-aware error gating (see file header) works. It also gates visible messages from **`form.errors`** on **`form.touched`** while leaving the stock **`error` prop** and **initial-value / `initialErrors`** branch unchanged.

**Chained `onBlur` (departure from stock spread order):** if the field receives an **`onBlur`** prop (e.g. from `RemoteSelectField`), the local implementation **does not** rely on spreading that prop onto `Form.Dropdown` last (which would **replace** the default blur handler and **drop** `setFieldTouched`). Instead it destructures **`onBlur`** from incoming props and invokes **`onBlurFromProps(e, { formikProps })` only after** `handleBlur` and **`setFieldTouched`**. Callers therefore extend blur behavior without re-implementing touch parity.

### `RemoteSelectField` (departures from stock)

Upstream: `react-invenio-forms` `RemoteSelectField` (often consumed via `invenio_rdm_records` deposit). Local module: `replacement_components/RemoteSelectField.js`.

| Topic | Stock (typical) | Local replacement |
|--------|-----------------|-------------------|
| `SelectField` import | Package `SelectField` | Local `SelectField` (touched + chained blur above) |
| **`ui.<fieldPath>`** | Not written | On add/change, maps selected options to **`{ id, title_l10n }`** so **`initialSuggestions`** / label display can recover after remount without changing the canonical value shape |
| **Search text vs debounce** | Debounced search only | **`latestSearchStringRef`** updated on **every** search input change **before** debounce, for accurate blur-time reads |
| **Unmount** | Request cancel only | Also **`runDebouncedSearch.cancel()`** |
| **`commitSearchOnBlur`** | N/A | **Opt-in** (default `false`). When `true` and single value (not `multiple`), blur commits **trimmed** search text like a free-text choice (`onValueChange` + **`ui.*`**). Does **not** require semantic-ui-react **`allowAdditions`**. |
| **`hideAdditionMenuItem`** | N/A | **Opt-in** (default `false`). Sets **`allowAdditions={false}`** on **`Form.Dropdown`**. semantic-ui-react **`getMenuOptions`** injects the synthetic “Add …” row only when **`allowAdditions`** is true; there is no separate prop to hide that row while leaving additions on. Use with **`commitSearchOnBlur`** (or list-only values) when free text must still apply. |
| **`focusFieldPathAfterSelect`** | N/A | **Opt-in** `string` (expected DOM **`id`** / name path used by `TextField`). After **`onChange`** (list pick, including click) or **`onAddItem`** (when **`allowAdditions`** is true), focuses that element on the next tick; **not** used after blur-only commit |

**`RemoteSelectField`** passes **`searchInput={{ id: fieldPath, … }}`**, which can still help **`handleBlur`’s `id`** fallback on the inner search input.

**Creators flat UI:** `alternate_components/creatibutor_components/CreatibutorsFormBody.js` enables **`hideAdditionMenuItem`**, **`commitSearchOnBlur`**, and **`focusFieldPathAfterSelect`** on the person **family name** names API field when the given-name column is shown (`!namesSearchOnly || personDetailsExpanded`, matching the sibling `TextField`). Other uses (e.g. `AutocompleteDropdown`) keep defaults unless they opt in.

**Internal design notes** (not built by Sphinx as a manual page): `docs/internal/creatibutors-field-flat-person-names.md` for the flat creatibutor name UX.

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
| **Mount**, empty identifier, per **`doiDefaultSelection`** (`default_selected`) | **`RequiredPIDField.js` only** — seed `{ provider: "external", identifier: "" }` for `"yes"`, or `{}` for `"no"` when clearing a non-empty stale value **unless** `provider` is already **`"external"`** (do not wipe unmanaged). **Stock upstream has no `componentDidMount` seeding** (see below). **`OptionalPIDField`** does not seed (optional DOI must not validate an empty field). |
| User blurs the **unmanaged** identifier text input | `pid_components/UnmanagedIdentifierCmp.js` — `onBlur` calls `form.setFieldTouched(fieldPath, true, true)` (touch + run validation; radios rely on `setFieldValue` + `validateOnChange`). `Form.Input` gets `name={field.name \|\| fieldPath}`. |
| User changes the **managed / unmanaged** radios (`ManagedUnmanagedSwitch`) | `RequiredPIDField.js` — `restoreFromBackup`, `setFieldValue(ui.<fieldPath>.managed_selection, …)`, and `setFieldTouched(fieldPath, false, false)` (untouched; no validate on that call). |
| User changes **optional DOI** radios (`OptionalDOIoptions`) | `OptionalPIDField.js` — `setFieldTouched(fieldPath, false, false)` on that path, and `form.setFieldValue("ui.pids.doi.managed_selection", …)` (`managed` / `unmanaged` / `not_needed`) so the branch survives `pids` being `{}` or remount; see below. |

Blur/input paths set `touched` so `getFieldErrorsForDisplay` can show errors after the user interacts. Radio toggles set **`touched` to `false`** and **`shouldValidate`** to **`false`** on that `setFieldTouched` call, so switching branches does not immediately validate or show errors for an empty PID.

(formik-pid-initial-provider)=
### Initial `pids.<scheme>` shape vs `default_selected`

Deposit config exposes per-scheme UI default as **`default_selected`** (`"yes"` / `"no"` / `"not_needed"` for optional DOI), passed to `PIDField` as **`doiDefaultSelection`**.

#### Stock `RequiredPIDField` (upstream `invenio_rdm_records`)

- **No `componentDidMount`** — Formik is not normalized from `default_selected` on mount.
- **Constructor:** if **`record.is_draft === true`** and the field has a **non-empty** identifier and a **non-`external`** provider, local state **`isManagedSelected`** is initialized to **`true`** (managed). Otherwise it is **`undefined`**.
- **Render:** if state is **`undefined`**, managed vs unmanaged is inferred as  
  **`hasManagedIdentifier || (empty identifier && doiDefaultSelection === "no")`**.  
  So **`{ provider: "external", identifier: "" }`** with **`default_selected === "no"`** still infers **managed** after remount (local state is lost), which disagrees with Formik.
- **Errors:** **`getFieldErrors`** (no touched gating like this package).
- **Radio:** **`onManagedUnmanagedChange`** does **not** call **`setFieldTouched`** on the PID path.

#### This package’s `RequiredPIDField` (additional / changed behavior)

- **`componentDidMount`:** if the identifier is empty, **`doiDefaultSelection === "yes"`** sets **`{ provider: "external", identifier: "" }`** when `provider` is missing or not `"external"`; **`doiDefaultSelection === "no"`** sets **`{}`** only when the value still has keys **and** `provider` is **not** `"external"` (avoids clearing explicit unmanaged shape from the API or after user choice).
- **`getFieldErrorsForDisplay`** on the label row and identifier components; **`setFieldTouched(fieldPath, false, false)`** when managed/unmanaged radios change (see table above).
- **Managed / unmanaged branch:** **`values.ui.<fieldPath>`** holds **`managed_selection`** (`managed` / `unmanaged`) and **`draft_unmanaged_pid_backup`** / **`draft_managed_pid_backup`** (for DOI, **`fieldPath`** is **`pids.doi`**, so keys mirror **`OptionalPIDField`** under **`values.ui.pids.doi.*`**). **`render`** reads **`managed_selection` only** (no upstream-style **`useState`/`isManagedSelected`**). **`restoreFromBackup`** runs on radio change; unmanaged typing updates the unmanaged backup (debounced); while the managed branch is selected, **`componentDidUpdate`** refreshes **`draft_managed_pid_backup`** when **`pids.<scheme>`**’s Formik value **reference** changes (reserve/discard).
- **`doiDefaultSelection` PropTypes** use **`string`** (stock incorrectly types it as **`object`**).
- **`ManagedUnmanagedSwitch` `disabled`:** same split as stock — **`hasDoi`** from **`record.pids?.doi?.identifier`** (“backend already has this PID”), **`isDoiCreated`** from the draft **`field.value.identifier`** (user-visible / Formik value).

#### This package’s `OptionalPIDField` (additional / changed behavior)

**`OptionalPIDField`** does **not** mount-seed. **`values.ui.pids.doi.managed_selection`** holds the optional-DOI radio choice (**`managed`** / **`unmanaged`** / **`not_needed`**). When set, `computeManagedUnmanaged` uses it instead of inferring only from PID shape and **`doiDefaultSelection`**—so clearing **`pids`** or remounting the field does not incorrectly revert the UI branch (e.g. empty **`pids`** plus **`default_selected "no"`** inferring managed while the user had chosen unmanaged). When **`managed_selection` is unset**, behaviour matches the prior heuristic derivation (same inputs as stock-style logic: identifiers, provider, draft, parent/record DOI, **`not_needed`** default). Seeding external on mount would make Yup treat the field as an external DOI branch and can flag an empty identifier when optional DOI should not require one. The unmanaged radio avoids **`provider: "external"`** until input: it clears **`pids`** (same as managed / not-needed), and **`provider: "external"`** is written only when the user types in the unmanaged identifier input (`onExternalIdentifierChanged`). Under normal **`PIDField`** wiring, **`OptionalPIDField`** mounts only with **`required === false`**; the **`!required`** guard on the managed branch’s Redux / **`managed_selection`** updates is for hypothetical direct reuse and does not change that path today.

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
