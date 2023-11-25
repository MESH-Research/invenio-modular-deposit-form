// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import ReactDOM from "react-dom";
import { getInputFromDOM } from "@js/invenio_rdm_records/";
import { RDMDepositForm } from "./RDMDepositForm";
import { OverridableContext, overrideStore } from "react-overridable";

const overriddenComponents = overrideStore.getAll();
const formDiv = document.getElementById("deposit-form");
const dataSet = formDiv.dataset;

ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RDMDepositForm
      commonFields={JSON.parse(dataSet.commonFields)}
      config={getInputFromDOM("deposits-config")}
      defaultFieldValues={JSON.parse(dataSet.defaultFieldValues)}
      defaultResourceType={JSON.parse(dataSet.defaultResourceType)}
      descriptionModifications={JSON.parse(dataSet.descriptionModifications)}
      extraRequiredFields={JSON.parse(dataSet.extraRequiredFields)}
      fieldsByType={JSON.parse(dataSet.fieldsByType)}
      files={getInputFromDOM("deposits-record-files")}
      helpTextModifications={JSON.parse(dataSet.helpTextModifications)}
      iconModifications={JSON.parse(dataSet.iconModifications)}
      labelModifications={JSON.parse(dataSet.labelModifications)}
      permissions={getInputFromDOM("deposits-record-permissions")}
      pidsConfigOverrides={JSON.parse(dataSet.pidsConfigOverrides)}
      placeholderModifications={JSON.parse(dataSet.placeholderModifications)}
      preselectedCommunity={getInputFromDOM("deposits-draft-community")}
      priorityFieldValues={JSON.parse(dataSet.priorityFieldValues)}
      record={getInputFromDOM("deposits-record")}
    />
  </OverridableContext.Provider>,
  formDiv
);

export * from "./RDMDepositForm";
export * from "./utils";
export * from "./field_components";
export * from "./replacement_components";