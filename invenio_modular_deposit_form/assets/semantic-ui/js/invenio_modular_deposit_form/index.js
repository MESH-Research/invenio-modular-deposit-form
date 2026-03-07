// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Based on Invenio App RDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio Modular Deposit Form and Invenio App RDM are free software;
// you can redistribute and/or modify them under the terms of the MIT
// License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import { getInputFromDOM } from "@js/invenio_rdm_records/";
import { RDMDepositForm } from "./RDMDepositForm";
import { OverridableContext, overrideStore } from "react-overridable";

const overriddenComponents = overrideStore.getAll();
const formDiv = document.getElementById("deposit-form");

// Single config payload (stock forms_config + extension keys from merge_deposit_config)
const config = getInputFromDOM("deposits-config") || {};

const recordRestrictionGracePeriod = getInputFromDOM("deposits-record-restriction-grace-period");
const allowRecordRestriction = getInputFromDOM("deposits-allow-record-restriction");
const groupsEnabled = getInputFromDOM("config-groups-enabled");
const allowEmptyFiles = getInputFromDOM("records-resources-allow-empty-files");
const recordDeletion = getInputFromDOM("deposits-record-deletion");
const fileModification = getInputFromDOM("deposits-file-modification");
const shareBtnRequireLinkExpiration = getInputFromDOM("deposits-share-btn-require-link-expiration");

ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RDMDepositForm
      config={config}
      files={getInputFromDOM("deposits-record-files")}
      filesLocked={getInputFromDOM("deposits-record-locked-files")}
      permissions={getInputFromDOM("deposits-record-permissions")}
      preselectedCommunity={getInputFromDOM("deposits-draft-community")}
      record={getInputFromDOM("deposits-record")}
      useUppy={getInputFromDOM("deposits-use-uppy-ui")}
      recordRestrictionGracePeriod={recordRestrictionGracePeriod}
      allowRecordRestriction={allowRecordRestriction}
      groupsEnabled={groupsEnabled}
      allowEmptyFiles={allowEmptyFiles}
      recordDeletion={recordDeletion}
      fileModification={fileModification}
      shareBtnRequireLinkExpiration={shareBtnRequireLinkExpiration}
    />
  </OverridableContext.Provider>,
  formDiv
);

export * from "./RDMDepositForm";
export * from "./utils";
export * from "./field_components";
export * from "./replacement_components";
