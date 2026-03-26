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

## Contrib components

Additional components are defined in `field_components/contrib/` for metadata fields that have no stock InvenioRDM equivalent (e.g. SizesField):

- SizesComponent

## Overridable components

All of the stock form field components listed above can be overridden using the regular ReactOverridable mechanism. A sampling of override components, offering variations on the stock field widgets, are defined in `field_components/overridable/`:

- **OverrideAdditionalDatesComponent** — uses DatesFieldAlternate
- **OverrideCommunitiesComponent** — uses replacement CommunityField (optional `imagePlaceholderLink` prop)
- **OverrideDoiComponent** — uses replacement PIDField
- **OverrideLanguagesComponent** — uses replacement LanguagesField with state normalization (id/title_l10n)
- **OverrideResourceTypeComponent** — uses ResourceTypeSelectorField (button-style)
- **OverrideSubmissionComponent** — uses SubmitButtonModal and custom form feedback; same horizontal layout as HorizontalSubmissionComponent. See **Multiple components for the same field or region** (submit area) above.

In your instance's `assets/js/invenio_app_rdm/overridableRegistry/mapping.js` file, you can import any of these components from `@js/invenio_modular_deposit_form/field_components/overridable`. See [Override guide](override-guide.md) for slot ids.

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
