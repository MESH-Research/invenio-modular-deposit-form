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
import _set from "lodash/set";
import { useStore } from "react-redux";
import { Grid, List, Message, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { useFormUIState } from "../../FormUIStateManager.jsx";
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
import { RECORD_FIELD_ERROR_ROOTS } from "../../constants";

const WITH_VALIDATION_TO_PLAIN = {
  [DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS]: DRAFT_PUBLISH_FAILED,
  [DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS]: DRAFT_SUBMIT_REVIEW_FAILED,
  [DRAFT_HAS_VALIDATION_ERRORS]: DRAFT_SAVE_FAILED,
  [DRAFT_LOADED_WITH_VALIDATION_ERRORS]: DRAFT_SAVE_FAILED,
};

const ACTIONS = {
  // Add action state representing purely client-side validation errors
  ["CLIENT_VALIDATION_ERRORS"]: {
    feedback: "negative",
    message: i18next.t("Before submitting, please fix the issues in"),
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
    message: i18next.t("The draft was not published. Record saved with validation feedback in"),
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

export const feedbackConfig = {
  positive: { icon: "check", type: "positive" },
  suggestive: { icon: "info circle", type: "info" },
  negative: { icon: "times circle", type: "negative" },
  warning: { icon: "exclamation triangle", type: "warning" },
};

function getFlaggedErrors(formUIState) {
  const result = {};
  for (const entry of formUIState?.sectionErrorsFlagged ?? []) {
    for (const path of entry?.error_fields ?? []) {
      _set(result, path, { severity: "error" });
    }
    for (const path of entry?.warning_fields ?? []) {
      _set(result, path, { severity: "warning" });
    }
    for (const path of entry?.info_fields ?? []) {
      _set(result, path, { severity: "info" });
    }
  }
  return result;
}

function getNonValidationErrors(backendErrors) {
  if (_isEmpty(backendErrors)) return undefined;
  return Object.fromEntries(
    Object.entries(backendErrors).filter(([key]) => !RECORD_FIELD_ERROR_ROOTS.includes(key))
  );
}

function hasErrorSeverityInObject(obj) {
  if (obj == null || typeof obj !== "object") return false;
  if (typeof obj.severity === "string" && obj.severity === "error") return true;
  return Object.values(obj).some((v) => hasErrorSeverityInObject(v));
}

/**
 * React component to display error and warning messages to the user as the form is filled.
 */
const FormFeedback = ({}) => {
  const store = useStore();
  const { actionState, errors: backendErrors, config } = store.getState().deposit;
  const sectionsConfig = config?.formSectionFields;

  const { formUIState } = useFormUIState();
  const flaggedClientErrors = getFlaggedErrors(formUIState);
  const nonValidationErrors = getNonValidationErrors(backendErrors);

  // We don't display any message if there are no backend errors or flagged frontend errors.
  if (!actionState && _isEmpty(flaggedClientErrors) && _isEmpty(nonValidationErrors)) {
    return null;
  }

  // Update the actionState if there are new client-side validation errors or if
  // we have cleared all of the validation errors.
  let effectiveActionState = !_isEmpty(flaggedClientErrors)
    ? "CLIENT_VALIDATION_ERRORS"
    : _isEmpty(nonValidationErrors)
      ? "ERRORS_CLEARED"
      : actionState;
  // Provide a sensical actionState if we've cleared validation errors client side, but there were also
  // non-validation errors.
  if (
    _isEmpty(flaggedClientErrors) &&
    !_isEmpty(nonValidationErrors) &&
    WITH_VALIDATION_TO_PLAIN[actionState]
  ) {
    effectiveActionState = WITH_VALIDATION_TO_PLAIN[actionState];
  }

  const { feedback: initialFeedback, message: actionMessage } = _get(
    ACTIONS,
    effectiveActionState,
    {
      feedback: undefined,
      message: undefined,
    }
  );

  const backendErrorMessage = backendErrors?.message || backendErrors?._schema;
  const displayMessage = actionMessage || backendErrorMessage;

  if (!displayMessage) {
    return null;
  }

  const noSeverityChecksWithErrors =
    !(formUIState?.sectionErrorsFlagged ?? []).some(
      (entry) => (entry?.error_fields?.length ?? 0) > 0
    ) || hasErrorSeverityInObject(nonValidationErrors);

  const feedback = noSeverityChecksWithErrors ? "suggestive" : initialFeedback;

  const { icon, type } = feedbackConfig[feedback] || feedbackConfig["warning"];

  return (
    <Message
      visible
      {...{ [type]: true }}
      className="flashed top attached"
      id={type + "-feedback-div"}
      error
    >
      <Message.Header>{displayMessage}</Message.Header>
      {!_isEmpty(flaggedClientErrors) && (
        <Message.List className="mt-15 mb-10 rel-ml-1">
          <FormFeedbackSummary
            sectionsConfig={sectionsConfig}
            currentResourceType={formUIState?.currentResourceType}
          />
        </Message.List>
      )}
    </Message>
  );
};

FormFeedback.propTypes = {
  labels: PropTypes.object,
};

FormFeedback.defaultProps = {
  labels: undefined,
};

export { FormFeedback };
