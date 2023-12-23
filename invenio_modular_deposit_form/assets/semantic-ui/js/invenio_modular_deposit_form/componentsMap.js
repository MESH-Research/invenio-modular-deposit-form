import { AccessRightField } from "@js/invenio_rdm_records";
import {
  AbstractComponent,
  AccessRightsComponent,
  AdditionalDatesComponent,
  AdditionalDescriptionComponent,
  AdditionalTitlesComponent,
  AlternateIdentifiersComponent,
  BookTitleComponent,
  CommunitiesComponent,
  ContributorsComponent,
  CreatorsComponent,
  DateComponent,
  DeleteComponent,
  DoiComponent,
  FilesUploadComponent,
  FundingComponent,
  ISBNComponent,
  JournalVolumeComponent,
  JournalIssueComponent,
  JournalISSNComponent,
  JournalTitleComponent,
  LanguagesComponent,
  LicensesComponent,
  MeetingDatesComponent,
  MeetingPlaceComponent,
  MeetingTitleComponent,
  MetadataOnlyComponent,
  PublisherComponent,
  PublicationLocationComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  SizesComponent,
  SectionPagesComponent,
  SubjectsComponent,
  SubmissionComponent,
  SubtitleComponent,
  TitleComponent,
  TotalPagesComponent,
  VersionComponent,
} from "./field_components/field_components";
import {
  CombinedDatesComponent,
  OrganizationDetailsComponent,
  PublicationDetailsComponent,
  SubmitActionsComponent,
  ThesisDetailsComponent,
  TypeTitleComponent,
} from "./field_components/compound_field_components";
import { FormRow } from "./FieldsContent";

const fieldComponents = {
  AbstractComponent: [AbstractComponent, ["metadata.description"]],
  AccessComponent: [AccessRightField, ["access"]],
  AccessRightsComponent: [AccessRightsComponent, ["access"]],
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
  BookTitleComponent: [
    BookTitleComponent,
    ["custom_fields.imprint:imprint.title"],
  ],
  CommunitiesComponent: [CommunitiesComponent, []],
  ContributorsComponent: [ContributorsComponent, ["metadata.contributors"]],
  CreatorsComponent: [CreatorsComponent, ["metadata.creators"]],
  DateComponent: [DateComponent, ["metadata.publication_date"]],
  DoiComponent: [DoiComponent, ["pids.doi"]],
  FundingComponent: [FundingComponent, ["metadata.funding"]],
  ISBNComponent: [ISBNComponent, ["custom_fields.imprint:imprint.isbn"]],
  JournalISSNComponent: [
    JournalISSNComponent,
    ["custom_fields.journal:journal.issn"],
  ],
  JournalIssueComponent: [
    JournalIssueComponent,
    ["custom_fields.journal:journal.issue"],
  ],
  JournalTitleComponent: [
    JournalTitleComponent,
    ["custom_fields.journal:journal.title"],
  ],
  JournalVolumeComponent: [
    JournalVolumeComponent,
    ["custom_fields.journal:journal.volume"],
  ],
  FilesUploadComponent: [FilesUploadComponent, ["files"]],
  LanguagesComponent: [LanguagesComponent, ["metadata.languages"]],
  LicensesComponent: [LicensesComponent, ["metadata.rights"]],
  MetadataOnlyComponent: [MetadataOnlyComponent, ["access.status"]],
  MeetingDatesComponent: [
    MeetingDatesComponent,
    ["custom_fields.meeting:meeting.dates"],
  ],
  MeetingPlaceComponent: [
    MeetingPlaceComponent,
    ["custom_fields.meeting:meeting.place"],
  ],
  MeetingTitleComponent: [
    MeetingTitleComponent,
    ["custom_fields.meeting:meeting.title"],
  ],
  PublisherComponent: [PublisherComponent, ["metadata.publisher"]],
  PublicationLocationComponent: [
    PublicationLocationComponent,
    ["custom_fields.imprint:imprint.place"],
  ],
  RelatedWorksComponent: [
    RelatedWorksComponent,
    ["metadata.related_identifiers"],
  ],
  ResourceTypeComponent: [ResourceTypeComponent, ["metadata.resource_type"]],
  SectionPagesComponent: [
    SectionPagesComponent,
    ["custom_fields.journal:journal.pages"],
  ],
  SizesComponent: [SizesComponent, ["metadata.sizes"]],
  SubjectsComponent: [SubjectsComponent, ["metadata.subjects"]],
  SubtitleComponent: [SubtitleComponent, ["metadata.additional_titles"]],
  TitleComponent: [TitleComponent, ["metadata.title"]],
  TotalPagesComponent: [
    TotalPagesComponent,
    ["custom_fields.imprint:imprint.pages"],
  ],
  VersionComponent: [VersionComponent, ["metadata.version"]],
  // below are composite field components
  CombinedDatesComponent: [
    CombinedDatesComponent,
    ["metadata.publication_date", "metadata.dates"],
  ],
  DeleteComponent: [DeleteComponent, []],
  FormRow: [FormRow, []],
  ISBNComponent: [ISBNComponent, ["custom_fields.imprint:imprint.isbn"]],
  SectionPagesComponent: [
    SectionPagesComponent,
    ["custom_fields.journal:journal.pages"],
  ],
  OrganizationDetailsComponent: [
    OrganizationDetailsComponent,
    ["custom_fields.imprint:imprint.place"],
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
  ThesisDetailsComponent: [
    ThesisDetailsComponent,
    ["custom_fields.thesis:university"],
  ],
  TypeTitleComponent: [
    TypeTitleComponent,
    ["metadata.title", "metadata.resource_type"],
  ],
};

const extras = require(`@js/invenio_modular_deposit_form_extras/componentsMap.js`);
if (extras) {
  Object.assign(fieldComponents, extras.componentsMap);
}

export { fieldComponents };
