// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// Custom field components that use CustomField (hook-based, no config
// mutation) for built-in (invenio-rdm-records contrib-style) custom metadata:
// imprint, journal, meeting, code, thesis.

import React from "react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { CustomField } from "./CustomField";
import { useCustomFieldSectionName } from "../hooks/useCustomFieldSectionName";

const BookTitleComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName(
    "imprint",
    "Book / Report / Chapter"
  );
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="imprint:imprint.title"
      idString="ImprintTitleField"
      description={""}
      label={"Book title"}
      icon={"book"}
      {...extraProps}
    />
  );
};

const CodeDevelopmentStatusComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("codemeta", "Software");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="code:developmentStatus"
      idString="CodeDevelopmentStatusField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeProgrammingLanguageComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("codemeta", "Software");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="code:programmingLanguage"
      idString="CodeProgrammingLanguageField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeRepositoryComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("codemeta", "Software");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="code:codeRepository"
      idString="CodeRepositoryField"
      description={""}
      {...extraProps}
    />
  );
};

const ISBNComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName(
    "imprint",
    "Book / Report / Chapter"
  );
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="imprint:imprint.isbn"
      idString="ImprintISBNField"
      icon="barcode"
      placeholder="e.g. 0-06-251587-X"
      description={""}
      {...extraProps}
    />
  );
};

const JournalTitleComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("journal", "Journal");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="journal:journal.title"
      idString="JournalTitleField"
      label="Journal title"
      icon=""
      description=""
      {...extraProps}
    />
  );
};

const JournalISSNComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("journal", "Journal");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="journal:journal.issn"
      idString="JournalISSNField"
      label="ISSN"
      icon="barcode"
      description=""
      placeholder="e.g. 1234-5678"
      {...extraProps}
    />
  );
};

const JournalVolumeComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("journal", "Journal");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="journal:journal.volume"
      idString="JournalVolumeField"
      label={i18next.t("Volume")}
      description=""
      icon="zip"
      {...extraProps}
    />
  );
};

const JournalIssueComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("journal", "Journal");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="journal:journal.issue"
      idString="JournalIssueField"
      label={i18next.t("Issue")}
      description=""
      icon="book"
      {...extraProps}
    />
  );
};

const MeetingAcronymComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.acronym"
      idString="MeetingAcronymField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingDatesComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.dates"
      idString="MeetingDatesField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingPlaceComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.place"
      idString="MeetingPlaceField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingSessionComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.session"
      idString="MeetingSessionField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingSessionPartComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.session_part"
      idString="MeetingSessionPartField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingTitleComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.title"
      idString="MeetingTitleField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingURLComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("meeting", "Conference");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="meeting:meeting.url"
      idString="MeetingURLField"
      description={""}
      {...extraProps}
    />
  );
};

const SectionPagesComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("journal", "Journal");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="journal:journal.pages"
      idString="JournalPagesField"
      description={""}
      label="Section pages"
      icon="file outline"
      placeholder="e.g. 123-145"
      {...extraProps}
    />
  );
};

const PublicationLocationComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName(
    "imprint",
    "Book / Report / Chapter"
  );
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="imprint:imprint.place"
      idString="ImprintPlaceField"
      label={"Place of Publication"}
      icon={"map marker alternate"}
      description={""}
      placeholder={"e.g. Lagos, Nigeria"}
      {...extraProps}
    />
  );
};

const TotalPagesComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName(
    "imprint",
    "Book / Report / Chapter"
  );
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="imprint:imprint.pages"
      idString="ImprintPagesField"
      description={""}
      label={i18next.t("Total book pages")}
      icon="file outline"
      {...extraProps}
    />
  );
};

const UniversityComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("thesis", "Thesis");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="thesis:thesis.university"
      idString="ThesisUniversityField"
      label={i18next.t("Awarding university")}
      icon="university"
      description=""
      {...extraProps}
    />
  );
};

const ThesisDepartmentComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("thesis", "Thesis");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="thesis:thesis.department"
      idString="ThesisDepartmentField"
      label={i18next.t("Awarding department")}
      icon="building"
      description=""
      {...extraProps}
    />
  );
};

const ThesisTypeComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("thesis", "Thesis");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="thesis:thesis.type"
      idString="ThesisTypeField"
      label={i18next.t("Thesis type")}
      icon="graduation cap"
      placeholder="e.g. PhD"
      description={i18next.t(
        "The type of thesis (e.g. Masters, PhD, Engineers, Bachelors)"
      )}
      {...extraProps}
    />
  );
};

const ThesisDateSubmittedComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("thesis", "Thesis");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="thesis:thesis.date_submitted"
      idString="ThesisDateSubmittedField"
      label={i18next.t("Submission date")}
      icon="calendar"
      description={i18next.t("Submission date in YYYY-MM-DD format.")}
      {...extraProps}
    />
  );
};

const ThesisDateDefendedComponent = ({ ...extraProps }) => {
  const uiConfigSectionName = useCustomFieldSectionName("thesis", "Thesis");
  return (
    <CustomField
      uiConfigSectionName={uiConfigSectionName}
      fieldName="thesis:thesis.date_defended"
      idString="ThesisDateDefendedField"
      label={i18next.t("Defense date")}
      icon="calendar"
      description={i18next.t("Defense date in YYYY-MM-DD format.")}
      {...extraProps}
    />
  );
};

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
  PublicationLocationComponent,
  SectionPagesComponent,
  ThesisDateDefendedComponent,
  ThesisDateSubmittedComponent,
  ThesisDepartmentComponent,
  ThesisTypeComponent,
  TotalPagesComponent,
  UniversityComponent,
};
