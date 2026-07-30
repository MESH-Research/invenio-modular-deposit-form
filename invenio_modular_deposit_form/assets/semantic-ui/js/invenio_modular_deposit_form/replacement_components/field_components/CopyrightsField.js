// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork (intentional deltas from upstream `CopyrightsField/CopyrightsField.js`):
// - `TextField` from `replacement_components/input_controls/TextField`.
// - Pass through `labelIcon` from props so deposit layout `icon` (including `None`)
//   can override or clear the label icon; upstream hardcodes `copyright outline`.
//   Stock default remains in `defaultProps` when unset.
// - Pass through `description`, `helpText`, `placeholder`, and `classnames` from props
//   (upstream hardcodes help text and placeholder on the field).

import React, { Component } from "react";
import PropTypes from "prop-types";

import { TextField } from "../../replacement_components/input_controls/TextField";
import { i18next } from "@translations/invenio_rdm_records/i18next";

export class CopyrightsField extends Component {
  render() {
    const {
      classnames,
      description,
      fieldPath,
      helpText,
      label,
      labelIcon,
      placeholder,
      required,
    } = this.props;
    return (
      <TextField
        classnames={classnames}
        fieldPath={fieldPath}
        label={label}
        labelIcon={labelIcon}
        required={required}
        helpText={helpText}
        placeholder={placeholder}
        description={description && description !== null ? description : ""}
        optimized
      />
    );
  }
}

CopyrightsField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  required: PropTypes.bool,
};

CopyrightsField.defaultProps = {
  helpText: i18next.t("A copyright statement describing the ownership of the uploaded resource."),
  label: i18next.t("Copyright"),
  labelIcon: "copyright outline",
  required: false,
  placeholder: i18next.t("Copyright (C) {{currentYear}} The Authors.", {
    currentYear: new Date().getFullYear(),
  }),
};
