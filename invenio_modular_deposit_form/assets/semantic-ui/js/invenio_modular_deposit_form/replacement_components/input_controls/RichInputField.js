// This file is part of React-Invenio-Deposit
// Copyright (C) 2022 CERN.
// Copyright (C) 2020 Northwestern University.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modified for Invenio-Modular-Deposit-Form
// - Add touched awareness to gating for error message display.
// - Make error label display depend on error being active and visible.
// - Modify imports to pull subcomponents from stock package.
// - Local-controlled TinyMCE content with debounced Formik sync so local
//   storage recovery sees mid-edit description without per-keystroke updates.

import { FastField, Field, getIn } from "formik";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { RichEditor } from "react-invenio-forms";
import { ErrorLabel } from "react-invenio-forms";
import { Form } from "semantic-ui-react";

const DEFAULT_FORMIK_SYNC_DEBOUNCE_MS = 2500;

/**
 * Bridges TinyMCE to Formik: editor content is controlled by local state;
 * Formik is updated on a debounce (and flushed on blur / unmount / pagehide)
 * so autosave/recovery can see edits without constant form re-renders.
 */
class RichInputFieldControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localContent: props.value,
      formikValueSeen: props.value,
      focused: false,
    };
    this._syncTimer = null;
    this._pendingContent = null;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.focused) {
      return null;
    }
    if (nextProps.value === prevState.formikValueSeen) {
      return null;
    }
    // External Formik change (recovery reset, draft reload) while unfocused.
    return {
      localContent: nextProps.value,
      formikValueSeen: nextProps.value,
    };
  }

  componentDidMount() {
    this._mounted = true;
    window.addEventListener("pagehide", this.flushPending);
  }

  componentWillUnmount() {
    this._mounted = false;
    window.removeEventListener("pagehide", this.flushPending);
    this.flushPending();
  }

  scheduleFormikSync = (content) => {
    this._pendingContent = content;
    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
    }
    this._syncTimer = setTimeout(() => {
      this._syncTimer = null;
      this.flushPending();
    }, this.props.formikSyncDebounceMs);
  };

  flushPending = () => {
    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
      this._syncTimer = null;
    }
    const content =
      this._pendingContent !== null ? this._pendingContent : this.state.localContent;
    this._pendingContent = null;
    const { fieldPath, setFieldValue, value } = this.props;
    if (content === value) {
      return;
    }
    setFieldValue(fieldPath, content);
    // Avoid treating our own write as an external reset on the next unfocused render.
    if (this._mounted) {
      this.setState({ formikValueSeen: content });
    }
  };

  handleEditorChange = (content) => {
    this.setState({ localContent: content });
    this.scheduleFormikSync(content);
  };

  handleFocus = () => {
    this.setState({ focused: true });
  };

  handleBlur = (event, editor) => {
    const content = editor.getContent();
    this.setState({ localContent: content, focused: false });
    this._pendingContent = content;
    this.flushPending();
    this.props.setFieldTouched(this.props.fieldPath, true);
  };

  render() {
    const {
      fieldPath,
      label,
      required,
      className,
      editor,
      editorConfig,
      disabled,
      optimized,
      initialValue,
      error,
    } = this.props;
    const { localContent } = this.state;

    return (
      <Form.Field
        id={fieldPath}
        required={required}
        disabled={disabled}
        error={error}
        className={className}
      >
        {React.isValidElement(label) ? label : <label htmlFor={fieldPath}>{label}</label>}
        {editor ? (
          editor
        ) : (
          <RichEditor
            initialValue={initialValue}
            inputValue={localContent}
            optimized={optimized}
            editorConfig={editorConfig}
            onEditorChange={this.handleEditorChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            disabled={disabled}
          />
        )}
        {error && <ErrorLabel fieldPath={fieldPath} />}
      </Form.Field>
    );
  }
}

RichInputFieldControl.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  editor: PropTypes.elementType,
  editorConfig: PropTypes.object,
  error: PropTypes.any,
  fieldPath: PropTypes.string.isRequired,
  formikSyncDebounceMs: PropTypes.number,
  initialValue: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  optimized: PropTypes.bool,
  required: PropTypes.bool,
  setFieldTouched: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  value: PropTypes.string,
};

RichInputFieldControl.defaultProps = {
  className: undefined,
  disabled: false,
  editor: undefined,
  editorConfig: undefined,
  error: false,
  formikSyncDebounceMs: DEFAULT_FORMIK_SYNC_DEBOUNCE_MS,
  initialValue: "",
  label: "",
  optimized: false,
  required: false,
  value: "",
};

export class RichInputField extends Component {
  renderFormField = (formikBag) => {
    const {
      fieldPath,
      label,
      required,
      className,
      editor,
      editorConfig,
      disabled,
      optimized,
      formikSyncDebounceMs,
    } = this.props;
    const value = getIn(formikBag.form.values, fieldPath, "");
    const initialValue = getIn(formikBag.form.initialValues, fieldPath, "");
    const touched = getIn(formikBag.form.touched, fieldPath, "");
    const error =
      (getIn(formikBag.form.errors, fieldPath, false) && touched) ||
      // We check if initialValue changed to display the initialError,
      // otherwise it would be displayed despite updating the field
      (initialValue === value && getIn(formikBag.form.initialErrors, fieldPath, false));

    return (
      <RichInputFieldControl
        className={className}
        disabled={disabled}
        editor={editor}
        editorConfig={editorConfig}
        error={error}
        fieldPath={fieldPath}
        formikSyncDebounceMs={formikSyncDebounceMs}
        initialValue={initialValue}
        label={label}
        optimized={optimized}
        required={required}
        setFieldTouched={formikBag.form.setFieldTouched}
        setFieldValue={formikBag.form.setFieldValue}
        value={value}
      />
    );
  };

  render() {
    const { optimized, fieldPath, helpText } = this.props;
    const FormikField = optimized ? FastField : Field;

    return (
      <>
        <FormikField id={fieldPath} name={fieldPath} component={this.renderFormField} />
        {helpText && <label className="helptext">{helpText}</label>}
      </>
    );
  }
}

RichInputField.propTypes = {
  className: PropTypes.string,
  editor: PropTypes.elementType,
  fieldPath: PropTypes.string.isRequired,
  formikSyncDebounceMs: PropTypes.number,
  optimized: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  required: PropTypes.bool,
  editorConfig: PropTypes.object,
  disabled: PropTypes.bool,
  helpText: PropTypes.string,
};

RichInputField.defaultProps = {
  className: "invenio-rich-input-field",
  optimized: false,
  required: false,
  label: "",
  editor: undefined,
  editorConfig: undefined,
  disabled: false,
  helpText: undefined,
  formikSyncDebounceMs: DEFAULT_FORMIK_SYNC_DEBOUNCE_MS,
};
