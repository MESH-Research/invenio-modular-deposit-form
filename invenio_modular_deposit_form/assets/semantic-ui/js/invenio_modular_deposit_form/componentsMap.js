import {
  AccessRightField,
} from "@js/invenio_rdm_records";
import {
  AbstractComponent,
  AdditionalDatesComponent,
  AdditionalDescriptionComponent,
  AdditionalTitlesComponent,
  AlternateIdentifiersComponent,
  BookTitleComponent,
  CommunitiesComponent,
  ContributorsComponent,
  CreatorsComponent,
  DateComponent,
  DoiComponent,
  FilesUploadComponent,
  FundingComponent,
  ISBNComponent,
  SectionPagesComponent,
  LanguagesComponent,
  LicensesComponent,
  MetadataOnlyComponent,
  PublisherDoiComponent,
  PublisherComponent,
  PublicationLocationComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  SubjectsComponent,
  SubtitleComponent,
  TitleComponent,
  TotalPagesComponent,
  VersionComponent,
} from "./field_components/field_components";
import {
  AccessRightsComponent,
  BookDetailComponent,
  BookSectionDetailComponent,
  CombinedDatesComponent,
  CombinedTitlesComponent,
  DeleteComponent,
  JournalDetailComponent,
  OrganizationDetailsComponent,
  PublicationDetailsComponent,
  SubmissionComponent,
  SubmitActionsComponent,
  ThesisDetailsComponent,
  TypeTitleComponent,
} from "./field_components/compound_field_components";

const fieldComponents = {
  AbstractComponent: [AbstractComponent, ["metadata.description"]],
  AdditionalDatesComponent: [AdditionalDatesComponent, ["metadata.dates"]],
  AdditionalDescriptionComponent: [
    AdditionalDescriptionComponent,
    ["metadata.additional_descriptions"],
  ],
  AdditionalTitlesComponent: [
    AdditionalTitlesComponent,
    ["metadata.additional_titles"],
  ],
  AlternateIdentifiersComponent: [
    AlternateIdentifiersComponent,
    ["metadata.identifiers"],
  ],
  BookTitleComponent: [BookTitleComponent, ["custom_fields.imprint:imprint.title"]],
  CommunitiesComponent: [CommunitiesComponent, []],
  ContributorsComponent: [ContributorsComponent, ["metadata.contributors"]],
  CreatorsComponent: [CreatorsComponent, ["metadata.creators"]],
  DateComponent: [DateComponent, ["metadata.publication_date"]],
  DoiComponent: [DoiComponent, ["pids.doi"]],
  FundingComponent: [FundingComponent, ["metadata.funding"]],
  ISBNComponent: [ISBNComponent, ["custom_fields.imprint:imprint.isbn"]],
  FilesUploadComponent: [FilesUploadComponent, ["files"]],
  LanguagesComponent: [LanguagesComponent, ["metadata.languages"]],
  LicensesComponent: [LicensesComponent, ["metadata.rights"]],
  MetadataOnlyComponent: [MetadataOnlyComponent, ["access.status"]],
  PublisherComponent: [PublisherComponent, ["metadata.publisher"]],
  PublicationLocationComponent: [
    PublicationLocationComponent,
    ["custom_fields.imprint:imprint.place"],
  ],
  RelatedWorksComponent: [RelatedWorksComponent, ["metadata.related_identifiers"]],
  ResourceTypeComponent: [ResourceTypeComponent, ["metadata.resource_type"]],
  SubjectsComponent: [SubjectsComponent, ["metadata.subjects"]],
  SubtitleComponent: [SubtitleComponent, ["metadata.additional_titles"]],
  TitleComponent: [TitleComponent, ["metadata.title"]],
  TotalPagesComponent: [TotalPagesComponent, ["custom_fields.imprint:imprint.pages"]],
  VersionComponent: [VersionComponent, ["metadata.version"]],
  // below are composite field components
  AccessComponent: [AccessRightField, ["access"]],
  AccessRightsComponent: [AccessRightsComponent, ["access"]],
  BookDetailComponent: [
    BookDetailComponent,
    [
      "custom_fields.imprint:imprint.isbn",
      "metadata.version",
      "metadata.publisher",
      "custom_fields.imprint:imprint.place",
    ],
  ],
  BookSectionDetailComponent: [
    BookSectionDetailComponent,
    [
      "custom_fields.imprint:imprint.title",
      "custom_fields.imprint:imprint.isbn",
      "metadata.version",
      "metadata.publisher",
      "custom_fields.imprint:imprint.place",
    ],
  ],
  CombinedTitlesComponent: [
    CombinedTitlesComponent,
    ["metadata.title", "metadata.additional_titles"],
  ],
  CombinedDatesComponent: [
    CombinedDatesComponent,
    ["metadata.publication_date", "metadata.dates"],
  ],
  DeleteComponent: [DeleteComponent, []],
  ISBNComponent: [ISBNComponent, ["custom_fields.imprint:imprint.isbn"]],
  SectionPagesComponent: [
    SectionPagesComponent,
    ["custom_fields.journal:journal.pages"],
  ],
  JournalDetailComponent: [
    JournalDetailComponent,
    [
      "custom_fields.journal:journal.issn",
      "custom_fields.journal:journal.title",
      "custom_fields.journal:journal.volume",
      "custom_fields.journal:journal.issue",
      "custom_fields.journal:journal.pages",
    ],
  ],
  OrganizationDetailsComponent: [
    OrganizationDetailsComponent,
    [
      "custom_fields.imprint:imprint.place",
    ],
  ],
  PublicationDetailsComponent: [
    PublicationDetailsComponent,
    [
      "custom_fields.imprint:imprint.isbn",
      "metadata.version",
      "metadata.publisher",
      "custom_fields.imprint:imprint.place",
    ],
  ],
  SubmissionComponent: [SubmissionComponent, []],
  SubmitActionsComponent: [SubmitActionsComponent, ["access"]],
  ThesisDetailsComponent: [ThesisDetailsComponent, ["custom_fields.thesis:university"]],
  TypeTitleComponent: [
    TypeTitleComponent,
    ["metadata.title", "metadata.resource_type"],
  ],
};

const extras = require(`@js/invenio_modular_deposit_form_extras/componentsMap.js`);
if ( extras ) {
  Object.assign(fieldComponents, extras.componentsMap);
}
console.log(fieldComponents);

export { fieldComponents };