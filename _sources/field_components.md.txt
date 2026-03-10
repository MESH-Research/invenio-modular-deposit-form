# Built-in field widget components

```{warning}
The documentation from this point on is in rough draft form and is currently being edited. Check back shortly for updates.
```

## Stock component wrappers

The package maintains a componentsRegistry that maps available field-level components to strings you can use in your layout configuration. Components are included for all of the field widgets from the stock InvenioRDM deposit form (defined in `field_components/field_components.jsx`). Each wraps a stock Invenio RDM or vocabularies field and inserts it into the form layout following your configuration:

- AbstractComponent
- AccessRightsComponent
- AdditionalDatesComponent
- AdditionalDescriptionComponent
- AlternateIdentifiersComponent
- CommunitiesComponent
- ContributorsComponent
- CopyrightsComponent
- CreatorsComponent
- DateComponent
- DeleteComponent
- DoiComponent
- FileUploadComponent
- FundingComponent
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
- **OverrideSubmissionComponent** — uses SubmitButtonModal and custom form feedback

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
