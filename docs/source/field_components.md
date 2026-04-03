# Built-in field widget components

```{seealso}
For the **local replacement forks** of upstream `invenio_rdm_records` field components (`PIDField`, `TitlesField`, …), see [Replacement field components](replacement_field_components.md).
```

```{warning}
The documentation from this point on is in rough draft form and is currently being edited. Check back shortly for updates.
```

## Stock component wrappers

The package maintains a componentsRegistry that maps available field-level components to strings you can use in your layout configuration. Components are included for all of the field widgets from the stock InvenioRDM deposit form (defined in `field_components/field_components.jsx`). Each wraps a stock Invenio RDM or vocabularies field and inserts it into the form layout following your configuration:

- AbstractComponent
- AccessComponent
- AccessRightsComponent
- AdditionalDatesComponent
- AdditionalDescriptionComponent
- AlternateIdentifiersComponent
- CommunitiesComponent
- CommunitiesAlternateComponent
- ContributorsComponent
- CopyrightsComponent
- CreatorsComponent
- PublicationDateComponent
- DeleteComponent
- DoiComponent
- FileUploadComponent
- FormFeedbackComponent
- FundingComponent
- HorizontalSubmissionComponent
- LanguagesComponent
- LicensesComponent
- PublisherComponent
- ReferencesComponent
- RelatedWorksComponent
- ResourceTypeComponent
- SubjectsComponent
- SubmissionComponent
- TitlesComponent
- VersionComponent

Where the same logical field or region has more than one component (access, submit area, form feedback), see **Multiple components for the same field or region** below.

## Multiple components for the same field or region

Some fields or layout regions have two (or more) registered components. The layout config chooses which one to use by name.

### Access (visibility)

- **AccessRightsComponent** — Wraps the stock `AccessRightField` in `FieldComponentWrapper`, reads `record`, `permissions`, and `config` from the deposit store, and passes `recordRestrictionGracePeriod`, `allowRecordRestriction`, and `showMetadataAccess` into the field. **Use this** in your layout (e.g. in the right sidebar) so the visibility field is fully wired.
- **AccessComponent** — Registered name for the raw `AccessRightField` with no wrapper. It does not receive `record`, `recordRestrictionGracePeriod`, or `allowRecordRestriction` from the layout, so it is not suitable for the default config. It remains in the registry for instances that reference it by name or that pass those props another way.

### Submit area (save, preview, publish, delete)

- **SubmissionComponent** — Matches the stock invenio-app-rdm sidebar: a Card with DepositStatusBox (draft/published status), then a button grid (Save | Preview, Publish, Share), then an optional second Card with DeleteButton. No form feedback inside the component (use FormFeedbackComponent above it in the sidebar). This is the **default** in the package layout.
- **HorizontalSubmissionComponent** — Two-column layout: one column with FormFeedback (when there are errors or action state), Save, Preview, Publish, Share, and Delete buttons; the other column with helptext about drafts and publishing. Use this in your layout config if you prefer this layout instead of the stock-style cards.
- **OverrideSubmissionComponent** (in `field_components/overridable/`) — Overridable variant that uses SubmitButtonModal and the same horizontal layout; register it via the Overridable slot `InvenioAppRdm.Deposit.CardDepositStatusBox.container` or as the component for the submit section in the registry.

### Form feedback (errors and action state)

- **FormFeedbackComponent** — Standalone block that shows form feedback (validation errors, non-validation errors, and action state). It renders nothing when there is nothing to show. Use it as a **separate subsection** in the right sidebar (e.g. above SubmissionComponent) so feedback appears above the submit buttons without being part of the submit component itself. The default layout uses it that way.
  - **Implementation (modular package):** Renders **`FormFeedback`** from `replacement_components/alternate_components/FormFeedback.jsx` (paths relative to `invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/`). The per-section list inside the message comes from **`FormFeedbackSummary`** in `replacement_components/alternate_components/form_feedback_components/FormFeedbackSummary.jsx`.
  - **`hideMessageIcon`:** Optional prop forwarded to `FormFeedback`. Default **`true`**: the Semantic UI `Message` has no leading icon (compact sidebar). Set **`false`** to show the severity icon from `feedbackConfig` (check / info / warning / times circle).

## Contrib components

Additional components are defined in `field_components/contrib/` for metadata fields that have no stock InvenioRDM equivalent (e.g. SizesField):

- SizesComponent

## Overridable components

All of the stock form field components listed above can be overridden using the regular ReactOverridable mechanism. A sampling of override components, offering variations on the stock field widgets, are defined in `field_components/overridable/`:

- **OverrideAdditionalDatesComponent** — uses DatesFieldAlternate
- **CommunitiesAlternateComponent** — `field_components/alternate/`; `CommunityField`. For `CommunityHeader.container` mapping when the layout uses stock `CommunitiesComponent`, use **CommunitiesAlternateField** from the same module (inner field only).
- **Languages** — default **`LanguagesComponent`** uses replacement **`LanguagesField`** (no separate **`OverrideLanguagesComponent`**; no `LanguagesField.container` entry in instance mapping unless you add one).
- **ResourceTypeSelectorComponent** — `field_components/alternate/`; button-style resource type (`ResourceTypeSelectorField`). For the deposit overridable slot, map `ResourceTypeField.container` to `ResourceTypeSelectorField` (inner field only; layout still provides `FieldComponentWrapper`).
- **OverrideSubmissionComponent** — uses SubmitButtonModal and custom form feedback; same horizontal layout as HorizontalSubmissionComponent. See **Multiple components for the same field or region** (submit area) above.

In your instance's `assets/js/invenio_app_rdm/overridableRegistry/mapping.js` file, you can import any of these components from `@js/invenio_modular_deposit_form/field_components/overridable`. See [Override guide](override-guide.md) for slot ids.

## Alternate components

Alternate components live in `replacement_components/alternate_components/` and offer a different UX for the same logical field. They are registered in the componentsRegistry alongside their standard counterparts, so you can swap between them by changing the component name in your layout config.

### CreatorsComponentFlat / ContributorsComponentFlat

These use **CreatibutorsFieldFlat** instead of the stock `CreatibutorsField`. The default layout config uses `CreatorsComponentFlat` for creators. To revert to the modal-based version, change `"component": "CreatorsComponentFlat"` back to `"component": "CreatorsComponent"` in your `common_fields` config. For contributors, use `ContributorsComponentFlat` in place of `ContributorsComponent`.

**Behavioral differences from CreatorsComponent / ContributorsComponent:**

| Area | Standard (modal) | Flat (inline) |
| --- | --- | --- |
| **Editing** | Opens a modal dialog with its own internal Formik instance and Yup validation schema. | Expands an inline form panel beneath the item. Edits write directly to the parent Formik context (no nested Formik or Yup schema). |
| **Reordering** | Drag-and-drop only. | Drag-and-drop plus explicit Up/Down buttons with `aria-label`s, so items can be reordered via keyboard. |
| **Identifier editing** | Dropdown that stores identifier strings, with scheme resolved on save via serialize/deserialize. | Explicit text + scheme-select rows in a FieldArray. Each identifier is a `{identifier, scheme}` object in the form state. |
| **"Add myself"** | Not available. | An "Add myself" button pre-fills a new entry from the logged-in user's profile (name parts, identifiers, affiliations). |
| **Focus management** | Focus stays in the modal while it is open. | Focus returns to the "Add" button after closing or removing an item. New items auto-focus the name search field. |
| **Validation visibility** | The modal validates on submit via its internal Yup schema. Errors appear inside the modal. | No per-item schema. Errors come from the parent form validator. Opening an existing item for edit marks all its subfields as touched so that existing errors are immediately visible. |
| **Name autofill** | Remote search via `/api/names` with autofill of names, identifiers (as strings), and affiliations. Uses refs to sync dropdown internal state. | Same remote search and autofill flow. Identifiers are set as `{identifier, scheme}` objects directly, so the explicit rows re-render without needing ref-based state syncing. |
| **Transition animation** | Modal open/close. | Fade transition on the inline panel. |

All other behavior (person/organization toggle with cached identifiers and affiliations per type, role selection, affiliation search via `/api/affiliations`, `Overridable` extension points on each form section) is the same.

## Custom field components

Defined in `field_components/custom_field_components.jsx`. They use the **CustomField** component (see the [Extending](extending.md) guide, section **Handling custom fields**), which reads widget and props from the InvenioRDM custom field UI config (`custom_fields.ui`). These cover resource-type-specific custom metadata (imprint, journal, meeting, code, thesis, etc.) and are registered by default for use in type-specific layouts.

- BookTitleComponent
- CodeDevelopmentStatusComponent
- CodeProgrammingLanguageComponent
- CodeRepositoryComponent
- ISBNComponent
- JournalISSNComponent
- JournalIssueComponent
- JournalTitleComponent
- JournalVolumeComponent
- MeetingAcronymComponent
- MeetingDatesComponent
- MeetingPlaceComponent
- MeetingSessionComponent
- MeetingSessionPartComponent
- MeetingTitleComponent
- MeetingURLComponent
- PublicationLocationComponent
- SectionPagesComponent
- ThesisDateDefendedComponent
- ThesisDateSubmittedComponent
- ThesisDepartmentComponent
- ThesisTypeComponent
- TotalPagesComponent
- UniversityComponent

## Gotchas

- By default the imprint:imprint.pages field is used for *total pages* in a publication, while the journal:journal.pages field is used for *page numbers in a larger work*. So the BookSectionPages component uses the journal:journal.pages field. If this does not match your InvenioRDM schema, you may override this component.

- **PID / DOI (`DoiComponent` → replacement `PIDField`)** — Visible validation errors follow the same **touched** rules as `TextField`. The replacement fork sets Formik **`touched`** on unmanaged-input blur and when managed/unmanaged (or optional DOI) radios change; see {ref}`formik-touched-pidfield`.
