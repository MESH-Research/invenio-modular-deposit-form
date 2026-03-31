// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms SelectField.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms SelectField:
// - Pulls `classnames` out of Formik field props and merges it into `className` on
//   `Form.Dropdown` (semantic-ui-react has no `classnames` prop; spreading it would
//   not apply styles).
// - Imports `FeedbackLabel`, `mergeOptions`, `ensureSelectedValuesInOptions`, and
//   `createOption` from `react-invenio-forms` main entry (published package has no
//   `react-invenio-forms/utils` subpath; helpers live on the root export).
// - Stock destructures nonexistent `form.meta`; we use `form.touched` so messages from
//   `form.errors` show only after the field is touched (prop `error` and initial-error
//   while value unchanged stay as in stock).
// - Formik `handleBlur(e)` infers the field from `e.target.name` or `e.target.id`. For
//   `Form.Dropdown` (search), the blur target is often a wrapper or an inner input
//   without that path, so we still call `setFieldTouched(fieldPath, true, false)` on
//   blur after `handleBlur(e)`.
// - If `onBlur` is passed as a field prop, it is **not** spread onto `Form.Dropdown`
//   alone: we destructure it and call it **after** `handleBlur` + `setFieldTouched`, as
//   `onBlurFromProps(e, { formikProps })`. Stock behavior had the custom handler replace
//   the default when spread last; chaining preserves touched parity for `RemoteSelectField`
//   and any other caller that needs extra blur logic.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { FastField, Field, getIn } from "formik";
import { Form } from "semantic-ui-react";
import {
  FeedbackLabel,
  mergeOptions,
  ensureSelectedValuesInOptions,
  createOption,
} from "react-invenio-forms";

export class SelectField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Track dynamically added options (e.g., user-entered values via allowAdditions)
      options: props.options || [],
    };
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    if (prevProps.options !== options) {
      // When props.options change, merge with existing state options
      // This preserves user-added options while incorporating new prop options
      this.setState((prevState) => {
        const merged = mergeOptions(prevState.options || [], options || []);
        return { options: merged };
      });
    }
  }

  renderError = (isTouched, initialValue, initialErrors, value, errors) => {
    const { error, fieldPath } = this.props;
    const computedError =
      error ||
      (isTouched && getIn(errors, fieldPath, null)) ||
      // We check if initialValue changed to display the initialError,
      // otherwise it would be displayed despite updating the field
      (initialValue === value && getIn(initialErrors, fieldPath, null));
    return (
      computedError && (
        <FeedbackLabel errorMessage={computedError} pointing="above" fieldPath={fieldPath} />
      )
    );
  };

  renderFormField = (formikProps) => {
    const {
      form: {
        values,
        setFieldValue,
        setFieldTouched,
        handleBlur,
        errors,
        initialErrors,
        initialValues,
        touched,
      },
      ...cmpProps
    } = formikProps;
    const {
      defaultValue,
      error,
      fieldPath,
      label,
      options,
      onChange,
      onAddItem,
      onBlur: onBlurFromProps,
      multiple,
      disabled,
      required,
      allowAdditions,
      classnames,
      ...uiProps
    } = cmpProps;

    const _defaultValue = multiple ? [] : "";
    let value = getIn(values, fieldPath, defaultValue || _defaultValue);

    // Normalize empty values for multiple selects to empty array
    if (multiple && (value === "" || value === null || value === undefined)) {
      value = [];
    }

    const initialValue = getIn(initialValues, fieldPath, _defaultValue);
    const isTouched = !!getIn(touched, fieldPath);
    const { options: stateOptions } = this.state;

    // Use state options if available (includes user-added options), otherwise use props
    let dropdownOptions = (stateOptions && stateOptions.length > 0 ? stateOptions : options) || [];

    // Ensure selected values are present in options
    dropdownOptions = ensureSelectedValuesInOptions(dropdownOptions, value, multiple);
    return (
      <Form.Dropdown
        fluid
        className={`invenio-select-field ${classnames ?? ""}`}
        search
        selection
        error={this.renderError(isTouched, initialValue, initialErrors, value, errors)}
        label={{ children: label }}
        name={fieldPath}
        disabled={disabled}
        required={required}
        onBlur={(e) => {
          handleBlur(e);
          setFieldTouched(fieldPath, true, false);
          if (onBlurFromProps) {
            onBlurFromProps(e, { formikProps });
          }
        }}
        onChange={(event, data) => {
          if (onChange) {
            onChange({ event, data, formikProps });
            event.target.value = "";
          } else {
            setFieldValue(fieldPath, data.value);
          }
        }}
        onAddItem={(event, data) => {
          if (onAddItem) {
            // Allow custom onAddItem handler if provided
            onAddItem({ event, data, formikProps });
          } else {
            // Default behavior: add new option to state and update form value
            const newValue = data.value;
            const newOption = createOption(newValue);

            // Add new option to state (deduplication handled by state update)
            this.setState((prevState) => {
              const prevOptions = prevState.options || [];
              // Skip update if option already exists
              if (prevOptions.some((opt) => opt.value === newValue)) {
                return null;
              }
              return { options: [...prevOptions, newOption] };
            });

            // Update form value with new selection
            if (multiple) {
              const currentArray = Array.isArray(value) ? value : [];
              setFieldValue(fieldPath, [...currentArray, newValue]);
            } else {
              setFieldValue(fieldPath, newValue);
            }
          }
        }}
        options={dropdownOptions}
        value={value}
        multiple={multiple}
        selectOnBlur={false}
        allowAdditions={allowAdditions}
        {...uiProps}
      />
    );
  };

  render() {
    const { optimized, fieldPath, helpText, ...uiProps } = this.props;
    const FormikField = optimized ? FastField : Field;
    return (
      <>
        <FormikField
          name={fieldPath}
          component={this.renderFormField}
          fieldPath={fieldPath}
          {...uiProps}
        />
        {helpText && <label className="helptext">{helpText}</label>}
      </>
    );
  }
}

SelectField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  optimized: PropTypes.bool,
  error: PropTypes.any,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onChange: PropTypes.func,
  onAddItem: PropTypes.func,
  allowAdditions: PropTypes.bool,
  multiple: PropTypes.bool,
  helpText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

SelectField.defaultProps = {
  defaultValue: "",
  optimized: false,
  error: undefined,
  label: "",
  onChange: undefined,
  onAddItem: undefined,
  multiple: false,
  helpText: undefined,
  required: false,
  disabled: false,
  allowAdditions: false,
};
