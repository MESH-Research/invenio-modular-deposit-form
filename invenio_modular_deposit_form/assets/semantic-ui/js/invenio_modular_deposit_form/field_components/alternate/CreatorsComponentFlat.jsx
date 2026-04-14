// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { useStore } from "react-redux";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import FieldComponentWrapper from "../FieldComponentWrapper";
import { CreatibutorsFieldFlat } from "./field_inputs/CreatibutorsFieldFlat";

/**
 * Creators using flat inline editing (metadata.creators). Uses CreatibutorsFieldFlat.
 * @overridable InvenioAppRdm.Deposit.CreatorsField.container (via FieldComponentWrapper)
 */
const CreatorsComponentFlat = ({ ...extraProps }) => {
  const config = useStore().getState().deposit.config;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="CreatorsField"
      fieldPath="metadata.creators"
      label={i18next.t("Creators")}
      labelIcon="user"
      {...extraProps}
    >
      <CreatibutorsFieldFlat
        roleOptions={vocabularies.metadata.creators?.role}
        schema="creators"
        autocompleteNames={config.autocomplete_names}
        required
        addButtonLabel={i18next.t("Add creator")}
        modal={{
          addLabel: i18next.t("Add creator"),
          editLabel: i18next.t("Edit creator"),
        }}
      />
    </FieldComponentWrapper>
  );
};

export { CreatorsComponentFlat };
