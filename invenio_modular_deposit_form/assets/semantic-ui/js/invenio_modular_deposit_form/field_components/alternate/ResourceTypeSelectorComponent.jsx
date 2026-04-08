// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Alternate resource type UI: button shortcuts + “Other” vocabulary select
// (`replacement_components/alternate_components/ResourceTypeSelectorField`).

import React, { useMemo } from "react";
import { useStore } from "react-redux";
import ResourceTypeSelectorField from "../../replacement_components/alternate_components/ResourceTypeSelectorField";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/** Five shortcut buttons plus “Other…”. */
const MAX_RESOURCE_TYPE_SHORTCUT_BUTTONS = 5;

const EMPTY_RESOURCE_TYPES = [];
const EMPTY_PRIORITY_TYPES = [];

/**
 * Resource type (metadata.resource_type). Uses ResourceTypeSelectorField (button-style shortcuts).
 */
function ResourceTypeSelectorComponent({
  fieldPath = "metadata.resource_type",
  options: optionsProp,
  shortcutResourceTypeIds: shortcutResourceTypeIdsProp,
  ...extraProps
}) {
  const store = useStore();
  const config = store.getState().deposit?.config ?? {};
  const resourceTypeVocabulary =
    config?.vocabularies?.metadata?.resource_type ?? EMPTY_RESOURCE_TYPES;
  const rawPriority = config?.priority_resource_types;
  const priorityResourceTypes = Array.isArray(rawPriority) ? rawPriority : EMPTY_PRIORITY_TYPES;

  const options = optionsProp ?? resourceTypeVocabulary;

  const shortcutResourceTypeIds = useMemo(() => {
    const rawIds = shortcutResourceTypeIdsProp ?? priorityResourceTypes;
    return rawIds.slice(0, MAX_RESOURCE_TYPE_SHORTCUT_BUTTONS);
  }, [shortcutResourceTypeIdsProp, priorityResourceTypes]);

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
}

export { ResourceTypeSelectorComponent };
