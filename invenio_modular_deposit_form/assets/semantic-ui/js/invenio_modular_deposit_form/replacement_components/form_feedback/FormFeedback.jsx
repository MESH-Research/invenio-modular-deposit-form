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

import React, { Component, useContext } from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { useStore } from "react-redux";
import { useFormikContext } from "formik"; 
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
import { filterNestedObject } from "../../utils";

const ACTIONS = {
  // Add action state representing purely client-side validation errors
  ["CLIENT_VALIDATION_ERRORS"]: {
    feedback: "negative",
    message: i18next.t("Please fix the issues in"),
  },
  // Add action state representing cleared errors
  ["ERRORS_CLEARED"]: {
    feedback: "positive",
    message: undefined,
  },
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

/**
  * Filter a formik error object based on the currently flagged errors.
  */
function getFlaggedErrors(formUIState, clientErrors) {
  const flaggedClientErrorPaths = formUIState.sectionErrorsFlagged.reduce(function (collected, item) {
    return collected.concat(element.error_fields);
  });
  return filterNestedObject(clientErrors, flaggedClientErrorPaths);
}

/**
  * Filter out validation errors from a nested error object.
  */
function getNonValidationErrors(backendErrors) {
  let nonValidationErrors;
  if (!_isEmpty(backendErrors)) {
    nonValidationErrors = Object.fromEntries(
      Object.entries(backendErrors).filter(
        ([key]) => !["metadata", "access", "pids", "custom_fields"].includes(key)
      )
    );
  }
}

/**
  * React component to display error and warning messages to the user as the form is filled.
  */
const FormFeedback = ({}) => {
  const store = useStore();
  const { actionState, errors: backendErrors, config } = store.getState().deposit;
  const sectionsConfig = config?.formSectionFields;

  // Find currently flagged client errors
  const { errors: clientErrors } = useFormikContext();
  const { formUIState } = useContext(FormUIStateContext) ?? {};
  const flaggedClientErrors = getFlaggedErrors(formUIState, clientErrors); 

  // Distinguish validation errors (that might be fixed since last submission) from
  // backend system errors that will not have been fixed.
  const nonValidationErrors = getNonValidationErrors(backendErrors);

  // We don't display any message if there are no backend errors or flagged frontend errors.
  if (!actionState && _isEmpty(flaggedClientErrors) && _isEmpty(nonValidationErrors)) {
    return null;
  }

  // Combine flagged client-side errors with backend non-validation errors.
  // We don't want to display old server-side validation errors that have been fixed,
  // and we don't want to display client-side errors that aren't yet displayed (e.g., for untouched fields).
  const mergedErrors = mergeNestedObjects(flaggedClientErrors, nonValidationErrors);

  // Update actionState if client validation errors are cleared
  // keep non-validation-error actionState if backendErrors remain
  const effectiveActionState = !_isEmpty(flaggedClientErrors)
    ? "CLIENT_VALIDATION_ERRORS"
    : (
      _isEmpty(nonValidationErrors) &&
      _isEmpty(flaggedClientErrors) &&
      !actionState?.includes("ERROR")
    )
    ? "ERRORS_CLEARED"
    : actionState;

  const { feedback: initialFeedback, message: actionMessage } = _get(ACTIONS, effectiveActionState, {
    feedback: undefined,
    message: undefined,
  });

  const backendErrorMessage = errors.message || errors._schema;
  const displayMessage = actionMessage || backendErrorMessage;

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
            <FormFeedbackSummary errors={mergedErrors} sectionsConfig={sectionsConfig} currentResourceType={currentResourceType} />
          </strong>
        </Grid.Column>
      </Grid>
    </Message>
  );
}

FormFeedback.propTypes = {
  labels: PropTypes.object,
};

FormFeedback.defaultProps = {
  labels: undefined,
};

export { FormFeedback };

