import { AccessRightField } from "@js/invenio_rdm_records";
import {
  AbstractComponent,
  AccessRightsComponent,
  AdditionalDatesComponent,
  AdditionalDescriptionComponent,
  AdditionalTitlesComponent,
  AlternateIdentifiersComponent,
  BookTitleComponent,
  CodeRepositoryComponent,
  CodeDevelopmentStatusComponent,
  CodeOperatingSystemComponent,
  CodeProgrammingLanguageComponent,
  CodeRuntimePlatformComponent,
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
  MeetingAcronymComponent,
  MeetingDatesComponent,
  MeetingPlaceComponent,
  MeetingSessionComponent,
  MeetingSessionPartComponent,
  MeetingTitleComponent,
  MeetingURLComponent,
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
} from "./field_components/compound_field_components";
import { FormRow } from "./framing_components/FieldsContent";

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
  CodeDevelopmentStatusComponent: [
    CodeDevelopmentStatusComponent,
    ["custom_fields.code:developmentStatus"],
  ],
  CodeRepositoryComponent: [
    CodeRepositoryComponent,
    ["custom_fields.code:codeRepository"],
  ],
  CodeProgrammingLanguageComponent: [
    CodeProgrammingLanguageComponent,
    ["custom_fields.code:programmingLanguage"],
  ],
  CodeOperatingSystemComponent: [
    CodeOperatingSystemComponent,
    ["custom_fields.code:operatingSystem"],
  ],
  CodeRuntimePlatformComponent: [
    CodeRuntimePlatformComponent,
    ["custom_fields.code:runtimePlatform"],
  ],
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
  MeetingAcronymComponent: [
    MeetingAcronymComponent,
    ["custom_fields.meeting:meeting.acronym"],
  ],
  MeetingDatesComponent: [
    MeetingDatesComponent,
    ["custom_fields.meeting:meeting.dates"],
  ],
  MeetingPlaceComponent: [
    MeetingPlaceComponent,
    ["custom_fields.meeting:meeting.place"],
  ],
  MeetingSessionComponent: [
    MeetingSessionComponent,
    ["custom_fields.meeting:meeting.session"],
  ],
  MeetingSessionPartComponent: [
    MeetingSessionPartComponent,
    ["custom_fields.meeting:meeting.session_part"],
  ],
  MeetingTitleComponent: [
    MeetingTitleComponent,
    ["custom_fields.meeting:meeting.title"],
  ],
  MeetingURLComponent: [
    MeetingURLComponent,
    ["custom_fields.meeting:meeting.url"],
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
  SubmissionComponent: [SubmissionComponent, []],
  // SubmitActionsComponent: [SubmitActionsComponent, ["access"]],
};

const extras = require(`@js/invenio_modular_deposit_form_extras/componentsMap.js`);
if (extras) {
  Object.assign(fieldComponents, extras.componentsMap);
}

export { fieldComponents };
