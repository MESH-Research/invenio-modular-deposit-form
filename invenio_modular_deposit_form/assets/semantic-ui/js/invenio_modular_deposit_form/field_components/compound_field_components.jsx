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
import {
  AdditionalDatesComponent,
  PublicationDateComponent,
} from "./field_components";
import { CustomField } from "./CustomField";

const CombinedDatesComponent = ({ ...extraProps }) => {
  return (
    <>
      <PublicationDateComponent {...extraProps} />
      <AdditionalDatesComponent />
    </>
  );
};

/**
 * Renders the stock Journal block widget (field journal:journal from RDM_CUSTOM_FIELDS_UI).
 * Use one section with component "CombinedJournalComponent" to show the full journal block.
 */
const CombinedJournalComponent = (props) => (
  <CustomField fieldName="journal:journal" idString="JournalField" {...props} />
);

/**
 * Renders the stock Imprint block widget (field imprint:imprint from RDM_CUSTOM_FIELDS_UI).
 * Use one section with component "CombinedImprintComponent" to show the full imprint block.
 */
const CombinedImprintComponent = (props) => (
  <CustomField fieldName="imprint:imprint" idString="ImprintField" {...props} />
);

/**
 * Renders the stock Meeting block widget (field meeting:meeting from RDM_CUSTOM_FIELDS_UI).
 * Use one section with component "CombinedMeetingComponent" to show the full meeting block.
 */
const CombinedMeetingComponent = (props) => (
  <CustomField fieldName="meeting:meeting" idString="MeetingField" {...props} />
);

/**
 * Renders the stock Thesis block widget (field thesis:thesis from RDM_CUSTOM_FIELDS_UI).
 * Use one section with component "CombinedThesisComponent" to show the full thesis block.
 */
const CombinedThesisComponent = (props) => (
  <CustomField fieldName="thesis:thesis" idString="ThesisField" {...props} />
);

export {
  CombinedDatesComponent,
  CombinedJournalComponent,
  CombinedImprintComponent,
  CombinedMeetingComponent,
  CombinedThesisComponent,
};
