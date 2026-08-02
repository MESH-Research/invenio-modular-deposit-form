// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Copy of stock TitlesField; TextField and AdditionalTitlesField use replacement widgets.

import React, { Component } from "react";
import PropTypes from "prop-types";

import { AdditionalTitlesField } from "./AdditionalTitlesField";
import { TextField } from "../../replacement_components/input_controls/TextField";
import { i18next } from "@translations/invenio_rdm_records/i18next";

export class TitlesField extends Component {
  render() {
    const {
      fieldPath,
      options,
      label,
      icon,
      labelIcon = "book",
      required,
      recordUI,
      ...restProps
    } = this.props;

    return (
      <>
        <TextField
          fieldPath={fieldPath}
          label={label ?? null}
          required={required}
          className="title-field"
          optimized
          icon={icon}
          labelIcon={labelIcon}
          {...restProps}
        />
        <AdditionalTitlesField
          options={options}
          recordUI={recordUI}
          fieldPath="metadata.additional_titles"
        />
      </>
    );
  }
}

TitlesField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.shape({
    type: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.string,
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    lang: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }).isRequired,
  required: PropTypes.bool,
  recordUI: PropTypes.object,
};

TitlesField.defaultProps = {
  label: i18next.t("Title"),
  required: false,
  recordUI: undefined,
};
