// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import { RDMDepositForm } from "./RDMDepositForm";
import { OverridableContext, overrideStore } from "react-overridable";

const overriddenComponents = overrideStore.getAll();
const formDiv = document.getElementById("deposit-form");
const dataSet = formDiv.dataset;

// FIXME: previewableExtensions depends on the custom jinja filter
// defined in invenio_modular_detail_page/filters/previewable_extensions.py
ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RDMDepositForm
      commonFields={JSON.parse(dataSet.commonFields)}
      communityTerm={dataSet.communityTerm}
      config={JSON.parse(dataSet.depositConfig)}
      currentUserprofile={JSON.parse(dataSet.currentUserprofile)}
      defaultFieldValues={JSON.parse(dataSet.defaultFieldValues)}
      defaultResourceType={JSON.parse(dataSet.defaultResourceType)}
      descriptionModifications={JSON.parse(dataSet.descriptionModifications)}
      extraRequiredFields={JSON.parse(dataSet.extraRequiredFields)}
      fieldsByType={JSON.parse(dataSet.fieldsByType)}
      files={JSON.parse(dataSet.files)}
      helpTextModifications={JSON.parse(dataSet.helpTextModifications)}
      iconModifications={JSON.parse(dataSet.iconModifications)}
      labelModifications={JSON.parse(dataSet.labelModifications)}
      permissions={JSON.parse(dataSet.permissions)}
      pidsConfigOverrides={JSON.parse(dataSet.pidsConfigOverrides)}
      placeholderModifications={JSON.parse(dataSet.placeholderModifications)}
      preselectedCommunity={JSON.parse(dataSet.preselectedCommunity)}
      previewableExtensions={JSON.parse(dataSet.previewableExtensions)}
      priorityFieldValues={JSON.parse(dataSet.priorityFieldValues)}
      record={JSON.parse(dataSet.record)}
    />
  </OverridableContext.Provider>,
  formDiv
);

export * from "./RDMDepositForm";
export * from "./InnerDepositForm";
export * from "./utils";
export * from "./field_components";
export * from "./framing_components";
export * from "./hooks";
export * from "./replacement_components";
