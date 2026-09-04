// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { RichInputField } from "../input_controls/RichInputField.js";
import { FieldLabel } from "../input_controls/FieldLabel.js";
import { AdditionalDescriptionsField } from "./AdditionalDescriptionsField";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { TINYMCE_CONFIG } from "../../constants.js";

/**
 * Deposit form field for the main record description (`metadata.description`).
 *
 * Uses `RichInputField` (TinyMCE); the editor does not sanitize HTML for XSS.
 * Sanitization happens on the backend via the `SanitizedHTML` marshmallow field
 * (bleach) when the record is created or updated.
 */
export class DescriptionsField extends Component {
  render() {
    const { fieldPath, label, labelIcon, options, editorConfig, recordUI } = this.props;
    return (
      <>
        <RichInputField
          className="description-field mb-12"
          fieldPath={fieldPath}
          editorConfig={editorConfig || TINYMCE_CONFIG}
          label={label ? <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} /> : null}
          optimized
        />
        <AdditionalDescriptionsField
          recordUI={recordUI}
          options={options}
          editorConfig={editorConfig || TINYMCE_CONFIG}
          fieldPath="metadata.additional_descriptions"
        />
      </>
    );
  }
}

DescriptionsField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  editorConfig: PropTypes.object,
  recordUI: PropTypes.object,
  options: PropTypes.object.isRequired,
};

DescriptionsField.defaultProps = {
  label: i18next.t("Description"),
  labelIcon: "pencil",
  editorConfig: undefined,
  recordUI: undefined,
};
