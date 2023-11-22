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

// Ensure there aren't any missing values in fields config
const fillEmptyValues = (fieldsByType) => {
  const pageNums = ["1", "2", "3", "4", "5", "6"];
  Object.entries(fieldsByType).forEach(([typename, pages]) => {
    if (pages === null || pages === undefined) {
      fieldsByType[typename] = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
      };
    } else {
      for (let idx = 0; idx < pageNums.length; idx++) {
        if (!Object.keys(pages).includes(pageNums[idx])) {
          fieldsByType[typename][pageNums[idx]] = null;
        }
      }
    }
  });
  return fieldsByType;
};

ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RDMDepositForm
      record={getInputFromDOM("deposits-record")}
      preselectedCommunity={getInputFromDOM("deposits-draft-community")}
      files={getInputFromDOM("deposits-record-files")}
      config={getInputFromDOM("deposits-config")}
      permissions={getInputFromDOM("deposits-record-permissions")}
      commonFields={JSON.parse(dataSet.commonFields)}
      fieldsByType={fillEmptyValues(JSON.parse(dataSet.fieldsByType))}
      labelModifications={JSON.parse(dataSet.labelModifications)}
      placeholderModifications={JSON.parse(dataSet.placeholderModifications)}
      descriptionModifications={JSON.parse(dataSet.descriptionModifications)}
      iconModifications={JSON.parse(dataSet.iconModifications)}
      helpTextModifications={JSON.parse(dataSet.helpTextModifications)}
      defaultFieldValues={JSON.parse(dataSet.defaultFieldValues)}
      priorityFieldValues={JSON.parse(dataSet.priorityFieldValues)}
      extraRequiredFields={JSON.parse(dataSet.extraRequiredFields)}
    />
  </OverridableContext.Provider>,
  formDiv
);

export * from "./RDMDepositForm";
export * from "./utils";
export * from "./field_components";
export * from "./replacement_components";