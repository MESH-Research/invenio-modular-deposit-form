# Design: Person name entry in CreatibutorsFieldFlat

**Status:** Working draft for internal review. This file lives under **`docs/internal/`** and is **not** included in the published Sphinx build (`docs/source/`).

**Published departures (same package):** `SelectField` / `RemoteSelectField` differences from stock are documented in Sphinx at **`docs/source/replacement_field_components.md`** and in file headers plus `replacement_components/index.js`.

**Scope:** `CreatibutorsFieldFlat` / `CreatibutorsInlineForm` / `CreatibutorsFormBody` — **person** entries when name autocomplete is enabled. Organizations follow a separate pattern (scratch search + org name field).

---

## 1. Problem we are solving

- Users should have **one primary control for “family name”** that doubles as the **names API typeahead** (no separate “search names” field plus duplicate family field).
- Choosing a **suggestion** should **autofill** given name, identifiers, and affiliations from the API payload (same idea as the modal-based replacement form).
- Users who **do not** match the directory should still be able to use a **plain string** as family name.
- **Creators and contributors** should behave the **same** for this flow (schema-specific differences like `required` stay minimal).

---

## 2. Technical approach (component stack)

We reuse the package **`RemoteSelectField`** (`replacement_components/RemoteSelectField.js`), which wraps **`SelectField`** → Semantic UI **`Form.Dropdown`** in **search** mode.

**Why not a raw text input + custom list?**

- Keeps one code path with existing remote fetch, debounce, and Formik integration.
- Matches the “RemoteSelectField with Dropdown” direction for this feature.

**Key props / wiring**

| Concern | Choice |
|--------|--------|
| Formik path | `person_or_org.family_name` (real field, not `__namesSearch`) |
| Free-text family name | **`hideAdditionMenuItem`** on `RemoteSelectField` → semantic-ui-react **`allowAdditions={false}`** (no synthetic “Add …” row; SUIR has no finer toggle). **`commitSearchOnBlur`** commits trimmed typed text on blur; **`onPersonSearchChange`** still treats committed values **without** `extra` as plain family name. |
| Custom fill on pick | `onValueChange` → `onPersonSearchChange` in `CreatibutorsInlineForm` |
| Blur / Tab free text | `RemoteSelectField` **`commitSearchOnBlur`** (enabled on this field in `CreatibutorsFormBody`): trimmed search text is committed on blur via the same `onValueChange` path as a typed addition. Uses a ref updated on every search input change so debounced fetch does not lag behind the string. |
| Focus after list/add choice | **`focusFieldPathAfterSelect={givenNameFieldPath}`** when given name is rendered (`!search_only \|\| personDetailsExpanded`). After **`onChange`** (pick from list, including click), focus moves to that **`TextField`**. With **`hideAdditionMenuItem`**, there is no **`onAddItem`** row from the Dropdown (free text is blur commit). Not used after blur-only commit (browser Tab order applies). |

**`RemoteSelectField` defaults:** `commitSearchOnBlur`, `hideAdditionMenuItem`, and `focusFieldPathAfterSelect` are **opt-in**; other uses (e.g. `AutocompleteDropdown`) are unchanged.

**`SelectField`:** If a custom **`onBlur(e, { formikProps })`** is passed, it runs **after** Formik **`handleBlur`** and **`setFieldTouched`**, so touched state stays correct.

---

## 3. Data flow (autocomplete on)

1. User types in the Dropdown search → debounced **`GET /api/names`** (same pattern as before). The current search string is also mirrored synchronously in a ref for blur handling.
2. Hits are serialized with **`AffiliationsSuggestions`** (shared with modal flow). Options may include **`extra`** (full person-shaped payload) and/or special rows (e.g. `manual-entry`).
3. **`onPersonSearchChange`** (`CreatibutorsInlineForm`):
   - **`manual-entry`:** clear internal suggestion state on the `RemoteSelectField` ref; **`setPersonDetailsExpanded(true)`** so the rest of the person UI can appear.
   - Row with **`extra`:** **`applyPersonFromApi`** calls **`setPersonDetailsExpanded(true)`**, sets `family_name`, `given_name`, `identifiers`, `affiliations`, and syncs **`AffiliationsField`** internal state via ref (same as modal-style autofill).
   - Otherwise (user-added option, no `extra`): set **`family_name`** from `value` / `text`; **`setPersonDetailsExpanded(true)`**.

4. **Blur with non-empty search text** (no pick from list): `RemoteSelectField` commits trimmed text through **`onValueChange`** like a free-text row (when **`commitSearchOnBlur`** is on).

5. Parent Formik remains the single source of truth (no nested Formik). Package behavior still writes **`ui.<fieldPath>`** for label hydration on remount.

---

## 4. Modes: `autocompleteNames`

| Value | Person UI |
|-------|-----------|
| **`off`** | No `RemoteSelectField`. When **`personDetailsExpanded`** is true, two **`TextField`s** (family + given). |
| **`search`** | Family **`RemoteSelectField`** + given **`TextField`** in one row (given visible whenever that row is shown). Identifiers / affiliations still require **`personDetailsExpanded`**. |
| **`search_only`** | Family **`RemoteSelectField`** always in that row. **Given name** hidden until **`!search_only || personDetailsExpanded`** (i.e. hidden until expansion when in `search_only`). Identifiers / affiliations only when **`personDetailsExpanded`**. |

**Initial `personDetailsExpanded`**

- `true` if mode is **not** `search_only`, **or** the item already has a **family name** (editing existing row).
- `false` for **new** rows in **`search_only`** so the first step is “establish family name” via the remote field.

**After Save / Save and add another**

- When **`search_only`**, **`setPersonDetailsExpanded(false)`** on save (creators and contributors use the **same** rule), collapsing back to the stricter first step until the user interacts again.

---

## 5. Creators vs contributors

| Aspect | Creators | Contributors |
|--------|----------|--------------|
| Family name remote control | Same component and handler | Same |
| `required` on family remote | `true` | `false` |
| Role / other schema bits | Unchanged elsewhere | Unchanged elsewhere |

---

## 6. Extension (ReactOverridable)

**Person family remote block**

- `InvenioRDMRecords.CreatibutorsFlat.PersonFamilyNameRemoteSelectField.container`

**Plain name row (autocomplete off)**

- `InvenioRDMRecords.CreatibutorsFlat.FullNameField.container`

**Note:** Previous slots for a **separate** creator scratch search / contributor-only family remote are **removed**; instances that overrode those must migrate to **`PersonFamilyNameRemoteSelectField`**.

---

## 7. Known limitations & discussion topics

1. **Keyboard model (family name)**  
   - **Enter** confirms the highlighted list option (Semantic UI `Dropdown` with `selectOnBlur={false}`, `selectOnNavigation={false}`).  
   - **Tab** away commits **typed** search text (APG-style manual selection: typed string wins over a highlighted row), via **`commitSearchOnBlur`**.  
   - After confirming via list/Enter (or addition), **`focusFieldPathAfterSelect`** moves focus to given name when that field exists.

2. **Display value vs stored value**  
   Catalog rows may use an internal option `value` (e.g. id). Stored **`family_name`** comes from **`extra`** when present, not from the raw option `value`.

3. **Organizations**  
   Still: separate **`__orgSearch`** remote field + org name **`TextField`** — not merged into one control (by design for this iteration).

---

## 8. Code map (for review)

| File | Responsibility |
|------|----------------|
| `replacement_components/alternate_components/creatibutor_components/CreatibutorsFormBody.js` | Layout: remote family vs plain fields; `search` vs `search_only` given-name visibility; org branch |
| `replacement_components/alternate_components/creatibutor_components/CreatibutorsInlineForm.js` | `applyPersonFromApi`, `onPersonSearchChange`, `familyNameWidgetRef`, `personDetailsExpanded` |
| `replacement_components/alternate_components/creatibutor_components/CreatibutorsFormActionButtons.js` | `setPersonDetailsExpanded` / `personDetailsExpandedAfterSave` when `search_only` |
| `replacement_components/RemoteSelectField.js` | Remote fetch + Dropdown + `onValueChange`; optional `commitSearchOnBlur`, `hideAdditionMenuItem`, `focusFieldPathAfterSelect` |
| `replacement_components/SelectField.jsx` | Chains custom `onBlur` after Formik `handleBlur` / `setFieldTouched` |

---

## 9. Open questions (fill in during discussion)

- [ ] Is **`search_only`** + collapse after save the right UX for **both** creators and contributors?
- [ ] Should **organizations** eventually follow the same “single field” pattern?
- [ ] **a11y:** Full combobox review vs APG (roles, `aria-activedescendant`, AT testing) — blur commit and focus move are implemented but not a substitute for a formal pass.
