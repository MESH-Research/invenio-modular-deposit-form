// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Hook to resolve the custom_fields.ui section name for a component from
// deposit config (custom_field_section_names). Allows instance config to
// override the section name used when looking up widget config.

import { useSelector } from "react-redux";

/**
 * Returns the UI config section name for a custom field component.
 * Reads from config.custom_field_section_names[componentKey] when set,
 * otherwise returns defaultSectionName.
 *
 * @param {string} componentKey - Key for this component (e.g. "KeywordsComponent", "SeriesComponent")
 * @param {string} defaultSectionName - Section name to use when config does not override (e.g. "Tags", "Series")
 * @returns {string} Section name to pass to CustomField as uiConfigSectionName
 */
export function useCustomFieldSectionName(componentKey, defaultSectionName) {
  return useSelector(
    (state) =>
      state.deposit?.config?.custom_field_section_names?.[componentKey] ??
      defaultSectionName
  );
}
