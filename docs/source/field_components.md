# Built-in field widget components

```{seealso}
For the **local replacement forks** of upstream `invenio_rdm_records` field components (`PIDField`, `TitlesField`, …), see [Replacement field components](replacement_field_components.md).
```

## The component registry

The package maintains a `componentsRegistry` that maps component names to React
components. **A name is usable in your layout config only if it is in the
registry** — a component that exists in the package source but is not registered
cannot be referenced by name from `MODULAR_DEPOSIT_FORM_COMMON_FIELDS`.

The complete set of names registered by this package is listed below. Your
instance can add to it, or override any of these names, via its own
`componentsRegistry.js` (see [Extending](extending.md)).

### Core metadata field components

Each of these wraps a stock InvenioRDM or invenio-vocabularies field widget and
inserts it into the form layout following your configuration.

| Component                             | Metadata field(s)                           |
| ------------------------------------- | ------------------------------------------- |
| `AbstractComponent`                   | `metadata.description`, additional descriptions |
| `AccessComponent`                     | `access` (unwrapped — see below)            |
| `AccessRightsComponent`               | `access`                                    |
| `AdditionalDatesComponent`            | `metadata.dates`                            |
| `AdditionalDatesAlternateComponent`   | `metadata.dates`                            |
| `AlternateIdentifiersComponent`       | `metadata.identifiers`                      |
| `CommunitiesComponent`                | community selection                         |
| `ContributorsComponent`               | `metadata.contributors`                     |
| `ContributorsComponentFlat`           | `metadata.contributors`                     |
| `CopyrightsComponent`                 | `metadata.copyright`                        |
| `CreatorsComponent`                   | `metadata.creators`                         |
| `CreatorsComponentFlat`               | `metadata.creators`                         |
| `DeleteComponent`                     | — (delete action)                           |
| `DoiComponent`                        | `pids.doi`                                  |
| `FileUploadComponent`                 | `files`                                     |
| `FormFeedbackComponent`               | — (error and action feedback)               |
| `FundingComponent`                    | `metadata.funding`                          |
| `HorizontalAccessComponent`           | `access`                                    |
| `HorizontalSubmissionComponent`       | — (submit area)                             |
| `LanguagesComponent`                  | `metadata.languages`                        |
| `LicensesComponent`                   | `metadata.rights`                           |
| `PublicationDateComponent`            | `metadata.publication_date`                 |
| `PublicationDateAlternateComponent`   | `metadata.publication_date`                 |
| `PublisherComponent`                  | `metadata.publisher`                        |
| `RelatedWorksComponent`               | `metadata.related_identifiers`              |
| `ResourceTypeComponent`               | `metadata.resource_type`                    |
| `ResourceTypeSelectorComponent`       | `metadata.resource_type`                    |
| `SizesComponent`                      | `metadata.sizes`                            |
| `SubjectsComponent`                   | `metadata.subjects`                         |
| `SubmissionComponent`                 | — (submit area)                             |
| `TitlesComponent`                     | `metadata.title`, `metadata.additional_titles` |
| `VersionComponent`                    | `metadata.version`                          |

Where the same logical field or region has more than one component (access,
submit area, form feedback, dates, resource type, creators/contributors), see
**Multiple components for the same field or region** below.

### Layout and navigation components

These carry no metadata fields and exist so that regions and navigation can be
placed from the layout config. They are documented in
[Configuration](configuration.md).

`FormRow`, `FormStepper`, `FormPageNavigationBar`, `FormSidebarPageMenu`,
`FormTitle`, `SpacerColumn`

```{note}
`FormPages`, `FormPage`, `FormHeader`, `FormFooter`, `FormLeftSidebar`,
`FormRightSidebar`, and `FormSection` (alias `SectionWrapper`) are **not**
registry entries — they are resolved directly by the layout renderer. You still
reference them by name in the config in the usual way.
```

### Compound components

Each renders a pre-configured block of several related fields as a single
layout section:

`CombinedDatesComponent` (publication date + additional dates),
`CombinedJournalComponent`, `CombinedImprintComponent`,
`CombinedMeetingComponent`, `CombinedThesisComponent`

```{warning}
Earlier versions of this page listed `AdditionalDescriptionComponent`,
`ReferencesComponent`, and `CommunitiesAlternateComponent` as built-ins.
`AdditionalDescriptionComponent` and `CommunitiesAlternateComponent` do not
exist (use `AbstractComponent` for descriptions). `ReferencesComponent` is
defined in `field_components/field_components.jsx` but is **not** in the default
registry — to use it by name, register it in your instance's
`componentsRegistry.js`.
```

## Multiple components for the same field or region

Some fields or layout regions have two (or more) registered components. The layout config chooses which one to use by name.

### Access (visibility)

- **AccessRightsComponent** — Wraps the stock `AccessRightField` in `FieldComponentWrapper`, reads `record`, `permissions`, and `config` from the deposit store, and passes `recordRestrictionGracePeriod`, `allowRecordRestriction`, and `showMetadataAccess` into the field. **Use this** in your layout (e.g. in the right sidebar) so the visibility field is fully wired.
- **AccessComponent** — Registered name for the raw `AccessRightField` with no wrapper. It does not receive `record`, `recordRestrictionGracePeriod`, or `allowRecordRestriction` from the layout, so it is not suitable for the default config. It remains in the registry for instances that reference it by name or that pass those props another way.
- **HorizontalAccessComponent** — Alternate two-column access layout under `field_components/alternate/`. Registered; swap it in via the layout `component` name.

### Submit area (save, preview, publish, delete)

- **SubmissionComponent** — Matches the stock invenio-app-rdm sidebar: a Card with DepositStatusBox (draft/published status), then a button grid (Save | Preview, Publish, Share), then an optional second Card with DeleteButton. No form feedback inside the component (use FormFeedbackComponent above it in the sidebar). This is the **default** in the package layout.
- **HorizontalSubmissionComponent** — Alternate layout under `field_components/alternate/`: reuses `SubmissionComponent` in one column and draft/publish help text in the other (help collapses to an info popup on mobile). Form feedback is **not** embedded here — pair it with `FormFeedbackComponent` elsewhere in the layout, as the bundled presets do.

### Form feedback (errors and action state)

- **FormFeedbackComponent** — Standalone block that shows form feedback (validation errors, non-validation errors, and action state). It renders nothing when there is nothing to show. Use it as a **separate subsection** in the right sidebar (e.g. above SubmissionComponent) so feedback appears above the submit buttons without being part of the submit component itself. The default layout uses it that way.
  - **Implementation (modular package):** Renders **`FormFeedback`** from `field_components/alternate/field_inputs/FormFeedback.jsx` (paths relative to `invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/`). The per-section list inside the message comes from **`FormFeedbackSummary`** in `field_components/alternate/field_inputs/form_feedback_components/FormFeedbackSummary.jsx`.
  - **`hideMessageIcon`:** Optional prop forwarded to `FormFeedback`. Default **`true`**: the Semantic UI `Message` has no leading icon (compact sidebar). Set **`false`** to show the severity icon from `feedbackConfig` (check / info / warning / times circle).

## Overridable slots vs alternate components

Two different mechanisms, often confused:

**ReactOverridable slots** — stock InvenioRDM ids in your instance's
`mapping.js`. Any field wrapped in `FieldComponentWrapper` (and several
standalone regions such as form feedback) exposes a slot. Slot ids are listed
in the [Override guide](override-guide.md). Import whatever React component you
want to put in the slot from its real path under this package (there is no
`field_components/overridable/` barrel).

**Alternate layout components** — registered under a different `component`
name in `componentsRegistry`. Swap them in the layout dict without touching
`mapping.js`. They live under `field_components/alternate/`:

| Registry name | What it replaces / adds |
| --- | --- |
| `AdditionalDatesAlternateComponent` | Additional dates, using `DatesFieldAlternate` |
| `PublicationDateAlternateComponent` | Publication date alternate input |
| `ResourceTypeSelectorComponent` | Button-style resource type picker (`ResourceTypeSelectorField`). For the deposit overridable slot alone, you can also map `ResourceTypeField.container` to `ResourceTypeSelectorField` (inner field only). |
| `CreatorsComponentFlat` / `ContributorsComponentFlat` | Inline (non-modal) creatibutors — see below |
| `HorizontalAccessComponent` / `HorizontalSubmissionComponent` | Alternate access / submit layouts — see above |
| `SizesComponent` | Dimensions / sizes for `metadata.sizes` (no stock InvenioRDM field for this path). Uses `field_components/alternate/field_inputs/SizesField`, not the unused `replacement_components/field_components/SizesField.js` orphan. |

`LanguagesComponent` already uses the replacement `LanguagesField`; there is no
separate languages alternate. To override languages via a slot, add a
`LanguagesField.container` entry in `mapping.js` yourself.

## Alternate components

The registered alternates above offer a different UX for the same logical
field or region. Swap them by changing the `component` name in your layout
config.

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
- MeetingIdentifiersComponent
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

- By default the imprint:imprint.pages field is used for *total pages* in a publication, while the journal:journal.pages field is used for *page numbers in a larger work*. So **`SectionPagesComponent`** uses the journal:journal.pages field. If this does not match your InvenioRDM schema, you may override this component.

- **PID / DOI (`DoiComponent` → replacement `PIDField`)** — Visible validation errors follow the same **touched** rules as `TextField`. The replacement fork sets Formik **`touched`** on unmanaged-input blur and when managed/unmanaged (or optional DOI) radios change; see {ref}`formik-touched-pidfield`.
