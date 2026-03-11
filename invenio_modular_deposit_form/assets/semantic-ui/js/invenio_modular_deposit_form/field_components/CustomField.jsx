// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Renders a built-in custom field by resolving its widget and props from
// deposit config via useCustomFieldWidget, then wrapping in FieldComponentWrapper.
// Renders a built-in custom field by resolving its widget and props from
// deposit config via useCustomFieldWidget, then wrapping in FieldComponentWrapper.
// No config mutation.

import React from "react";
import PropTypes from "prop-types";
import { FieldComponentWrapper } from "./FieldComponentWrapper";
import { useCustomFieldWidget } from "../hooks/useCustomFieldWidget";

/**
 * Renders a single built-in custom field (imprint, journal, meeting, code, thesis)
 * using the widget and props from custom_fields.ui, merged with the given props.
 * Uses the same FieldComponentWrapper as other deposit fields (mods, Overridable).
 */
const CustomField = ({
  fieldName,
  idString,
  ...componentProps
}) => {
  const { Widget, fieldPath, props: mergedProps, loading } = useCustomFieldWidget(
    fieldName,
    componentProps
  );

  if (!fieldPath || loading) {
    return null;
  }

  if (!Widget) {
    return null;
  }

  return (
    <FieldComponentWrapper
      componentName={idString}
      fieldPath={fieldPath}
      {...mergedProps}
    >
      {Widget}
    </FieldComponentWrapper>
  );
};

CustomField.propTypes = {
  fieldName: PropTypes.string.isRequired,
  idString: PropTypes.string.isRequired,
};

export { CustomField };
