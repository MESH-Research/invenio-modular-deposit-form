// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork (intentional deltas from upstream `PublisherField/PublisherField.js`):
// - `TextField` from `replacement_components/input_controls/TextField` (supports
//   `description` / empty `helpText`).
// - Pass through `description` and `helpText` from props so deposit layout config
//   can override or clear them; upstream hardcodes help text. Citation default
//   remains in `defaultProps` when unset.

import React, { Component } from "react";
import PropTypes from "prop-types";

import { TextField } from "../../replacement_components/input_controls/TextField";
import { i18next } from "@translations/invenio_rdm_records/i18next";

export class PublisherField extends Component {
  render() {
    const { description, fieldPath, helpText, label, labelIcon, placeholder } =
      this.props;

    return (
      <TextField
        description={description}
        fieldPath={fieldPath}
        helpText={helpText}
        label={label}
        labelIcon={labelIcon}
        placeholder={placeholder}
      />
    );
  }
}

PublisherField.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  fieldPath: PropTypes.string.isRequired,
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  placeholder: PropTypes.string,
};

PublisherField.defaultProps = {
  description: undefined,
  helpText: i18next.t(
    "The publisher is used to formulate the citation, so consider the prominence of the role."
  ),
  label: i18next.t("Publisher"),
  labelIcon: "building outline",
  placeholder: i18next.t("Publisher"),
};
