// Part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

/**
 * Wrapper around modular replacement IdentifiersField for meeting identifiers.
 * Use with custom_fields.ui entry field `meeting:meeting.identifiers` and
 * ui_widget `MeetingIdentifiersField`, or pass an explicit fieldPath.
 */

import React from "react";
import PropTypes from "prop-types";
import { useStore } from "react-redux";
import { IdentifiersField } from "@js/invenio_modular_deposit_form/replacement_components/field_components";

const DEFAULT_FIELD_PATH = "custom_fields.meeting:meeting.identifiers";

function MeetingIdentifiersField({
  fieldPath,
  schemeOptions,
  showEmptyValue,
  label,
  labelIcon,
  icon,
  required,
  ...rest
}) {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };
  const resolvedSchemeOptions = schemeOptions ?? vocabularies.metadata?.identifiers?.scheme;

  return (
    <IdentifiersField
      fieldPath={fieldPath || DEFAULT_FIELD_PATH}
      label={label}
      labelIcon={labelIcon ?? icon}
      required={required}
      schemeOptions={resolvedSchemeOptions}
      showEmptyValue={showEmptyValue ?? false}
      {...rest}
    />
  );
}

MeetingIdentifiersField.propTypes = {
  fieldPath: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  required: PropTypes.bool,
  schemeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  showEmptyValue: PropTypes.bool,
};

export default MeetingIdentifiersField;
