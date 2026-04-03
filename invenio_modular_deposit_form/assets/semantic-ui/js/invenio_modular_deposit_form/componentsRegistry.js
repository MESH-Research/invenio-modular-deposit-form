import { AccessRightField } from "@js/invenio_rdm_records";
import { AdditionalDatesAlternateComponent } from "./field_components/alternate/AdditionalDatesAlternateComponent";
import { CommunitiesAlternateComponent } from "./field_components/alternate/CommunitiesAlternateComponent";
import { PublicationDateAlternateComponent } from "./field_components/alternate/PublicationDateAlternateComponent";
import { ResourceTypeSelectorComponent } from "./field_components/alternate/ResourceTypeSelectorComponent";
import {
  AbstractComponent,
  AccessRightsComponent,
  AdditionalDatesComponent,
  AlternateIdentifiersComponent,
  CommunitiesComponent,
  ContributorsComponent,
  ContributorsComponentFlat,
  CopyrightsComponent,
  CreatorsComponent,
  CreatorsComponentFlat,
  DeleteComponent,
  DoiComponent,
  FileUploadComponent,
  FormFeedbackComponent,
  FundingComponent,
  HorizontalSubmissionComponent,
  LanguagesComponent,
  LicensesComponent,
  PublisherComponent,
  PublicationDateComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  SubjectsComponent,
  SubmissionComponent,
  TitlesComponent,
  VersionComponent,
} from "./field_components/field_components";
import { SizesComponent } from "./field_components/contrib";
import {
  BookTitleComponent,
  CodeDevelopmentStatusComponent,
  CodeProgrammingLanguageComponent,
  CodeRepositoryComponent,
  ISBNComponent,
  JournalISSNComponent,
  JournalIssueComponent,
  JournalTitleComponent,
  JournalVolumeComponent,
  MeetingAcronymComponent,
  MeetingDatesComponent,
  MeetingIdentifiersComponent,
  MeetingPlaceComponent,
  MeetingSessionComponent,
  MeetingSessionPartComponent,
  MeetingTitleComponent,
  MeetingURLComponent,
  PublicationLocationComponent,
  SectionPagesComponent,
  ThesisDateDefendedComponent,
  ThesisDateSubmittedComponent,
  ThesisDepartmentComponent,
  ThesisTypeComponent,
  TotalPagesComponent,
  UniversityComponent,
} from "./field_components/custom_field_components";
import {
  CombinedDatesComponent,
  CombinedJournalComponent,
  CombinedImprintComponent,
  CombinedMeetingComponent,
  CombinedThesisComponent,
} from "./field_components/compound_field_components";
import { FormRow } from "./framing_components/FieldsContent";
import { FormStepper } from "./nav_components/FormStepper";
import { FormPageNavigationBar } from "./nav_components/FormPageNavigationBar";
import { FormSidebarPageMenu } from "./nav_components/FormSidebarPageMenu";

const componentsRegistry = {
  AbstractComponent: [AbstractComponent, ["metadata.description"]],
  AccessComponent: [AccessRightField, ["access"]],
  AccessRightsComponent: [AccessRightsComponent, ["access"]],
  AdditionalDatesComponent: [AdditionalDatesComponent, ["metadata.dates"]],
  AdditionalDatesAlternateComponent: [
    AdditionalDatesAlternateComponent,
    ["metadata.dates"],
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
  CommunitiesAlternateComponent: [CommunitiesAlternateComponent, []],
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
  ContributorsComponent: [ContributorsComponent, ["metadata.contributors"]],
  ContributorsComponentFlat: [ContributorsComponentFlat, ["metadata.contributors"]],
  CopyrightsComponent: [CopyrightsComponent, ["metadata.copyright"]],
  CreatorsComponent: [CreatorsComponent, ["metadata.creators"]],
  CreatorsComponentFlat: [CreatorsComponentFlat, ["metadata.creators"]],
  PublicationDateComponent: [PublicationDateComponent, ["metadata.publication_date"]],
  PublicationDateAlternateComponent: [
    PublicationDateAlternateComponent,
    ["metadata.publication_date"],
  ],
  DoiComponent: [DoiComponent, ["pids.doi"]],
  FundingComponent: [FundingComponent, ["metadata.funding"]],
  FormFeedbackComponent: [FormFeedbackComponent, []],
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
  FileUploadComponent: [FileUploadComponent, ["files"]],
  LanguagesComponent: [LanguagesComponent, ["metadata.languages"]],
  LicensesComponent: [LicensesComponent, ["metadata.rights"]],
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
  MeetingIdentifiersComponent: [
    MeetingIdentifiersComponent,
    ["custom_fields.meeting:meeting.identifiers"],
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
  ResourceTypeSelectorComponent: [
    ResourceTypeSelectorComponent,
    ["metadata.resource_type"],
  ],
  SectionPagesComponent: [
    SectionPagesComponent,
    ["custom_fields.journal:journal.pages"],
  ],
  SizesComponent: [SizesComponent, ["metadata.sizes"]],
  SubjectsComponent: [SubjectsComponent, ["metadata.subjects"]],
  TitlesComponent: [TitlesComponent, ["metadata.title", "metadata.additional_titles"]],
  TotalPagesComponent: [
    TotalPagesComponent,
    ["custom_fields.imprint:imprint.pages"],
  ],
  UniversityComponent: [
    UniversityComponent,
    ["custom_fields.thesis:thesis.university"],
  ],
  ThesisDepartmentComponent: [
    ThesisDepartmentComponent,
    ["custom_fields.thesis:thesis.department"],
  ],
  ThesisTypeComponent: [
    ThesisTypeComponent,
    ["custom_fields.thesis:thesis.type"],
  ],
  ThesisDateSubmittedComponent: [
    ThesisDateSubmittedComponent,
    ["custom_fields.thesis:thesis.date_submitted"],
  ],
  ThesisDateDefendedComponent: [
    ThesisDateDefendedComponent,
    ["custom_fields.thesis:thesis.date_defended"],
  ],
  VersionComponent: [VersionComponent, ["metadata.version"]],
  // below are composite field components
  CombinedDatesComponent: [
    CombinedDatesComponent,
    ["metadata.publication_date", "metadata.dates"],
  ],
  CombinedJournalComponent: [
    CombinedJournalComponent,
    ["custom_fields.journal:journal"],
  ],
  CombinedImprintComponent: [
    CombinedImprintComponent,
    ["custom_fields.imprint:imprint"],
  ],
  CombinedMeetingComponent: [
    CombinedMeetingComponent,
    ["custom_fields.meeting:meeting"],
  ],
  CombinedThesisComponent: [
    CombinedThesisComponent,
    ["custom_fields.thesis:thesis"],
  ],
  DeleteComponent: [DeleteComponent, []],
  FormRow: [FormRow, []],
  ISBNComponent: [ISBNComponent, ["custom_fields.imprint:imprint.isbn"]],
  HorizontalSubmissionComponent: [HorizontalSubmissionComponent, []],
  SubmissionComponent: [SubmissionComponent, []],
  // Layout / page navigation (no field paths; registered for config-driven regions)
  FormStepper: [FormStepper, []],
  FormPageNavigationBar: [FormPageNavigationBar, []],
  FormSidebarPageMenu: [FormSidebarPageMenu, []],
};

const extras = require(`@js/invenio_modular_deposit_form_components`);
if (extras && extras.componentsRegistry) {
  Object.assign(componentsRegistry, extras.componentsRegistry);
}

export { componentsRegistry };
