// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms DropdownComponent.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms Dropdown:
// - Uses local FieldLabel import.
// - Delegates rendering to local replacement SelectField (touched-aware behavior).
// - Keeps stock prop mapping/defaults; does not add extra pass-through props.

import React, { Component } from "react";
import { showHideOverridableWithDynamicId } from "react-invenio-forms";
import { FieldLabel } from "./FieldLabel";
import { SelectField } from "./SelectField";

class DropdownComponent extends Component {
  serializeOptions = (options) =>
    options?.map((option) => ({
      text: option.title_l10n,
      value: option.id,
      key: option.id,
    }));

  render() {
    const {
      description,
      helpText: helpTextProp,
      placeholder,
      fieldPath,
      label,
      icon,
      labelIcon: labelIconProp,
      options,
      search,
      multiple,
      clearable,
      required,
      disabled,
      optimized,
      allowAdditions,
    } = this.props;

    const helpText = helpTextProp ?? description;
    const labelIcon = labelIconProp ?? icon;

    return (
      <SelectField
        fieldPath={fieldPath}
        label={<FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />}
        options={this.serializeOptions(options)}
        search={search}
        aria-label={label}
        multiple={multiple}
        disabled={disabled}
        placeholder={{ role: "option", content: placeholder }}
        clearable={clearable}
        required={required}
        defaultValue={multiple ? [] : ""}
        helpText={helpText}
        optimized={optimized}
        allowAdditions={allowAdditions}
      />
    );
  }
}

DropdownComponent.defaultProps = {
  icon: undefined,
  search: false,
  multiple: false,
  clearable: true,
  description: undefined,
  optimized: true,
  allowAdditions: false,
};

export const Dropdown = showHideOverridableWithDynamicId(DropdownComponent);
