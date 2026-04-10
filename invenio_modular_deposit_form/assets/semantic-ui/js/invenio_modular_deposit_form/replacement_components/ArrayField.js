// This file is part of React-Invenio-Forms
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// invenio-modular-deposit-form fork (otherwise matches upstream):
// - Import `FieldLabel` from `"react-invenio-forms"` instead of `./FieldLabel`.
// - Make hasGroupErrors sensitive to touched state and relationship of current value to
//   any initial value and initial errors.
// - Optional `onAfterRemove`: shallow-clone `arrayHelpers`, wrap `remove` to call Formik’s `remove`
//   then `onAfterRemove({ removedIndex, isNowEmpty })` when provided (`isNowEmpty` true if that remove
//   cleared the array); `children` still receive the same arg key
//   order as upstream, with `arrayHelpers` replaced by the clone.
// - Optional `onAfterAdd`: after the stock add-button `push` and `setState`, call
//   `onAfterAdd({ index })` with `valuesToDisplay.length` before `push`.
// - Optional `addButtonRef`: ref to the add-row button (e.g. focus after last row removed).
// - `PropTypes` / `defaultProps`: `onAfterAdd`, `onAfterRemove`, `addButtonRef`.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { getIn, FieldArray } from "formik";
import { Form, Icon } from "semantic-ui-react";
import _filter from "lodash/filter";
import _isEmpty from "lodash/isEmpty";
import _matches from "lodash/matches";
import { FieldLabel } from "react-invenio-forms";

export class ArrayField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Chosen because it will never cross with 0-indexed pre-existing keys.
      nextKey: -1,
      hasBeenShown: false,
    };
  }

  hasGroupErrors = (errors, formTouched, values, initialValues, initialErrors) => {
    const { fieldPath, error: errorProp } = this.props;
    const error = getIn(errors, fieldPath);
    const value = getIn(values, fieldPath);
    const touched = getIn(formTouched, fieldPath);
    const initialValue = getIn(initialValues, fieldPath);
    const initialError = getIn(initialErrors, fieldPath);
    if ((error && touched) || !!errorProp || (value === initialValue && !!initialError)) {
      console.log("errors!");
      return true;
    }
    return false;
  };

  /**
   * Returns the array of values to display, it checks for required options and adds empty rows with the required values prefilled
   * @param {Array} values The array of values
   * @param {String} fieldPath The path of the field
   * @returns An array of values to display
   */
  getValues = (values, fieldPath) => {
    const { requiredOptions, defaultNewValue, showEmptyValue } = this.props;
    const { hasBeenShown } = this.state;
    const existingValues = getIn(values, fieldPath, []);

    if (!hasBeenShown && _isEmpty(requiredOptions) && _isEmpty(existingValues) && showEmptyValue) {
      existingValues.push({ __key: existingValues.length, ...defaultNewValue });
      this.setState({ hasBeenShown: true });
    }

    for (const requiredOption of requiredOptions) {
      const valuesMatchingRequiredOption = _filter(existingValues, _matches(requiredOption));
      if (valuesMatchingRequiredOption.length === 0) {
        existingValues.push({ __key: existingValues.length, ...requiredOption });
      }
    }
    return existingValues;
  };

  renderFormField = (props) => {
    const {
      form: { errors, initialErrors, initialValues, touched, values },
      ...arrayHelpers
    } = props;
    const {
      addButtonRef,
      addButtonLabel,
      addButtonClassName,
      children,
      defaultNewValue,
      fieldPath,
      label,
      labelIcon,
      helpText,
      requiredOptions,
      showEmptyValue,
      onAfterAdd,
      onAfterRemove,
      ...uiProps
    } = this.props;
    const hasError = this.hasGroupErrors(errors, touched, values, initialValues, initialErrors)
      ? { error: {} }
      : {};
    const { nextKey } = this.state;
    const valuesToDisplay = this.getValues(values, fieldPath);
    console.log(arrayHelpers);

    const wrappedArrayHelpers = {
      ...arrayHelpers,
      remove: (indexPath) => {
        const len = getIn(arrayHelpers.form.values, fieldPath, []).length;
        const isNowEmpty = len === 1;
        arrayHelpers.remove(indexPath);
        if (typeof onAfterRemove === "function") {
          onAfterRemove({ isNowEmpty, removedIndex: indexPath });
        }
      },
    };

    return (
      <Form.Field {...uiProps} {...hasError}>
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        {helpText && <label className="helptext">{helpText}</label>}

        {valuesToDisplay.map((value, index, array) => {
          const arrayPath = fieldPath;
          const indexPath = index;
          const key = value.__key || index;

          return (
            <div key={key}>
              {children({
                array,
                arrayHelpers: wrappedArrayHelpers,
                arrayPath,
                indexPath,
                key,
                value,
                ...props,
              })}
            </div>
          );
        })}

        <Form.Group>
          <Form.Button
            ref={addButtonRef}
            type="button"
            icon
            className={addButtonClassName}
            labelPosition="left"
            onClick={() => {
              const insertIndex = valuesToDisplay.length;
              arrayHelpers.push({
                ...defaultNewValue,
                __key: nextKey,
              });
              this.setState((state) => ({ nextKey: state.nextKey - 1 }));
              if (typeof onAfterAdd === "function") {
                onAfterAdd({ index: insertIndex });
              }
            }}
          >
            <Icon name="add" />
            {addButtonLabel}
          </Form.Button>
        </Form.Group>
      </Form.Field>
    );
  };

  render() {
    const { fieldPath } = this.props;
    return (
      <FieldArray
        className="invenio-array-field"
        name={fieldPath}
        id={fieldPath}
        component={this.renderFormField}
      />
    );
  }
}

ArrayField.propTypes = {
  addButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  addButtonLabel: PropTypes.string,
  addButtonClassName: PropTypes.string,
  children: PropTypes.func.isRequired,
  defaultNewValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  fieldPath: PropTypes.string.isRequired,
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  labelIcon: PropTypes.string,
  onAfterAdd: PropTypes.func,
  onAfterRemove: PropTypes.func,
  requiredOptions: PropTypes.array,
  showEmptyValue: PropTypes.bool,
};

ArrayField.defaultProps = {
  addButtonRef: undefined,
  addButtonLabel: "Add new row",
  addButtonClassName: "align-self-end mt-15",
  helpText: "",
  label: "",
  labelIcon: "",
  onAfterAdd: undefined,
  onAfterRemove: undefined,
  requiredOptions: [],
  showEmptyValue: false,
};
