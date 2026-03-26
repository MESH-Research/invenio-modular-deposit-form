// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms InputComponent.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms Input:
// - Uses local FieldLabel import.
// - Delegates rendering to local replacement TextField.
// - Mirrors stock InputComponent prop mapping/defaults.

import React, { Component } from "react";
import { showHideOverridableWithDynamicId } from "react-invenio-forms";
import { FieldLabel } from "./FieldLabel";
import { TextField } from "./TextField";

class InputComponent extends Component {
  render() {
    const {
      fieldPath,
      required,
      label,
      icon,
      placeholder,
      description,
      disabled,
      type,
      helpText: helpTextProp,
      labelIcon: labelIconProp,
    } = this.props;

    const helpText = helpTextProp ?? description;
    const labelIcon = labelIconProp ?? icon;

    return (
      <TextField
        key={fieldPath}
        fieldPath={fieldPath}
        required={required}
        helpText={helpText}
        disabled={disabled}
        label={<FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />}
        placeholder={placeholder}
        type={type}
      />
    );
  }
}

InputComponent.defaultProps = {
  icon: undefined,
  description: undefined,
  type: "input",
};

export const Input = showHideOverridableWithDynamicId(InputComponent);
