// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// KCWorks-specific custom field components (kcr:*). Uses CustomFieldInjector
// like the built-in custom fields in custom_field_components.jsx.

import React from "react";
import { CustomFieldInjector } from "../CustomFieldInjector";

const CommonsDomainComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:commons_domain"
      idString="CommonsDomainField"
      description={""}
      {...extraProps}
    />
  );
};

const SubmitterEmailComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:submitter_email"
      idString="SubmitterEmailField"
      description={""}
      {...extraProps}
    />
  );
};

const SubmitterUsernameComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:submitter_username"
      idString="SubmitterUsernameField"
      description={""}
      {...extraProps}
    />
  );
};

export {
  CommonsDomainComponent,
  SubmitterEmailComponent,
  SubmitterUsernameComponent,
};
