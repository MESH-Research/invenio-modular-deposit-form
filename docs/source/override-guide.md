# What to Override When (modular deposit form)

## 1. Replace the **whole** widget for a section

**You want:** A completely different implementation for that section (e.g. different dates UI, different community picker, different submit area).

**Override:** The **slot** id in the instance’s `assets/js/invenio_app_rdm/overridableRegistry/mapping.js` → `overriddenComponents`.

**Ids (one per section):**

| Section | Overridable id |
|--------|----------------------------------|
| Additional dates | `InvenioAppRdm.Deposit.DateField.container` |
| Community | `InvenioAppRdm.Deposit.CommunityHeader.container` |
| DOI/PIDs | `InvenioAppRdm.Deposit.PIDField.container` |
| Languages | `InvenioAppRdm.Deposit.LanguagesField.container` |
| Resource type | `InvenioAppRdm.Deposit.ResourceTypeField.container` |
| Submit / status box | `InvenioAppRdm.Deposit.CardDepositStatusBox.container` |
| Access | `InvenioAppRdm.Deposit.AccessRightField.container` |
| Creators | `InvenioAppRdm.Deposit.CreatorsField.container` |
| Contributors | `InvenioAppRdm.Deposit.ContributorsField.container` |
| Descriptions | `InvenioAppRdm.Deposit.DescriptionsField.container` |
| Form feedback | `InvenioAppRdm.Deposit.FormFeedback.container` |
| File upload | `InvenioAppRdm.Deposit.FileUploader.container` |
| Funding | `InvenioAppRdm.Deposit.FundingField.container` |
| Identifiers | `InvenioAppRdm.Deposit.IdentifiersField.container` |
| License | `InvenioAppRdm.Deposit.LicenseField.container` |
| Publication date | `InvenioAppRdm.Deposit.PublicationDateField.container` |
| Publisher | `InvenioAppRdm.Deposit.PublisherField.container` |
| Related works | `InvenioAppRdm.Deposit.RelatedWorksField.container` |
| Subjects | `InvenioAppRdm.Deposit.SubjectsField.container` |
| Titles | `InvenioAppRdm.Deposit.TitlesField.container` |
| Version | `InvenioAppRdm.Deposit.VersionField.container` |

**Example:** Replace the whole dates section with our alternate implementation:

```js
overriddenComponents["InvenioAppRdm.Deposit.DateField.container"] = OverrideAdditionalDatesComponent;
```

**Props your override receives:** When you override a slot, react-overridable passes your component the **same props the default child would get**: the props that were on the default child (from FieldComponentWrapper’s `React.cloneElement` or the parent wrapper). So you receive `fieldPath`, `label`, `description`, `helpText`, `required`, and any section-specific props (e.g. `options`, `recordUI` for titles) without re-implementing the wrapper or reading from the store for those. You do **not** need to wrap your override in FieldComponentWrapper again.

---

## 2. Change only **part** of a widget (e.g. one button, one sub-field)

**You want:** Keep the rest of the widget but customize one inner piece (e.g. the “Add date” button, the community selection button, one input inside CreatibutorsField).

**Override:** The **inner** Overridable id for that piece, in the same `mapping.js` → `overriddenComponents`.

**Where to find inner ids:** In the source of the widget in `invenio_rdm_records` (or the package that provides it). Examples:

- **DatesField:** `InvenioRdmRecords.DatesField.AddDateArrayField.Container`, `InvenioRdmRecords.DatesField.DateTextField.Container`, `InvenioRdmRecords.DatesField.RemoveFormField.Container`
- **CommunityHeader:** `InvenioRdmRecords.CommunityHeader.CommunityHeaderElement.Container`, `InvenioRdmRecords.CommunityHeader.CommunitySelectionButton.Container`
- **FileUploader / Uppy:** several inner Overridables in `invenio_rdm_records` under the FileUploader and UppyUploader components
- **CreatibutorsField:** multiple inner Overridables in CreatibutorsModal

Search the widget’s JS for `id="..."` or `<Overridable` to get the exact ids.

**Example:** Replace only the “Add date” array container in DatesField:

```js
overriddenComponents["InvenioRdmRecords.DatesField.AddDateArrayField.Container"] = MyCustomAddDateBlock;
```

---

## 3. Change **layout**: which sections exist, order, or which wrapper is used by name

**You want:** Add/remove/reorder sections, or have the layout resolve a different component when it asks for e.g. “DescriptionsField” by name.

**Use:** Form layout config (COMMON_FIELDS / FIELDS_BY_TYPE) and/or the **component registry** (`componentsRegistry.js` from the `invenio_modular_deposit_form.components_registry` entry point).

- **Layout config:** decides which section names appear and in what order.
- **Component registry:** maps section name → `[Component, fieldPaths]`. If you register e.g. `DescriptionsField: [MyDescriptionsWrapper, ["metadata.description"]]`, then whenever the layout says “DescriptionsField”, your wrapper is mounted. Your wrapper can then render `<Overridable id="InvenioAppRdm.Deposit.DescriptionsField.container">` and pass props or default content as you like.

This is **not** the same as (1): here you’re changing *which component is mounted for that section name*; in (1) you’re leaving the wrapper as-is and replacing only what’s inside the Overridable for that slot.

---

## Quick decision

- **“Replace the whole [dates / community / submit / …] section”** → override the slot id in (1) in `mapping.js`.
- **“Change one part inside a widget”** → find and override the inner id in (2) in `mapping.js`.
- **“Change what section names mean or what appears in the layout”** → use (3): layout config + component registry.
