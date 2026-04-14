// Part of invenio-modular-deposit-form
// Copyright (C) 2024-2025 Mesh Research.
//
// invenio-modular-deposit-form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Adapted from React-Invenio-Forms
// Copyright (C) 2020-2025 CERN.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "semantic-ui-react";

export class FieldLabel extends Component {
  render() {
    const { htmlFor, icon, label, className, ...rest } = this.props;
    return (
      <label htmlFor={htmlFor} className={className} {...rest}>
        {icon ? <Icon name={icon} /> : null}
        {label}
      </label>
    );
  }
}

FieldLabel.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  icon: PropTypes.string,
  className: PropTypes.string,
};

FieldLabel.defaultProps = {
  className: "field-label-class invenio-field-label",
  icon: "",
  htmlFor: undefined,
  label: undefined,
};