// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms SelectField.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms SelectField:
// 
// ### Layout/styling support
// - Pulls `classnames` out of props and merges it into `className` on the wrapping
//   `Form.Field`.
//
// ### Support for both help text and description (above and below the input)
// - The dropdown is wrapped in `Form.Field` and the label is rendered as a separate
//   `FieldLabel` sibling rather than passed via a `label` prop, so `description` can be
//   rendered between the label and the input. Uses plain `Dropdown` (not `Form.Dropdown`)
//   to avoid a nested `.field` wrapper; `FeedbackLabel` is a sibling under the same
//   show-error rule (stock puts it into `Form.Dropdown`'s `error` prop).
//
// ### Client-side validation support
// - Stock destructures nonexistent `form.meta`; we use `form.touched` so messages from
//   `form.errors` show only after the field is touched (prop `error` and initial-error
//   while value unchanged stay as in stock).
// - Formik `handleBlur(e)` infers the field from `e.target.name` or `e.target.id`. For
//   search `Dropdown`, blur often targets the inner search `<input>`, which has neither,
//   so we mark touched with `setFieldTouched(fieldPath, true, false)` instead of
//   `handleBlur(e)` (which would warn and not identify this field).
// - If `onBlur` is passed as a field prop, it is **not** spread onto `Dropdown` alone:
//   we destructure it and call it **after** `setFieldTouched`, as
//   `onBlurFromProps(e, { formikProps })`. Stock behavior had the custom handler replace
//   the default when spread last; chaining preserves touched parity for `RemoteSelectField`
//   and any other caller that needs extra blur logic.
//
// ### Support for onFocus
// - If `onFocus` is passed as a field prop, it's also destructured and invoked as 
//   `onFocusFromProps(e, { formikProps })` so callers (e.g. `RemoteSelectField` mid-typeahead 
//   seed) can read Formik values.
//
// ### a11y support
// - Sets `id={fieldPath}` on `Dropdown` (stock does not) so `FieldLabel`'s
//   `htmlFor={fieldPath}` resolves and so `arrayFieldFocus.focusFieldByPath` can find
//   the control the same way replacement `TextField` does (`id` on the input).
//
// ### Selected-value identity for `ensureSelectedValuesInOptions`
// - Stock (and this fork) set `value={formikValue}` then `{...uiProps}`, so a parent
//   `value` prop already overrides what the Dropdown treats as selected. SubjectsField
//   relies on that: Formik holds `[{ subject, id }, …]` (record schema) while it passes
//   `value={….map((v) => v.subject)}` (strings the Dropdown can match to `option.value`).
// - Stock still runs `ensureSelectedValuesInOptions` on the Formik value only. For
//   subjects that means comparing objects to string option values, inventing phantom
//   options, and empty menu rows (the blank gap). This fork feeds ensure the same
//   selection identity the Dropdown ends up with: `uiProps.value` when the parent
//   passed it, otherwise Formik. That privileges an incoming `value` prop for option
//   synthesis the same way the spread already privileges it for display — deliberate
//   alignment with SubjectsField, not a new controlled-mode API.
//
// ### Support for restricting the dropdown list to the current search results
// - Used by `RemoteSelectField`.
// - Stock merges every `props.options` change into `state.options` (grow-only). With an
//   empty search query SUIR does not call a custom `search`, so that accumulated list is
//   what the dropdown list shows. When this prop is true, replace `state.options` instead of
//   merging so RemoteSelect can shrink the list (e.g. after select clears the query).
//
// ### Other
// - Imports `FeedbackLabel`, `FieldLabel`, `mergeOptions`, `ensureSelectedValuesInOptions`,
//   and `createOption` from `react-invenio-forms` main entry (published package has no
//   `react-invenio-forms/utils` subpath; helpers live on the root export).
//

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { FastField, Field, getIn } from "formik";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  FeedbackLabel,
  mergeOptions,
  ensureSelectedValuesInOptions,
  createOption,
} from "react-invenio-forms";
import { FieldLabel } from "./FieldLabel";
import { Dropdown, Form } from "semantic-ui-react";

export class SelectField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Track dynamically added options (e.g., user-entered values via allowAdditions)
      options: props.options || [],
    };
  }

  componentDidUpdate(prevProps) {
    const { options, restrictOptionsToResults } = this.props;
    if (prevProps.options !== options) {
      this.setState((prevState) => ({
        // RemoteSelect may shrink the list (e.g. after select); merge would keep stale hits.
        options: restrictOptionsToResults
          ? options || []
          : mergeOptions(prevState.options || [], options || []),
      }));
    }
  }

  getComputedError = (isTouched, initialValue, initialErrors, value, errors) => {
    const { error, fieldPath } = this.props;
    return (
      error ||
      (isTouched && getIn(errors, fieldPath, null)) ||
      // We check if initialValue changed to display the initialError,
      // otherwise it would be displayed despite updating the field
      (initialValue === value && getIn(initialErrors, fieldPath, null))
    );
  };

  renderFormField = (formikProps) => {
    const {
      form: {
        values,
        setFieldValue,
        setFieldTouched,
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
      options,
      onChange,
      onAddItem,
      onBlur: onBlurFromProps,
      onFocus: onFocusFromProps,
      openOnFocus,
      multiple,
      disabled,
      required,
      allowAdditions,
      // Wrapper / RemoteSelect / MultiInput config — not Dropdown DOM attributes.
      additionLabel,
      customFieldsUI,
      defaultFieldValue,
      extraRequiredFields,
      initialOptions,
      noQueryMessage,
      priorityFieldValues,
      searchOnFocus,
      restrictOptionsToResults,
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
    const computedError = this.getComputedError(
      isTouched,
      initialValue,
      initialErrors,
      value,
      errors
    );
    const { options: stateOptions } = this.state;

    // Use state options if available (includes user-added options), otherwise use props
    let dropdownOptions = (stateOptions && stateOptions.length > 0 ? stateOptions : options) || [];

    // Prefer passed `value` prop when present so that `ensureSelectedValuesInOptions` can be given 
    // selected values as an array of strings (suitable for comparison with the dropdown's list of options). 
    // In some cases (e.g. SubjectsField's string array) Formik's value can contain objects with a different 
    // shape, resulting in false comparison misses and phantom options (empty menu rows).
    const selectionForEnsure =
      uiProps.value !== undefined ? uiProps.value : value;
    dropdownOptions = ensureSelectedValuesInOptions(
      dropdownOptions,
      selectionForEnsure,
      multiple
    );
    return (
      <>
        <Dropdown
          fluid
          className="invenio-select-field"
          search
          selection
          error={!!computedError}
          id={fieldPath}
          name={fieldPath}
          disabled={disabled}
          required={required}
          onBlur={(e) => {
            setFieldTouched(fieldPath, true, false);
            if (onBlurFromProps) {
              onBlurFromProps(e, { formikProps });
            }
          }}
          onFocus={(e) => {
            if (onFocusFromProps) {
              onFocusFromProps(e, { formikProps });
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
          openOnFocus={openOnFocus}
          options={dropdownOptions}
          value={value}
          multiple={multiple}
          selectOnBlur={false}
          allowAdditions={allowAdditions}
          {...uiProps}
        />
        {computedError ? (
          <FeedbackLabel
            pointing="above"
            fieldPath={fieldPath}
            {...(error ? { injectedError: error } : {})}
          />
        ) : null}
      </>
    );
  };

  render() {
    const {
      optimized,
      fieldPath,
      label,
      labelIcon,
      helpText,
      description,
      classnames,
      width,
      error,
      required,
      showLabel = true,
      ...uiProps
    } = this.props;
    const FormikField = optimized ? FastField : Field;

    const descriptionId = description && description !== " " ? `${fieldPath}.description` : "";
    const helpTextId = helpText && helpText !== " " ? `${fieldPath}.helptext` : "";
    const ariaDescribedBy = [descriptionId, helpTextId].filter(Boolean).join(" ") || undefined;
    const labelId =
      showLabel && label
        ? React.isValidElement(label)
          ? label.props?.id
          : `${fieldPath}.label`
        : undefined;

    return (
      <Form.Field
        required={!!required}
        error={!!error}
        width={width}
        className={["invenio-select-field-wrapper", classnames].filter(Boolean).join(" ")}
      >
        {showLabel && label ? (
          React.isValidElement(label) ? (
            label
          ) : (
            <FieldLabel
              id={`${fieldPath}.label`}
              htmlFor={fieldPath}
              icon={labelIcon}
              label={label}
            />
          )
        ) : null}
        {descriptionId && (
          <div className="description mb-5" id={descriptionId}>
            {React.isValidElement(description) ? description : i18next.t(description)}
          </div>
        )}
        <FormikField
          name={fieldPath}
          component={this.renderFormField}
          fieldPath={fieldPath}
          required={required}
          {...uiProps}
          {...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {})}
          {...(labelId ? { "aria-labelledby": labelId } : {})}
        />
        {helpTextId && (
          <div className="helptext" id={helpTextId}>
            {React.isValidElement(helpText) ? helpText : i18next.t(helpText)}
          </div>
        )}
      </Form.Field>
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
  labelIcon: PropTypes.string,
  showLabel: PropTypes.bool,
  classnames: PropTypes.string,
  onChange: PropTypes.func,
  onAddItem: PropTypes.func,
  allowAdditions: PropTypes.bool,
  multiple: PropTypes.bool,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

SelectField.defaultProps = {
  defaultValue: "",
  optimized: false,
  error: undefined,
  label: "",
  labelIcon: undefined,
  showLabel: true,
  classnames: undefined,
  onChange: undefined,
  onAddItem: undefined,
  multiple: false,
  description: undefined,
  helpText: undefined,
  required: false,
  disabled: false,
  allowAdditions: false,
};
