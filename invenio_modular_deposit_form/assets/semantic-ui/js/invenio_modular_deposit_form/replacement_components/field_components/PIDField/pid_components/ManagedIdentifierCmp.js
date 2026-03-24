// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Upstream: `.../PIDField/components/ManagedIdentifierCmp.js`
//
// Import path changes (required for this package):
// Stock uses relative paths into `invenio_rdm_records` (`../../../../api/DepositFormSubmitContext`,
// `../../../../state/types`, `./ReservePIDBtn`, `./UnreservePIDBtn`). Those paths are only
// valid inside the upstream package tree. Here, the same symbols are imported via
// `@js/invenio_rdm_records/...` so the bundler resolves them from the installed package.
//
// Behavioral change:
// - `ReservePIDBtn` receives `fieldError={getFieldErrorsForDisplay(form, fieldPath, field)}`
//   instead of `getFieldErrors`, and the parent passes `field` so error visibility matches
//   `TextField.js` rules (see `./fieldErrorsForDisplay.js`).
//
// JSX structure (managed identifier display, reserve/unreserve buttons) matches stock.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { connect } from "react-redux";
import { ReservePIDBtn } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/PIDField/components/ReservePIDBtn";
import { UnreservePIDBtn } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/PIDField/components/UnreservePIDBtn";
import {
  DepositFormSubmitActions,
  DepositFormSubmitContext,
} from "@js/invenio_rdm_records/src/deposit/api/DepositFormSubmitContext";
import {
  DISCARD_PID_STARTED,
  RESERVE_PID_STARTED,
} from "@js/invenio_rdm_records/src/deposit/state/types";
import { getFieldErrorsForDisplay } from "./fieldErrorsForDisplay";

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
      field,
      helpText,
      identifier,
      pidPlaceholder,
      pidType,
      form,
      fieldPath,
    } = this.props;
    const hasIdentifier = identifier !== "";

    const ReserveBtn = (
      <ReservePIDBtn
        disabled={disabled || hasIdentifier}
        label={btnLabelGetPID}
        loading={
          actionState === RESERVE_PID_STARTED && actionStateExtra.pidType === pidType
        }
        handleReservePID={this.handleReservePID}
        fieldError={getFieldErrorsForDisplay(form, fieldPath, field)}
      />
    );

    const UnreserveBtn = (
      <UnreservePIDBtn
        disabled={disabled}
        label={btnLabelDiscardPID}
        handleDiscardPID={this.handleDiscardPID}
        loading={
          actionState === DISCARD_PID_STARTED && actionStateExtra.pidType === pidType
        }
        pidType={pidType}
      />
    );

    return (
      <>
        <Form.Group inline>
          {hasIdentifier ? (
            <Form.Field>
              <label>{identifier}</label>
            </Form.Field>
          ) : (
            <Form.Field width={4}>
              <Form.Input disabled value="" placeholder={pidPlaceholder} width={16} />
            </Form.Field>
          )}

          <Form.Field>{identifier ? UnreserveBtn : ReserveBtn}</Form.Field>
        </Form.Group>
        {helpText && <label className="helptext">{helpText}</label>}
      </>
    );
  }
}

ManagedIdentifierComponent.propTypes = {
  btnLabelGetPID: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  field: PropTypes.object,
  helpText: PropTypes.string,
  identifier: PropTypes.string.isRequired,
  btnLabelDiscardPID: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  pidType: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  fieldPath: PropTypes.string.isRequired,
  actionState: PropTypes.string,
  actionStateExtra: PropTypes.object,
};

ManagedIdentifierComponent.defaultProps = {
  disabled: false,
  field: undefined,
  helpText: null,
  actionState: "",
  actionStateExtra: {},
};

const mapStateToProps = (state) => ({
  actionState: state.deposit.actionState,
  actionStateExtra: state.deposit.actionStateExtra,
});

export const ManagedIdentifierCmp = connect(
  mapStateToProps,
  null
)(ManagedIdentifierComponent);
