// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Alternate resource type UI: button shortcuts + “Other” vocabulary select
// (`replacement_components/alternate_components/ResourceTypeSelectorField`).

import React from "react";
import { useStore } from "react-redux";
import ResourceTypeSelectorField from "../../replacement_components/alternate_components/ResourceTypeSelectorField";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/** Five shortcut buttons plus “Other…”. */
const MAX_RESOURCE_TYPE_SHORTCUT_BUTTONS = 5;

/**
 * Resource type (metadata.resource_type). Uses ResourceTypeSelectorField (button-style shortcuts).
 */
const ResourceTypeSelectorComponent = ({
  fieldPath = "metadata.resource_type",
  options: optionsProp,
  shortcutResourceTypeIds: shortcutResourceTypeIdsProp,
  ...extraProps
}) => {
  const depositConfig = useStore().getState().deposit?.config ?? {};
  const options = optionsProp ?? depositConfig?.vocabularies?.metadata?.resource_type ?? [];
  const fromConfig = depositConfig.priority_resource_types;
  const rawIds = shortcutResourceTypeIdsProp ?? (Array.isArray(fromConfig) ? fromConfig : []);
  const shortcutResourceTypeIds = rawIds.slice(0, MAX_RESOURCE_TYPE_SHORTCUT_BUTTONS);

  return (
    <FieldComponentWrapper componentName="ResourceTypeField" fieldPath={fieldPath} {...extraProps}>
      <ResourceTypeSelectorField
        fieldPath={fieldPath}
        options={options}
        required
        shortcutResourceTypeIds={shortcutResourceTypeIds}
      />
    </FieldComponentWrapper>
  );
};

export { ResourceTypeSelectorComponent };
