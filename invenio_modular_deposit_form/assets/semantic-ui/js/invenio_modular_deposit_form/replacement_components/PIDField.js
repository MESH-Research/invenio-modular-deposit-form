// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { FastField, Field, getIn } from "formik";
import _debounce from "lodash/debounce";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { FieldLabel } from "react-invenio-forms";
import { connect } from "react-redux";
import { Form, Popup, Radio } from "semantic-ui-react";
// import {
//   DepositFormSubmitActions,
//   DepositFormSubmitContext,
// } from "@js/invenio_rdm_records";
// } from "../../api/DepositFormSubmitContext";
// import { DISCARD_PID_STARTED, RESERVE_PID_STARTED
// } from "../../state/types";

const DepositFormSubmitActions = {
  SAVE: "SAVE",
  PUBLISH: "PUBLISH",
  PUBLISH_WITHOUT_COMMUNITY: "PUBLISH_WITHOUT_COMMUNITY",
  PREVIEW: "PREVIEW",
  DELETE: "DELETE",
  RESERVE_PID: "RESERVE_PID",
  DISCARD_PID: "DISCARD_PID",
  SUBMIT_REVIEW: "SUBMIT_REVIEW",
};

const DepositFormSubmitContext = React.createContext({
  setSubmitContext: undefined,
});

const PROVIDER_EXTERNAL = "external";
const UPDATE_PID_DEBOUNCE_MS = 200;
const DISCARD_PID_STARTED = "DISCARD_PID_STARTED";
const RESERVE_PID_STARTED = "RESERVE_PID_STARTED";

const getFieldErrors = (form, fieldPath) => {
  return (
    getIn(form.errors, fieldPath, null) ||
    getIn(form.initialErrors, fieldPath, null)
  );
};

/**
 * Button component to reserve a PID.
 */
class ReservePIDBtn extends Component {
  render() {
    const { disabled, handleReservePID, label, loading } = this.props;
    return (
      <Field>
        {({ form: formik }) => (
          <Form.Button
            className="positive"
            size="mini"
            loading={loading}
            disabled={disabled || loading}
            onClick={(e) => handleReservePID(e, formik)}
            content={label}
          />
        )}
      </Field>
    );
  }
}

ReservePIDBtn.propTypes = {
  disabled: PropTypes.bool,
  handleReservePID: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

ReservePIDBtn.defaultProps = {
  disabled: false,
  loading: false,
};

/**
 * Button component to unreserve a PID.
 */
class UnreservePIDBtn extends Component {
  render() {
    const { disabled, handleDiscardPID, label, loading } = this.props;
    return (
      <Popup
        content={label}
        trigger={
          <Field>
            {({ form: formik }) => (
              <Form.Button
                disabled={disabled || loading}
                loading={loading}
                icon="close"
                onClick={(e) => handleDiscardPID(e, formik)}
                size="mini"
              />
            )}
          </Field>
        }
      />
    );
  }
}

UnreservePIDBtn.propTypes = {
  disabled: PropTypes.bool,
  handleDiscardPID: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

UnreservePIDBtn.defaultProps = {
  disabled: false,
  loading: false,
};

/**
 * Manage radio buttons choices between managed
 * and unmanaged PID.
 */
class ManagedUnmanagedSwitch extends Component {
  handleChange = (e, { value }) => {
    const { onManagedUnmanagedChange } = this.props;
    const isManagedSelected = value === "managed";
    onManagedUnmanagedChange(isManagedSelected);
  };

  render() {
    const { disabled, isManagedSelected, fieldPath, pidLabel } = this.props;

    return (
      <Form.Group inline>
        <Form.Field className="pt-5 mr-15">
          <FieldLabel
            htmlFor={fieldPath}
            icon={""}
            label={i18next.t("Do you have a {{pidLabel}} for this work?", {
              pidLabel: pidLabel,
            })}
          />
        </Form.Field>
        <Form.Field width={2}>
          <Radio
            label={i18next.t("Yes")}
            name="radioGroup"
            value="unmanaged"
            disabled={disabled}
            checked={!isManagedSelected}
            onChange={this.handleChange}
          />
        </Form.Field>
        <Form.Field width={2}>
          <Radio
            label={i18next.t("No")}
            name="radioGroup"
            value="managed"
            disabled={disabled}
            checked={isManagedSelected}
            onChange={this.handleChange}
          />
        </Form.Field>
      </Form.Group>
    );
  }
}

ManagedUnmanagedSwitch.propTypes = {
  disabled: PropTypes.bool,
  isManagedSelected: PropTypes.bool.isRequired,
  onManagedUnmanagedChange: PropTypes.func.isRequired,
  pidLabel: PropTypes.string,
};

ManagedUnmanagedSwitch.defaultProps = {
  disabled: false,
  pidLabel: undefined,
};

/**
 * Render identifier field and reserve/unreserve
 * button components for managed PID.
 */
class ManagedIdentifierComponent extends Component {
  static contextType = DepositFormSubmitContext;

  handleReservePID = (event, formik) => {
    const { pidType } = this.props;
    const { setSubmitContext } = this.context;
    setSubmitContext(DepositFormSubmitActions.RESERVE_PID, {
      pidType: pidType,
    });
    formik.handleSubmit(event);
  };

  handleDiscardPID = (event, formik) => {
    const { pidType } = this.props;
    const { setSubmitContext } = this.context;
    setSubmitContext(DepositFormSubmitActions.DISCARD_PID, {
      pidType: pidType,
    });
    formik.handleSubmit(event);
  };

  render() {
    const {
      actionState,
      actionStateExtra,
      btnLabelDiscardPID,
      btnLabelGetPID,
      disabled,
      helpText,
      identifier,
      pidPlaceholder,
      pidType,
      isEditingPublishedRecord,
      form,
    } = this.props;
    const hasIdentifier = identifier !== "";

    const ReserveBtn = (
      <ReservePIDBtn
        disabled={disabled || hasIdentifier}
        label={btnLabelGetPID}
        loading={
          actionState === RESERVE_PID_STARTED &&
          actionStateExtra.pidType === pidType
        }
        handleReservePID={this.handleReservePID}
      />
    );

    const UnreserveBtn = (
      <UnreservePIDBtn
        disabled={disabled}
        label={btnLabelDiscardPID}
        handleDiscardPID={this.handleDiscardPID}
        loading={
          actionState === DISCARD_PID_STARTED &&
          actionStateExtra.pidType === pidType
        }
        pidType={pidType}
      />
    );

    const provider = form.values.pids.doi?.provider;

    return (
      <>
        {
          hasIdentifier ? (
            <Form.Group inline>
              <Form.Field>
                <label>{`https://doi.org/${identifier}`}</label>
              </Form.Field>
            </Form.Group>
          ) : null
          // NOTE: This is a placeholder for the PID field. It is disabled
          // <Form.Field width={4}>
          //   <Form.Input disabled value="" placeholder={pidPlaceholder} width={16} />
          // </Form.Field>
        }

        {/* ALERT: This is the widget to reserve a DOI before registration. It is disabled. */}
        {/* {!isEditingPublishedRecord &&
          <Form.Field>{identifier ? UnreserveBtn : ReserveBtn}</Form.Field>
        }
        {isEditingPublishedRecord ?
        <label className="helptext">A unique identifier for this deposit registered with {provider!=="external" ?
          provider.charAt(0).toUpperCase() + provider.slice(1)
          : "an external provider"}</label>
        :
        helpText && <label className="helptext">{helpText}</label>
        } */}
      </>
    );
  }
}

ManagedIdentifierComponent.propTypes = {
  btnLabelGetPID: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  helpText: PropTypes.string,
  identifier: PropTypes.string.isRequired,
  btnLabelDiscardPID: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  pidType: PropTypes.string.isRequired,
  /* from Redux */
  actionState: PropTypes.string,
  actionStateExtra: PropTypes.object,
};

ManagedIdentifierComponent.defaultProps = {
  disabled: false,
  helpText: null,
  /* from Redux */
  actionState: "",
  actionStateExtra: {},
};

const mapStateToProps = (state) => ({
  actionState: state.deposit.actionState,
  actionStateExtra: state.deposit.actionStateExtra,
});

const ManagedIdentifierCmp = connect(
  mapStateToProps,
  null
)(ManagedIdentifierComponent);

/**
 * Render identifier field to allow user to input
 * the unmanaged PID.
 */
class UnmanagedIdentifierCmp extends Component {
  constructor(props) {
    super(props);

    const { identifier } = props;

    this.state = {
      localIdentifier: identifier,
    };
  }

  componentDidUpdate(prevProps) {
    // called after the form field is updated and therefore re-rendered.
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

  render() {
    const { localIdentifier } = this.state;
    const { form, fieldPath, helpText, pidPlaceholder } = this.props;
    const fieldError = getFieldErrors(form, fieldPath);
    return (
      <>
        {/* // <Form.Group> */}
        <Form.Field error={fieldError}>
          <Form.Input
            onChange={(e, { value }) => this.onChange(value)}
            value={localIdentifier}
            placeholder={pidPlaceholder}
            error={fieldError}
            aria-describedby={`${fieldPath}.help-text`}
          />
        </Form.Field>
        <Form.Field>
          {helpText && (
            <label id={`${fieldPath}.help-text`} className="helptext">
              {helpText}
            </label>
          )}
        </Form.Field>
        {/* // </Form.Group> */}
      </>
    );
  }
}

UnmanagedIdentifierCmp.propTypes = {
  form: PropTypes.object.isRequired,
  fieldPath: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  identifier: PropTypes.string.isRequired,
  onIdentifierChanged: PropTypes.func.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
};

UnmanagedIdentifierCmp.defaultProps = {
  helpText: null,
};

/**
 * Render managed or unamanged PID fields and update
 * Formik form on input changed.
 * The field value has the following format:
 * { 'doi': { identifier: '<value>', provider: '<value>', client: '<value>' } }
 */
class CustomPIDField extends Component {
  constructor(props) {
    super(props);

    const { canBeManaged, canBeUnmanaged } = this.props;
    this.canBeManagedAndUnmanaged = canBeManaged && canBeUnmanaged;

    this.state = {
      isManagedSelected: undefined,
    };
  }

  componentDidMount() {
    if (this.props.form.values.pids?.doi?.identifier == "") {
      this.props.form.setFieldValue("pids", {});
    }
  }

  onExternalIdentifierChanged = (identifier) => {
    const { form, fieldPath } = this.props;
    let pid = {
      identifier: identifier,
      provider: PROVIDER_EXTERNAL,
    };

    if (identifier !== "") {
      this.setState({ isManagedSelected: false });
      this.debounced && this.debounced.cancel();
      this.debounced = _debounce(() => {
        form.setFieldValue(fieldPath, pid);
      }, UPDATE_PID_DEBOUNCE_MS);
      this.debounced();
    } else {
      this.setState({ isManagedSelected: true });
      this.debounced && this.debounced.cancel();
      this.debounced = _debounce(() => {
        form.setFieldValue("pids", {});
      }, UPDATE_PID_DEBOUNCE_MS);
      this.debounced();
    }
  };

  render() {
    const { isManagedSelected } = this.state;
    const {
      btnLabelDiscardPID,
      btnLabelGetPID,
      canBeManaged,
      canBeUnmanaged,
      form,
      fieldPath,
      fieldLabel,
      icon,
      isEditingPublishedRecord,
      managedHelpText,
      pidLabel,
      pidIcon,
      pidPlaceholder,
      required,
      unmanagedHelpText,
      pidType,
      field,
    } = this.props;

    const value = field.value || {};
    const currentIdentifier = value.identifier || "";
    const currentProvider = value.provider || "";

    let managedIdentifier = "",
      unmanagedIdentifier = "";
    if (currentIdentifier !== "") {
      const isProviderExternal = currentProvider === PROVIDER_EXTERNAL;
      managedIdentifier = !isProviderExternal ? currentIdentifier : "";
      unmanagedIdentifier = isProviderExternal ? currentIdentifier : "";
    }

    const hasManagedIdentifier = managedIdentifier !== "";

    const _isManagedSelected =
      isManagedSelected === undefined
        ? hasManagedIdentifier || currentProvider === "" // i.e pids: {}
        : isManagedSelected;

    const fieldError = getFieldErrors(form, fieldPath);
    return (
      <>
        <Form.Field required={false} error={fieldError}>
          <FieldLabel
            htmlFor={fieldPath}
            icon={icon || pidIcon}
            label={fieldLabel}
          />
        </Form.Field>

        {this.canBeManagedAndUnmanaged && managedIdentifier === "" && (
          <ManagedUnmanagedSwitch
            disabled={isEditingPublishedRecord || hasManagedIdentifier}
            isManagedSelected={_isManagedSelected}
            onManagedUnmanagedChange={(userSelectedManaged) => {
              if (userSelectedManaged) {
                form.setFieldValue("pids", {});
              } else {
                this.onExternalIdentifierChanged("");
              }
              this.setState({
                isManagedSelected: userSelectedManaged,
              });
            }}
            pidLabel={pidLabel}
          />
        )}

        {canBeManaged && _isManagedSelected && (
          <ManagedIdentifierCmp
            disabled={isEditingPublishedRecord}
            btnLabelDiscardPID={btnLabelDiscardPID}
            btnLabelGetPID={btnLabelGetPID}
            form={form}
            identifier={managedIdentifier}
            helpText={managedHelpText}
            pidPlaceholder={pidPlaceholder}
            pidType={pidType}
            pidLabel={pidLabel}
            isEditingPublishedRecord={isEditingPublishedRecord}
          />
        )}

        {canBeUnmanaged && !_isManagedSelected && (
          <UnmanagedIdentifierCmp
            identifier={unmanagedIdentifier}
            onIdentifierChanged={(identifier) => {
              this.onExternalIdentifierChanged(identifier);
            }}
            form={form}
            fieldPath={fieldPath}
            pidPlaceholder={pidPlaceholder}
            helpText={unmanagedHelpText}
          />
        )}
      </>
    );
  }
}

CustomPIDField.propTypes = {
  field: PropTypes.object,
  form: PropTypes.object.isRequired,
  btnLabelDiscardPID: PropTypes.string.isRequired,
  btnLabelGetPID: PropTypes.string.isRequired,
  canBeManaged: PropTypes.bool.isRequired,
  canBeUnmanaged: PropTypes.bool.isRequired,
  fieldPath: PropTypes.string.isRequired,
  fieldLabel: PropTypes.string.isRequired,
  isEditingPublishedRecord: PropTypes.bool.isRequired,
  managedHelpText: PropTypes.string,
  pidIcon: PropTypes.string.isRequired,
  pidLabel: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  pidType: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  unmanagedHelpText: PropTypes.string,
};

CustomPIDField.defaultProps = {
  managedHelpText: null,
  unmanagedHelpText: null,
  field: undefined,
};

/**
 * Render the PIDField using a custom Formik component
 */
export class PIDField extends Component {
  constructor(props) {
    super(props);

    this.validatePropValues();
  }

  validatePropValues = () => {
    const { canBeManaged, canBeUnmanaged, fieldPath } = this.props;

    if (!canBeManaged && !canBeUnmanaged) {
      throw Error(`${fieldPath} must be managed, unmanaged or both.`);
    }
  };

  render() {
    const { fieldPath } = this.props;

    return (
      <FastField name={fieldPath} component={CustomPIDField} {...this.props} />
    );
  }
}

PIDField.propTypes = {
  btnLabelDiscardPID: PropTypes.string,
  btnLabelGetPID: PropTypes.string,
  canBeManaged: PropTypes.bool,
  canBeUnmanaged: PropTypes.bool,
  fieldPath: PropTypes.string.isRequired,
  fieldLabel: PropTypes.string.isRequired,
  isEditingPublishedRecord: PropTypes.bool.isRequired,
  managedHelpText: PropTypes.string,
  pidIcon: PropTypes.string,
  pidLabel: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string,
  pidType: PropTypes.string.isRequired,
  required: PropTypes.bool,
  unmanagedHelpText: PropTypes.string,
};

PIDField.defaultProps = {
  btnLabelDiscardPID: "Discard",
  btnLabelGetPID: "Reserve",
  canBeManaged: true,
  canBeUnmanaged: true,
  managedHelpText: null,
  pidIcon: "barcode",
  pidPlaceholder: "",
  required: false,
  unmanagedHelpText: null,
};
