// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// KCWorks-specific custom field components (kcr:*). Uses the same
// CustomField + useCustomFieldWidget approach as built-in custom fields;
// config comes from custom_fields.ui (Commons admin info section).

import React from "react";
import { CustomField } from "../CustomField";

const CommonsDomainComponent = ({ ...extraProps }) => {
  return (
    <CustomField
      uiConfigSectionName="Commons admin info"
      fieldName="kcr:commons_domain"
      idString="CommonsDomainField"
      description=""
      {...extraProps}
    />
  );
};

const SubmitterEmailComponent = ({ ...extraProps }) => {
  return (
    <CustomField
      uiConfigSectionName="Commons admin info"
      fieldName="kcr:submitter_email"
      idString="SubmitterEmailField"
      description=""
      {...extraProps}
    />
  );
};

const SubmitterUsernameComponent = ({ ...extraProps }) => {
  return (
    <CustomField
      uiConfigSectionName="Commons admin info"
      fieldName="kcr:submitter_username"
      idString="SubmitterUsernameField"
      description=""
      {...extraProps}
    />
  );
};

export {
  CommonsDomainComponent,
  SubmitterEmailComponent,
  SubmitterUsernameComponent,
};
