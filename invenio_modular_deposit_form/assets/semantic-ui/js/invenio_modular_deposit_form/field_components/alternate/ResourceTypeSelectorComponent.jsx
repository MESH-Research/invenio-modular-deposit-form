// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Alternate resource type UI: button shortcuts + “Other” vocabulary select
// (`replacement_components/alternate_components/ResourceTypeSelectorField`).

import React, { useMemo } from "react";
import { useStore } from "react-redux";
import ResourceTypeSelectorField from "./field_inputs/ResourceTypeSelectorField";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/** Five shortcut buttons plus “Other…”. */
const MAX_RESOURCE_TYPE_SHORTCUT_BUTTONS = 5;

const EMPTY_RESOURCE_TYPES = [];
const EMPTY_PRIORITY_TYPES = [];

/**
 * Builds the ordered list of resource type ids shown as shortcut buttons.
 *
 * Args:
 *   max: Upper bound on how many ids to return.
 *   options: Vocabulary rows (`{ id, ... }[]`) in server list order.
 *   priorityResourceTypes: Ids from `deposit.config.priority_resource_types`.
 *   shortcutResourceTypeIdsProp: Layout `shortcutResourceTypeIds` when it is an
 *     array (including `[]`); non-arrays are treated like “not from layout”.
 *
 * Returns:
 *   String ids: those from layout/priority that exist in `options`, in that
 *   configured order, then further ids from `options` in array order until `max`.
 */
function buildShortcutResourceTypeIds({
  max,
  options,
  priorityResourceTypes,
  shortcutResourceTypeIdsProp,
}) {
  const hasExplicitLayoutIds = Array.isArray(shortcutResourceTypeIdsProp);
  const fromLayout = hasExplicitLayoutIds
    ? shortcutResourceTypeIdsProp.filter((id) => typeof id === "string" && id.length > 0)
    : null;
  const candidateIds = fromLayout !== null ? fromLayout : priorityResourceTypes;

  const vocabOrderedIds = (Array.isArray(options) ? options : [])
    .map((o) => (o && typeof o.id === "string" ? o.id : ""))
    .filter((id) => id.length > 0);

  const inVocab = new Set(vocabOrderedIds);
  const validFromConfig = candidateIds.filter((id) => inVocab.has(id));
  const chosen = new Set(validFromConfig);
  const result = [...validFromConfig];
  for (const id of vocabOrderedIds) {
    if (result.length >= max) {
      break;
    }
    if (!chosen.has(id)) {
      result.push(id);
      chosen.add(id);
    }
  }
  return result;
}

/**
 * Resource type field (`metadata.resource_type`): shortcut buttons plus an
 * "Other" vocabulary select via `ResourceTypeSelectorField`.
 *
 * **Preferred shortcut ids** (instance / layout), in order:
 *
 * - If the layout subsection passes `shortcutResourceTypeIds` as an array, that
 *   list is used (string ids only). An empty array means no ids from the layout.
 * - Otherwise the list comes from `deposit.config.priority_resource_types`, which
 *   is set from Flask `MODULAR_DEPOSIT_FORM_PRIORITY_RESOURCE_TYPES` in
 *   `merge_deposit_config` (see `invenio_modular_deposit_form/filters/merge_deposit_config.py`).
 *
 * **Resolution:** Ids not present in `deposit.config.vocabularies.metadata.resource_type`
 * are dropped while preserving the configured order. Any remaining shortcut slots
 * (up to five) are filled from that vocabulary array in **server list order** (no
 * extra sort in the client).
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

  const shortcutResourceTypeIds = useMemo(
    () =>
      buildShortcutResourceTypeIds({
        max: MAX_RESOURCE_TYPE_SHORTCUT_BUTTONS,
        options,
        priorityResourceTypes,
        shortcutResourceTypeIdsProp,
      }),
    [shortcutResourceTypeIdsProp, priorityResourceTypes, options]
  );

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
