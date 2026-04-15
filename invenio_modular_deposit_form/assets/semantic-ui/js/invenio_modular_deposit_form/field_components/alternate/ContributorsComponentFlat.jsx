// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { useStore } from "react-redux";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { FieldComponentWrapper } from "../FieldComponentWrapper";
import { CreatibutorsFieldFlat } from "./field_inputs/CreatibutorsFieldFlat";

/**
 * Contributors using flat inline editing (metadata.contributors). Uses CreatibutorsFieldFlat.
 * @overridable InvenioAppRdm.Deposit.ContributorsField.container (via FieldComponentWrapper)
 */
const ContributorsComponentFlat = ({ ...extraProps }) => {
  const config = useStore().getState().deposit.config;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="ContributorsField"
      fieldPath="metadata.contributors"
      label={i18next.t("Contributors")}
      labelIcon="user plus"
      {...extraProps}
    >
      <CreatibutorsFieldFlat
        addButtonLabel={i18next.t("Add contributor")}
        roleOptions={vocabularies.metadata.contributors?.role}
        schema="contributors"
        autocompleteNames={config.autocomplete_names}
        modal={{
          addLabel: i18next.t("Add contributor"),
          editLabel: i18next.t("Edit contributor"),
        }}
      />
    </FieldComponentWrapper>
  );
};

export { ContributorsComponentFlat };
