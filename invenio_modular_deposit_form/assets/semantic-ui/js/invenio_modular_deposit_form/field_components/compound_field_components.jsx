// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// based on portions of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
// Copyright (C) 2022-2023 KTH Royal Institute of Technology.
//
// The Knowledge Commons Repository and Invenio App RDM are both free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import {
  AccessRightField,
  DescriptionsField,
  CreatibutorsField,
  DeleteButton,
  DepositFormApp,
  DepositStatusBox,
  FileUploader,
  FormFeedback,
  IdentifiersField,
  LanguagesField,
  LicenseField,
  PublicationDateField,
  PublishButton,
  PublisherField,
  ReferencesField,
  RelatedWorksField,
  SubjectsField,
  TitlesField,
  VersionField,
  CommunityHeader,
} from "@js/invenio_rdm_records";
import { Form, Grid } from "semantic-ui-react";
import Overridable from "react-overridable";
import {
  AccessRightsComponent,
  AdditionalDatesComponent,
  BookTitleComponent,
  DateComponent,
  SectionPagesComponent,
  JournalTitleComponent,
  JournalISSNComponent,
  MeetingDatesComponent,
  MeetingPlaceComponent,
  MeetingTitleComponent,
  PublisherComponent,
  PublicationLocationComponent,
  ResourceTypeComponent,
  SubmissionComponent,
  TitleComponent,
  TotalPagesComponent,
  VersionComponent,
  UniversityComponent,
} from "./field_components";
import { CustomFieldInjector } from "./CustomFieldInjector";

const BookDetailComponent = ({ customFieldsUI }) => {
  return (
    <>
      <Form.Group>
        <BookTitleComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
      <Form.Group>
        <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.isbn"
          idString="ImprintISBNField"
          description=""
          customFieldsUI={customFieldsUI}
        />
        <VersionComponent description="" label="Edition or Version" icon="" />
      </Form.Group>
      <Form.Group>
        <PublisherComponent />
        <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
      <Form.Group>
        <VolumeComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
      <Form.Group>
        <TotalPagesComponent
          customFieldsUI={customFieldsUI}
          description={""}
          label="Number of Pages"
          icon="file outline"
        />
      </Form.Group>
    </>
  );
};

const BookSectionDetailComponent = ({ customFieldsUI }) => {
  return (
    <>
      <Form.Group widths="equal">
        <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.title"
          idString="ImprintTitleField"
          description=""
          label="Book title"
          icon="book"
          customFieldsUI={customFieldsUI}
        />
      </Form.Group>
      <Form.Group widths="equal">
        <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.isbn"
          idString="ImprintISBNField"
          description=""
          customFieldsUI={customFieldsUI}
        />
        <VersionComponent description="" label="Edition or Version" icon="" />
      </Form.Group>
      <Form.Group widths="equal">
        <PublisherComponent />
        <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
    </>
  );
};

const CombinedDatesComponent = ({ vocabularies }) => {
  return (
    <>
      <DateComponent />
      <AdditionalDatesComponent vocabularies={vocabularies} />
    </>
  );
};

const CombinedTitlesComponent = ({ vocabularies, record, labelMods }) => {
  return (
    <>
      <TitleComponent
        vocabularies={vocabularies}
        record={record}
        labelMods={labelMods}
      />
    </>
  );
};

const JournalDetailComponent = ({ customFieldsUI, labelMods }) => {
  return (
    <>
      {/* <FieldLabel htmlFor={"imprint:imprint"}
        icon={"book"}
        label={"Book details"}
      /> */}
      <Form.Group widths="equal">
        <JournalTitleComponent
          customFieldsUI={customFieldsUI}
          labelMods={labelMods}
        />
        <JournalISSNComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
      <Form.Group widths="equal">
        <CustomFieldInjector
          sectionName="Journal"
          fieldName="journal:journal.volume"
          idString="JournalVolumeField"
          label="Volume"
          description=""
          icon="zip"
          customFieldsUI={customFieldsUI}
        />
        <CustomFieldInjector
          sectionName="Journal"
          fieldName="journal:journal.issue"
          idString="JournalIssueField"
          label="Issue"
          description=""
          customFieldsUI={customFieldsUI}
        />
        <SectionPagesComponent
          customFieldsUI={customFieldsUI}
          description={""}
          label="Pages"
          icon="file outline"
        />
      </Form.Group>
      <Form.Group widths="equal">
        <PublisherComponent />
        <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
    </>
  );
};

const MeetingDetailsComponent = ({ customFieldsUI }) => {
  return (
    <>
      <MeetingTitleComponent customFieldsUI={customFieldsUI} />
      <MeetingDatesComponent customFieldsUI={customFieldsUI} />
      <MeetingPlaceComponent customFieldsUI={customFieldsUI} />
    </>
  );
};

const OrganizationDetailsComponent = ({ customFieldsUI }) => {
  return (
    <>
      <PublicationLocationComponent customFieldsUI={customFieldsUI} />
    </>
  );
};

const PublicationDetailsComponent = ({ customFieldsUI }) => {
  return (
    <>
      <Form.Group widths="equal">
        <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.isbn"
          idString="ImprintISBNField"
          description="e.g. 0-06-251587-X"
          placeholder=""
          customFieldsUI={customFieldsUI}
        />
        <VersionComponent description="" />
      </Form.Group>
      <Form.Group widths="equal">
        <PublisherComponent />
        <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
    </>
  );
};

const SubmitActionsComponent = ({ permissions, record }) => {
  return (
    <Grid className="submit-actions">
      <Grid.Row>
        <Grid.Column width="16">
          <AccessRightsComponent permissions={permissions} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className="submit-buttons-row">
        <SubmissionComponent record={record} permissions={permissions} />
      </Grid.Row>
    </Grid>
  );
};

const ThesisDetailsComponent = ({ customFieldsUI, labelMods }) => {
  return (
    <>
      <UniversityComponent
        customFieldsUI={customFieldsUI}
        labelMods={labelMods}
      />
    </>
  );
};

const TypeTitleComponent = ({ vocabularies, record, labelMods }) => {
  return (
    <>
      <TitleComponent
        vocabularies={vocabularies}
        record={record}
        labelMods={labelMods}
      />
      <ResourceTypeComponent
        vocabularies={vocabularies}
        labelMods={labelMods}
      />
    </>
  );
};

export {
  BookDetailComponent,
  BookSectionDetailComponent,
  CombinedDatesComponent,
  CombinedTitlesComponent,
  JournalDetailComponent,
  MeetingDetailsComponent,
  OrganizationDetailsComponent,
  PublicationDetailsComponent,
  SubmitActionsComponent,
  ThesisDetailsComponent,
  TypeTitleComponent,
};
