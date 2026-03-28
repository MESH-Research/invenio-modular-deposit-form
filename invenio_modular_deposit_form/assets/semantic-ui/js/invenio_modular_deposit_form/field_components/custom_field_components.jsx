// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// Custom field components that use CustomField (hook-based, no config
// mutation) for built-in (invenio-rdm-records contrib-style) custom metadata:
// imprint, journal, meeting, code, thesis.

import React from "react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { CustomField } from "./CustomField";

const BookTitleComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="imprint:imprint.title"
    idString="ImprintTitleField"
    description={""}
    label={"Book title"}
    labelIcon="book"
    {...extraProps}
  />
);

const CodeDevelopmentStatusComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="code:developmentStatus"
    idString="CodeDevelopmentStatusField"
    description={""}
    {...extraProps}
  />
);

const CodeProgrammingLanguageComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="code:programmingLanguage"
    idString="CodeProgrammingLanguageField"
    description={""}
    {...extraProps}
  />
);

const CodeRepositoryComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="code:codeRepository"
    idString="CodeRepositoryField"
    description={""}
    {...extraProps}
  />
);

const ISBNComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="imprint:imprint.isbn"
    idString="ImprintISBNField"
    labelIcon="barcode"
    placeholder="e.g. 0-06-251587-X"
    description={""}
    {...extraProps}
  />
);

const JournalTitleComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="journal:journal.title"
    idString="JournalTitleField"
    label="Journal title"
    labelIcon=""
    description=""
    {...extraProps}
  />
);

const JournalISSNComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="journal:journal.issn"
    idString="JournalISSNField"
    label="ISSN"
    labelIcon="barcode"
    description=""
    placeholder="e.g. 1234-5678"
    {...extraProps}
  />
);

const JournalVolumeComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="journal:journal.volume"
    idString="JournalVolumeField"
    label={i18next.t("Volume")}
    description=""
    labelIcon="zip"
    {...extraProps}
  />
);

const JournalIssueComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="journal:journal.issue"
    idString="JournalIssueField"
    label={i18next.t("Issue")}
    description=""
    labelIcon="book"
    {...extraProps}
  />
);

const MeetingAcronymComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.acronym"
    idString="MeetingAcronymField"
    description={""}
    {...extraProps}
  />
);

const MeetingDatesComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.dates"
    idString="MeetingDatesField"
    description={""}
    {...extraProps}
  />
);

const MeetingPlaceComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.place"
    idString="MeetingPlaceField"
    description={""}
    {...extraProps}
  />
);

const MeetingSessionComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.session"
    idString="MeetingSessionField"
    description={""}
    {...extraProps}
  />
);

const MeetingSessionPartComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.session_part"
    idString="MeetingSessionPartField"
    description={""}
    {...extraProps}
  />
);

const MeetingTitleComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.title"
    idString="MeetingTitleField"
    description={""}
    {...extraProps}
  />
);

const MeetingURLComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.url"
    idString="MeetingURLField"
    description={""}
    {...extraProps}
  />
);

const MeetingIdentifiersComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="meeting:meeting.identifiers"
    idString="MeetingIdentifiersField"
    labelIcon="barcode"
    description={""}
    {...extraProps}
  />
);

const SectionPagesComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="journal:journal.pages"
    idString="JournalPagesField"
    description={""}
    label="Section pages"
    labelIcon="file outline"
    placeholder="e.g. 123-145"
    {...extraProps}
  />
);

const PublicationLocationComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="imprint:imprint.place"
    idString="ImprintPlaceField"
    label={"Place of Publication"}
    labelIcon="map marker alternate"
    description={""}
    placeholder={"e.g. Lagos, Nigeria"}
    {...extraProps}
  />
);

const TotalPagesComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="imprint:imprint.pages"
    idString="ImprintPagesField"
    description={""}
    label={i18next.t("Total book pages")}
    labelIcon="file outline"
    {...extraProps}
  />
);

const UniversityComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="thesis:thesis.university"
    idString="ThesisUniversityField"
    label={i18next.t("Awarding university")}
    labelIcon="university"
    description=""
    {...extraProps}
  />
);

const ThesisDepartmentComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="thesis:thesis.department"
    idString="ThesisDepartmentField"
    label={i18next.t("Awarding department")}
    labelIcon="building"
    description=""
    {...extraProps}
  />
);

const ThesisTypeComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="thesis:thesis.type"
    idString="ThesisTypeField"
    label={i18next.t("Thesis type")}
    labelIcon="graduation cap"
    placeholder="e.g. PhD"
    description={i18next.t(
      "The type of thesis (e.g. Masters, PhD, Engineers, Bachelors)"
    )}
    {...extraProps}
  />
);

const ThesisDateSubmittedComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="thesis:thesis.date_submitted"
    idString="ThesisDateSubmittedField"
    label={i18next.t("Submission date")}
    labelIcon="calendar"
    description={i18next.t("Submission date in YYYY-MM-DD format.")}
    {...extraProps}
  />
);

const ThesisDateDefendedComponent = ({ ...extraProps }) => (
  <CustomField
    fieldName="thesis:thesis.date_defended"
    idString="ThesisDateDefendedField"
    label={i18next.t("Defense date")}
    labelIcon="calendar"
    description={i18next.t("Defense date in YYYY-MM-DD format.")}
    {...extraProps}
  />
);

export {
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
  MeetingPlaceComponent,
  MeetingSessionComponent,
  MeetingSessionPartComponent,
  MeetingTitleComponent,
  MeetingURLComponent,
  MeetingIdentifiersComponent,
  PublicationLocationComponent,
  SectionPagesComponent,
  ThesisDateDefendedComponent,
  ThesisDateSubmittedComponent,
  ThesisDepartmentComponent,
  ThesisTypeComponent,
  TotalPagesComponent,
  UniversityComponent,
};
