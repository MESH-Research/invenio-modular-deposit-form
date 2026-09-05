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
// Stock uses relative paths into `invenio_rdm_records`. Here, the same symbols are imported via
// `@js/invenio_rdm_records/...` so the bundler resolves them from the installed package.
//
// Behavioral changes vs stock:
// - `ReservePIDBtn` receives `fieldError={getFieldErrorsForDisplay(form, fieldPath, field)}`
//   instead of `getFieldErrors`, and the parent passes `field` so error visibility matches
//   `TextField.js` rules (see `./fieldErrorsForDisplay.js`).
// - Reserve / discard dispatch `reservePID` / `discardPID` directly (same thunks as
//   `DepositBootstrap`) instead of `setSubmitContext` + `formik.handleSubmit`, so Formik does
//   not run full submit validation or mark all fields touched for those actions.
// - Before those dispatches, `valuesWithLinkFallbacks` merges `links` from Redux / Formik
//   initial values when Formik values lost them (e.g. after localStorage recovery).
// - Reserve / discard share the same Formik error mapping (403 session message, object vs
//   string errors, fieldPath fallback) because they no longer go through DepositBootstrap.
//
// JSX structure (managed identifier display, reserve/unreserve buttons) matches stock.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { connect } from "react-redux";
import { ReservePIDBtn } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/PIDField/components/ReservePIDBtn";
import { UnreservePIDBtn } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/PIDField/components/UnreservePIDBtn";
import { discardPID, reservePID } from "@js/invenio_rdm_records/src/deposit/state/actions";
import {
  DISCARD_PID_STARTED,
  RESERVE_PID_STARTED,
} from "@js/invenio_rdm_records/src/deposit/state/types";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
// import { valuesWithLinkFallbacks } from "../../../../helpers/valuesWithLinkFallbacks";
import { getFieldErrorsForDisplay } from "./fieldErrorsForDisplay";

class ManagedIdentifierComponent extends Component {
  /**
   * Map a reserve/discard thunk failure onto Formik errors.
   *
   * @param {object} error - Thrown value from the deposit PID thunk
   * @param {object} formik - Formik bag
   */
  handlePidActionError(error, formik) {
    const message =
      error.errors?.status === 403
        ? i18next.t("Session expired. Please refresh the page to log in.")
        : (error.errors?.message ?? error.errors);
    if (message && typeof message === "object") {
      formik.setErrors({ ...formik.errors, ...message });
      return;
    }
    const stringMessage =
      message ?? i18next.t("Something went wrong. Refresh the page or contact user support.");
    formik.setErrors({
      ...formik.errors,
      message: stringMessage,
      [this.props.fieldPath]: stringMessage,
    });
  }

  handleReservePID = async (event, formik) => {
    event.preventDefault();
    event.stopPropagation();
    const { pidType, reservePID: reservePIDAction } = this.props;
    try {
      await reservePIDAction(formik.values, { pidType });
    } catch (error) {
      this.handlePidActionError(error, formik);
    }
  };

  handleDiscardPID = async (event, formik) => {
    event.preventDefault();
    event.stopPropagation();
    const { discardPID: discardPIDAction, pidType } = this.props;
    try {
      await discardPIDAction(formik.values, { pidType });
    } catch (error) {
      this.handlePidActionError(error, formik);
    }
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
      id,
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
        loading={actionState === RESERVE_PID_STARTED && actionStateExtra.pidType === pidType}
        handleReservePID={this.handleReservePID}
        fieldError={getFieldErrorsForDisplay(form, fieldPath, field)}
      />
    );

    const UnreserveBtn = (
      <UnreservePIDBtn
        disabled={disabled}
        label={btnLabelDiscardPID}
        handleDiscardPID={this.handleDiscardPID}
        loading={actionState === DISCARD_PID_STARTED && actionStateExtra.pidType === pidType}
        pidType={pidType}
      />
    );

    return (
      <>
        <Form.Group id={id} inline className="ml-0" aria-describedby={`${id}-helptext`}>
          {hasIdentifier ? (
            <Form.Field className="mb-0">
              <label>{identifier}</label>
            </Form.Field>
          ) : null}

          {identifier ? UnreserveBtn : ReserveBtn}
        </Form.Group>
        {helpText && (
          <div id={`${id}-helptext`} className="helptext">
            {helpText}
          </div>
        )}
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
  discardPID: PropTypes.func.isRequired,
  reservePID: PropTypes.func.isRequired,
  recordLinks: PropTypes.object,
};

ManagedIdentifierComponent.defaultProps = {
  disabled: false,
  field: undefined,
  helpText: null,
  actionState: "",
  actionStateExtra: {},
  recordLinks: undefined,
};

const mapStateToProps = (state) => ({
  actionState: state.deposit.actionState,
  actionStateExtra: state.deposit.actionStateExtra,
  recordLinks: state.deposit.record?.links,
});

const mapDispatchToProps = (dispatch) => ({
  discardPID: (values, { pidType }) => dispatch(discardPID(values, { pidType })),
  reservePID: (values, { pidType }) => dispatch(reservePID(values, { pidType })),
});

export const ManagedIdentifierCmp = connect(
  mapStateToProps,
  mapDispatchToProps
)(ManagedIdentifierComponent);
