// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Upstream: `.../PIDField/components/UnmanagedIdentifierCmp.js`
//
// This is a line-for-line copy of the stock component except for error display: stock
// reads `getFieldErrors(form, fieldPath)` and passes that to SUI `error=` on every render.
// Here we use `getFieldErrorsForDisplay(form, fieldPath, field)` from `./fieldErrorsForDisplay`
// and require the parent to pass Formik’s `field` object so “show error” matches
// `TextField.js` (touched / initial-error rules). PropTypes include optional `field`.
//
// The unmanaged PID string is still held in local state and debounced upstream exactly as
// in stock; we did not switch this to `TextField` because the value written to Formik is
// the full `{ identifier, provider }` object, not a scalar path.
//
// Stock also omits `onBlur` on `Form.Input`; that was fine with `getFieldErrors` (no touch
// gate). With `getFieldErrorsForDisplay`, we must call Formik’s `field.onBlur` on blur so
// `touched.pids.<scheme>` is set — otherwise validation errors never become visible after blur.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { getFieldErrorsForDisplay } from "./fieldErrorsForDisplay";

export class UnmanagedIdentifierCmp extends Component {
  constructor(props) {
    super(props);

    const { identifier } = props;

    this.state = {
      localIdentifier: identifier,
    };
  }

  componentDidUpdate(prevProps) {
    const { identifier } = this.props;
    if (identifier !== prevProps.identifier) {
      this.handleIdentifierUpdate(identifier);
    }
  }

  handleIdentifierUpdate = (newIdentifier) => {
    this.setState({ localIdentifier: newIdentifier });
  };

  onChange = (value) => {
    const { onIdentifierChanged } = this.props;
    this.setState({ localIdentifier: value }, () => onIdentifierChanged(value));
  };

  onBlur = (e) => {
    const { field, form, fieldPath } = this.props;
    if (field?.onBlur) {
      field.onBlur(e);
    } else if (form?.setFieldTouched) {
      form.setFieldTouched(fieldPath, true, false);
    }
  };

  render() {
    const { localIdentifier } = this.state;
    const { field, form, fieldPath, helpText, pidPlaceholder, disabled } = this.props;
    const fieldError = getFieldErrorsForDisplay(form, fieldPath, field);
    return (
      <>
        <Form.Field width={8} error={fieldError}>
          <Form.Input
            onBlur={this.onBlur}
            onChange={(e, { value }) => this.onChange(value)}
            value={localIdentifier}
            placeholder={pidPlaceholder}
            width={16}
            error={fieldError}
            disabled={disabled}
          />
        </Form.Field>
        {helpText && <label className="helptext">{helpText}</label>}
      </>
    );
  }
}

UnmanagedIdentifierCmp.propTypes = {
  field: PropTypes.object,
  form: PropTypes.object.isRequired,
  fieldPath: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  identifier: PropTypes.string.isRequired,
  onIdentifierChanged: PropTypes.func.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

UnmanagedIdentifierCmp.defaultProps = {
  field: undefined,
  helpText: null,
  disabled: false,
};
