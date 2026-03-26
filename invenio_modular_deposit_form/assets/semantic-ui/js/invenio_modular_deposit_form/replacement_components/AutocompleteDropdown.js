// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms AutocompleteDropdownComponent.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms AutocompleteDropdown:
// - Uses local FieldLabel import.
// - Delegates rendering to local replacement RemoteSelectField.

import React, { Component } from "react";
import _get from "lodash/get";
import _isArray from "lodash/isArray";
import { Field } from "formik";
import { showHideOverridableWithDynamicId } from "react-invenio-forms";
import { FieldLabel } from "./FieldLabel";
import { RemoteSelectField } from "./RemoteSelectField";

class AutocompleteDropdownComponent extends Component {
  render() {
    const {
      description,
      fieldPath,
      required,
      label,
      icon,
      clearable,
      placeholder,
      multiple,
      autocompleteFrom,
      autocompleteFromAcceptHeader,
      helpText: helpTextProp,
      labelIcon: labelIconProp,
      disabled,
      ...dropdownProps
    } = this.props;

    const helpText = helpTextProp ?? description;
    const labelIcon = labelIconProp ?? icon;

    return (
      <>
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        <Field name={fieldPath}>
          {({ form: { values } }) => (
            <RemoteSelectField
              clearable={clearable}
              required={required}
              fieldPath={fieldPath}
              multiple={multiple}
              noQueryMessage={placeholder}
              placeholder={placeholder}
              suggestionAPIUrl={autocompleteFrom}
              suggestionAPIHeaders={{
                Accept: autocompleteFromAcceptHeader,
              }}
              disabled={disabled}
              helpText={helpText}
              serializeSuggestions={(suggestions) =>
                _isArray(suggestions)
                  ? suggestions.map((item) => ({
                      text: item.title_l10n,
                      value: item.id,
                      key: item.id,
                    }))
                  : [
                      {
                        text: suggestions.title_l10n,
                        value: suggestions.id,
                        key: suggestions.id,
                      },
                    ]
              }
              initialSuggestions={_get(values, `ui.${fieldPath}`, [])}
              {...dropdownProps}
            />
          )}
        </Field>
      </>
    );
  }
}

AutocompleteDropdownComponent.defaultProps = {
  autocompleteFromAcceptHeader: "application/vnd.inveniordm.v1+json",
  clearable: false,
  multiple: false,
  icon: undefined,
  description: undefined,
};

export const AutocompleteDropdown = showHideOverridableWithDynamicId(
  AutocompleteDropdownComponent
);
