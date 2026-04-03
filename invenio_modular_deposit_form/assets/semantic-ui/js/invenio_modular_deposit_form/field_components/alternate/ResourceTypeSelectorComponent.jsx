// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Alternate resource type UI: button shortcuts + “Other” vocabulary select
// (`replacement_components/alternate_components/ResourceTypeSelectorField`).

import React from "react";
import { useStore } from "react-redux";
import ResourceTypeSelectorField from "../../replacement_components/alternate_components/ResourceTypeSelectorField";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/**
 * Resource type (metadata.resource_type). Uses ResourceTypeSelectorField (button-style shortcuts).
 */
const ResourceTypeSelectorComponent = ({
  fieldPath = "metadata.resource_type",
  options: optionsProp,
  ...extraProps
}) => {
  const options =
    optionsProp ??
    useStore().getState().deposit?.config?.vocabularies?.metadata?.resource_type ??
    [];

  return (
    <FieldComponentWrapper
      componentName="ResourceTypeField"
      fieldPath={fieldPath}
      {...extraProps}
    >
      <ResourceTypeSelectorField fieldPath={fieldPath} options={options} required />
    </FieldComponentWrapper>
  );
};

export { ResourceTypeSelectorComponent };
