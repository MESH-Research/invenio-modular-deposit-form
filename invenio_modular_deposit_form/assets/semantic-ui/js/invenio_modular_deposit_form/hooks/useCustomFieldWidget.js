// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Hook to resolve a built-in custom field's widget and merged props from
// deposit config (custom_fields.ui). Does not mutate config; used by
// deposit config via useCustomFieldWidget. Used by CustomField.

import { useEffect, useState } from "react";
import { useStore } from "react-redux";
import { loadWidgetsFromConfig } from "react-invenio-forms";

const FIELD_PATH_PREFIX = "custom_fields";

const FIELD_COMPONENT_LOADERS = [
  (widget) => import(`@templates/custom_fields/${widget}.js`),
  (widget) => import(`@templates/custom_fields/${widget}.jsx`),
  () => import(`@js/invenio_rdm_records/src/deposit/customFields`),
  () => import(`@js/invenio_modular_deposit_form`),
  () => import(`react-invenio-forms`),
];

/**
 * Resolves the widget component and merged props for a custom field from
 * deposit config (custom_fields.ui).
 *
 * @param {string} uiConfigSectionName - Section label in custom_fields.ui (e.g. "Journal")
 * @param {string} fieldName - Dot-separated field path in the metadata schema (e.g. "journal:journal.title")
 * @param {object} componentProps - Props from the calling component (icon, label, etc.)
 * @returns {{ Widget: React.ComponentType|null, fieldPath: string, props: object, loading: boolean }}
 */
export function useCustomFieldWidget(uiConfigSectionName, fieldName, componentProps = {}) {
  const customFieldsUI = useStore().getState().deposit?.config?.custom_fields?.ui ?? [];
  const [Widget, setWidget] = useState(null);

  const sectionConfig = customFieldsUI.find((item) => item.section === uiConfigSectionName);
  const fieldConfig = sectionConfig?.fields?.find((item) => item.field === fieldName);

  const fieldPath = fieldConfig ? `${FIELD_PATH_PREFIX}.${fieldName}` : "";
  const mergedProps = fieldConfig ? { ...fieldConfig.props, ...componentProps } : componentProps;

  useEffect(() => {
    if (!fieldConfig) {
      setWidget(null);
      return;
    }
    const configForLoad = { ...fieldConfig, props: fieldConfig.props };
    loadWidgetsFromConfig({
      templateLoaders: FIELD_COMPONENT_LOADERS,
      fieldPathPrefix: FIELD_PATH_PREFIX,
      fields: [configForLoad],
    })
      .then((components) => setWidget(components[0] ?? null))
      .catch(() => setWidget(null));
  }, [uiConfigSectionName, fieldName, fieldConfig?.field, fieldConfig?.ui_widget]);

  if (!fieldConfig) {
    return {
      Widget: null,
      fieldPath: "",
      props: componentProps,
      loading: false,
    };
  }

  return {
    Widget,
    fieldPath,
    props: mergedProps,
    loading: Widget === null,
  };
}
