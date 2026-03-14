// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// based on portions of InvenioRDM
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2025 Graz University of Technology.
//
// Invenio Modular Deposit Form and Invenio App RDM are free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { connect } from "react-redux";
import { Grid, Message, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { FormUIStateContext } from "../../FormLayoutContainer";
import { FormFeedbackSummary } from "./FormFeedbackSummary";
import {
  DISCARD_PID_FAILED,
  DRAFT_DELETE_FAILED,
  DRAFT_HAS_VALIDATION_ERRORS,
  DRAFT_PREVIEW_FAILED,
  DRAFT_PUBLISH_FAILED,
  DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_SAVE_FAILED,
  DRAFT_SAVE_SUCCEEDED,
  DRAFT_LOADED_WITH_VALIDATION_ERRORS,
  DRAFT_SUBMIT_REVIEW_FAILED,
  DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS,
  FILE_IMPORT_FAILED,
  FILE_UPLOAD_SAVE_DRAFT_FAILED,
  RESERVE_PID_FAILED,
} from "@js/invenio_rdm_records/src/deposit/state/types";

const ACTIONS = {
  [DRAFT_SAVE_SUCCEEDED]: {
    feedback: "positive",
    message: i18next.t("Record successfully saved."),
  },
  [DRAFT_HAS_VALIDATION_ERRORS]: {
    feedback: "warning",
    message: i18next.t("Record saved with validation feedback in"),
  },
  [DRAFT_LOADED_WITH_VALIDATION_ERRORS]: {
    feedback: "warning",
    message: i18next.t("Draft has validation feedback in"),
  },
  [DRAFT_SAVE_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "The draft was not saved. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PUBLISH_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "The draft was not published. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS]: {
    feedback: "negative",
    message: i18next.t(
      "The draft was not published. Record saved with validation feedback in"
    ),
  },
  [DRAFT_SUBMIT_REVIEW_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "The draft was not submitted for review. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS]: {
    feedback: "negative",
    message: i18next.t(
      "The draft was not submitted for review. Record saved with validation feedback in"
    ),
  },
  [DRAFT_DELETE_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "Draft deletion failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PREVIEW_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "Draft preview failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [RESERVE_PID_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "Identifier reservation failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [DISCARD_PID_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "Identifier could not be discarded. Please try again. If the problem persists, contact user support."
    ),
  },
  [FILE_UPLOAD_SAVE_DRAFT_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "Draft save failed before file upload. Please try again. If the problem persists, contact user support."
    ),
  },
  [FILE_IMPORT_FAILED]: {
    feedback: "negative",
    message: i18next.t(
      "Files import from the previous version failed. Please try again. If the problem persists, contact user support."
    ),
  },
};

const feedbackConfig = {
  positive: { icon: "check", type: "positive" },
  suggestive: { icon: "info circle", type: "info" },
  negative: { icon: "times circle", type: "negative" },
  warning: { icon: "exclamation triangle", type: "warning" },
};

/** True when formUIState has at least one flagged section with validation errors. */
function hasCurrentValidationErrors(formUIState) {
  const list = formUIState?.sectionErrorsFlagged ?? [];
  return list.some((entry) => (entry?.error_fields?.length ?? 0) > 0);
}

class DisconnectedFormFeedback extends Component {
  static contextType = FormUIStateContext;

  constructor(props) {
    super(props);
    this.labels = {
      ...props.labels,
    };
  }

  render() {
    const { errors: errorsProp, actionState, sectionsConfig, currentResourceType } = this.props;
    const formUIState = this.context?.formUIState ?? {};
    const errors = errorsProp || {};

    const { feedback: initialFeedback, message: actionMessage } = _get(ACTIONS, actionState, {
      feedback: undefined,
      message: undefined,
    });

    const hasCurrentErrors = hasCurrentValidationErrors(formUIState);
    const validationErrorsMessage = i18next.t(
      "Please fix the validation errors in the following sections:"
    );
    const backendErrorMessage = errors.message || errors._schema;

    // Prefer dynamic message when form has current validation errors; otherwise action or backend message
    const displayMessage = hasCurrentErrors
      ? validationErrorsMessage
      : backendErrorMessage || actionMessage;

    if (!displayMessage) {
      return null;
    }

    const noSeverityChecksWithErrors = Object.values(errors).every(
      (severityObject) => severityObject?.severity !== "error"
    );

    const feedback =
      hasCurrentErrors
        ? "warning"
        : _isEmpty(errors) && noSeverityChecksWithErrors
          ? "suggestive"
          : initialFeedback;

    const { icon, type } = feedbackConfig[feedback] || feedbackConfig["warning"];

    return (
      <Message
        visible
        {...{ [type]: true }}
        className="flashed top attached"
        id={type + "-feedback-div"}
      >
        <Grid container>
          <Grid.Column width={15} textAlign="left">
            <strong>
              <Icon name={icon} middle aligned /> {displayMessage}
              <FormFeedbackSummary errors={errors} sectionsConfig={sectionsConfig} currentResourceType={currentResourceType} />
            </strong>
          </Grid.Column>
        </Grid>
      </Message>
    );
  }
}

DisconnectedFormFeedback.propTypes = {
  errors: PropTypes.object,
  actionState: PropTypes.string,
  labels: PropTypes.object,
  sectionsConfig: PropTypes.array,
  currentResourceType: PropTypes.string,
};

DisconnectedFormFeedback.defaultProps = {
  errors: undefined,
  actionState: undefined,
  labels: undefined,
  sectionsConfig: undefined,
  currentResourceType: undefined,
};

const mapStateToProps = (state) => ({
  actionState: state.deposit.actionState,
  errors: state.deposit.errors,
});

const ConnectedFormFeedback = connect(
  mapStateToProps,
  null
)(DisconnectedFormFeedback);

export { DisconnectedFormFeedback, ConnectedFormFeedback as FormFeedback };

