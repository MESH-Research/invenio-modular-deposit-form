// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// Custom field components that use CustomFieldInjector for built-in
// (invenio-rdm-records contrib-style) custom metadata: imprint, journal,
// meeting, code, thesis. KCWorks kcr:* custom fields live in
// field_components/kcworks/custom_field_components.jsx.

import React from "react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { CustomFieldInjector } from "./CustomFieldInjector";

const BookTitleComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
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
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:developmentStatus"
      idString="CodeDevelopmentStatusField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeProgrammingLanguageComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:programmingLanguage"
      idString="CodeProgrammingLanguageField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeRepositoryComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:codeRepository"
      idString="CodeRepositoryField"
      description={""}
      {...extraProps}
    />
  );
};

const ISBNComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
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
  return (
    <CustomFieldInjector
      sectionName="Journal"
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
  return (
    <CustomFieldInjector
      sectionName="Journal"
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
  return (
    <CustomFieldInjector
      sectionName="Journal"
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
  return (
    <CustomFieldInjector
      sectionName="Journal"
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
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.acronym"
      idString="MeetingAcronymField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingDatesComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.dates"
      idString="MeetingDatesField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingPlaceComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.place"
      idString="MeetingPlaceField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingSessionComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.session"
      idString="MeetingSessionField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingSessionPartComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.session_part"
      idString="MeetingSessionPartField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingTitleComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.title"
      idString="MeetingTitleField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingURLComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.url"
      idString="MeetingURLField"
      description={""}
      {...extraProps}
    />
  );
};

const SectionPagesComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
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
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
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
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
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
  return (
    <CustomFieldInjector
      sectionName="Thesis"
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
  return (
    <CustomFieldInjector
      sectionName="Thesis"
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
  return (
    <CustomFieldInjector
      sectionName="Thesis"
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
  return (
    <CustomFieldInjector
      sectionName="Thesis"
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
  return (
    <CustomFieldInjector
      sectionName="Thesis"
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
