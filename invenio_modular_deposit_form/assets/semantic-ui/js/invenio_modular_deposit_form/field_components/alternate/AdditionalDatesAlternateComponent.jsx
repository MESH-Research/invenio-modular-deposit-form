// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock DatesField with DatesFieldAlternate implementation.

import React from "react";
import { useStore } from "react-redux";
import { DatesFieldAlternate } from "./field_inputs/DatesFieldAlternate";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/**
 * Additional dates field (metadata.dates). Uses DatesFieldAlternate instead of stock DatesField.
 */
const AdditionalDatesAlternateComponent = ({
  fieldPath = "metadata.dates",
  options: optionsProp,
  ...extraProps
}) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };
  const options = optionsProp ?? vocabularies.metadata.dates;

  return (
    <FieldComponentWrapper componentName="DateField" {...extraProps} fieldPath={fieldPath}>
      <DatesFieldAlternate
        fieldPath={fieldPath}
        options={options}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

export { AdditionalDatesAlternateComponent };
