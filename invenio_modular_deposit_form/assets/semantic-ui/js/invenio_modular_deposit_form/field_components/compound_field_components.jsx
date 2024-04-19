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

import React, { useContext } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { Form, Grid } from "semantic-ui-react";
import {
  AccessRightsComponent,
  AdditionalDatesComponent,
  DateComponent,
  MeetingDatesComponent,
  MeetingPlaceComponent,
  MeetingTitleComponent,
  PublisherComponent,
  PublicationLocationComponent,
  ResourceTypeComponent,
  SubmissionComponent,
  TitleComponent,
  VersionComponent,
  UniversityComponent,
} from "./field_components";
import { CustomFieldInjector } from "./CustomFieldInjector";
import { FormUIStateContext } from "../InnerDepositForm";
import { useStore } from "react-redux";

const CombinedDatesComponent = () => {
  const { vocabularies } = useContext(FormUIStateContext);
  return (
    <>
      <DateComponent />
      <AdditionalDatesComponent vocabularies={vocabularies} />
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

const PublicationDetailsComponent = () => {
  return (
    <>
      <Form.Group widths="equal">
        <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.isbn"
          idString="ImprintISBNField"
          description="e.g. 0-06-251587-X"
          placeholder=""
        />
        <VersionComponent description="" />
      </Form.Group>
      <Form.Group widths="equal">
        <PublisherComponent />
        <PublicationLocationComponent />
      </Form.Group>
    </>
  );
};

const SubmitActionsComponent = () => {
  const store = useStore();
  const record = store.getState().deposit.record;
  const permissions = store.getState().deposit.permissions;

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

const ThesisDetailsComponent = () => {
  const { currentFieldMods } = useContext(FormUIStateContext);

  return (
    <>
      <UniversityComponent
        labelMods={currentFieldMods.labelMods}
      />
    </>
  );
};

const TypeTitleComponent = () => {
  const store = useStore();
  const storeState = store.getState();
  const { currentFieldMods, vocabularies } = useContext(FormUIStateContext);

  return (
    <>
      <TitleComponent
        vocabularies={vocabularies}
        record={storeState.deposit.record}
        labelMods={currentFieldMods.labelMods}
      />
      <ResourceTypeComponent
        vocabularies={vocabularies}
        labelMods={currentFieldMods.labelMods}
      />
    </>
  );
};

export {
  CombinedDatesComponent,
  MeetingDetailsComponent,
  OrganizationDetailsComponent,
  PublicationDetailsComponent,
  SubmitActionsComponent,
  ThesisDetailsComponent,
  TypeTitleComponent,
};
