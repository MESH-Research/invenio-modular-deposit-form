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

import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import React from "react";
import { useStore } from "react-redux";
import { Icon, Message } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import {
  DISCARD_PID_FAILED,
  DRAFT_DELETE_FAILED,
  DRAFT_DELETE_STARTED,
  DRAFT_HAS_VALIDATION_ERRORS,
  DRAFT_PREVIEW_FAILED,
  DRAFT_PREVIEW_STARTED,
  DRAFT_PUBLISH_FAILED,
  DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_PUBLISH_STARTED,
  DRAFT_LOADED_WITH_VALIDATION_ERRORS,
  DRAFT_SAVE_FAILED,
  DRAFT_SAVE_SUCCEEDED,
  DRAFT_SUBMIT_REVIEW_FAILED,
  DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_SUBMIT_REVIEW_STARTED,
  FILE_IMPORT_FAILED,
  FILE_UPLOAD_SAVE_DRAFT_FAILED,
  RESERVE_PID_FAILED,
} from "@js/invenio_rdm_records/src/deposit/state/types";
import { RECORD_FIELD_ERROR_ROOTS } from "../../../constants";
import { useFormUIState } from "../../../FormUIStateManager.jsx";
import { FormFeedbackSummary } from "./form_feedback_components/FormFeedbackSummary";

/** Synthetic FormFeedback action states (not a Redux deposit action type). */
const CLIENT_VALIDATION_ERRORS = "CLIENT_VALIDATION_ERRORS";
const CLIENT_VALIDATION_WARNINGS = "CLIENT_VALIDATION_WARNINGS";
const CLIENT_VALIDATION_MESSAGES = "CLIENT_VALIDATION_MESSAGES";
const ERRORS_CLEARED = "ERRORS_CLEARED";

const ACTIONS = {
  // Add action state representing purely client-side validation errors
  [CLIENT_VALIDATION_ERRORS]: {
    feedback: "error",
    message: i18next.t("Before submitting, please fix the issues in"),
  },
  [CLIENT_VALIDATION_WARNINGS]: {
    feedback: "warning",
    message: i18next.t("Note the warnings in"),
  },
  [CLIENT_VALIDATION_MESSAGES]: {
    feedback: "info",
    message: i18next.t("Note the messages in"),
  },
  // Add action state representing cleared errors
  [ERRORS_CLEARED]: {
    feedback: "positive",
    message: undefined,
  },
  [DRAFT_SAVE_SUCCEEDED]: {
    feedback: "positive",
    message: i18next.t("Record successfully saved."),
  },
  // Redux never dispatches *Succeeded for publish/submit/preview/delete: the deposit
  // thunks call window.location.replace on success. Only *_STARTED remains visible
  // until the page unloads — surface copy for that gap.
  [DRAFT_PUBLISH_STARTED]: {
    feedback: "positive",
    message: i18next.t("Publishing your record… You will be redirected when this is complete."),
  },
  [DRAFT_SUBMIT_REVIEW_STARTED]: {
    feedback: "positive",
    message: i18next.t("Submitting for review… You will be redirected when this is complete."),
  },
  [DRAFT_PREVIEW_STARTED]: {
    feedback: "positive",
    message: i18next.t("Opening preview… You will be redirected when this is complete."),
  },
  [DRAFT_DELETE_STARTED]: {
    feedback: "warning",
    message: i18next.t("Deleting this draft… You will be redirected when this is complete."),
  },
  [DRAFT_HAS_VALIDATION_ERRORS]: {
    feedback: "warning",
    message: i18next.t("Record saved with validation feedback in"),
  },
  [DRAFT_LOADED_WITH_VALIDATION_ERRORS]: {
    feedback: "error",
    message: i18next.t("Draft has validation feedback in"),
  },
  [DRAFT_SAVE_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "The draft was not saved. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PUBLISH_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "The draft was not published. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS]: {
    feedback: "error",
    message: i18next.t("The draft was not published. Record saved with validation feedback in"),
  },
  [DRAFT_SUBMIT_REVIEW_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "The draft was not submitted for review. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS]: {
    feedback: "error",
    message: i18next.t(
      "The draft was not submitted for review. Record saved with validation feedback in"
    ),
  },
  [DRAFT_DELETE_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "Draft deletion failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PREVIEW_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "Draft preview failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [RESERVE_PID_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "Identifier reservation failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [DISCARD_PID_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "Identifier could not be discarded. Please try again. If the problem persists, contact user support."
    ),
  },
  [FILE_UPLOAD_SAVE_DRAFT_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "Draft save failed before file upload. Please try again. If the problem persists, contact user support."
    ),
  },
  [FILE_IMPORT_FAILED]: {
    feedback: "error",
    message: i18next.t(
      "Files import from the previous version failed. Please try again. If the problem persists, contact user support."
    ),
  },
};

const SEVERITY_ORDER = ["positive", "info", "warning", "error"];

const VISIBLE_ACTION_STATES = [
  CLIENT_VALIDATION_ERRORS,
  CLIENT_VALIDATION_WARNINGS,
  CLIENT_VALIDATION_MESSAGES,
  DRAFT_SAVE_SUCCEEDED,
  DRAFT_HAS_VALIDATION_ERRORS,
  DRAFT_SAVE_FAILED,
  DRAFT_PUBLISH_FAILED,
  DRAFT_DELETE_FAILED,
  DRAFT_PREVIEW_FAILED,
  DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_LOADED_WITH_VALIDATION_ERRORS,
  DRAFT_SUBMIT_REVIEW_FAILED,
  DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS,
  FILE_IMPORT_FAILED,
  DRAFT_PUBLISH_STARTED,
  DRAFT_SUBMIT_REVIEW_STARTED,
  DRAFT_PREVIEW_STARTED,
  DRAFT_DELETE_STARTED,
  FILE_UPLOAD_SAVE_DRAFT_FAILED,
];

const SUCCESS_ACTION_STATES = [
  DRAFT_SAVE_SUCCEEDED,
  DRAFT_PUBLISH_STARTED,
  DRAFT_SUBMIT_REVIEW_STARTED,
  DRAFT_PREVIEW_STARTED,
  DRAFT_DELETE_STARTED,
];

const VISIBLE_ERROR_ACTION_STATES = [
  CLIENT_VALIDATION_ERRORS,
  DRAFT_SAVE_FAILED,
  DRAFT_HAS_VALIDATION_ERRORS,
  DRAFT_LOADED_WITH_VALIDATION_ERRORS,
  DRAFT_PUBLISH_FAILED,
  DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_SUBMIT_REVIEW_FAILED,
  DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_PREVIEW_FAILED,
  DRAFT_DELETE_FAILED,
  FILE_UPLOAD_SAVE_DRAFT_FAILED,
  FILE_IMPORT_FAILED,
];

const WITH_VALIDATION_TO_PLAIN = {
  [DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS]: DRAFT_PUBLISH_FAILED,
  [DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS]: DRAFT_SUBMIT_REVIEW_FAILED,
};

export const feedbackConfig = {
  positive: { icon: "check", type: "positive" },
  info: { icon: "info circle", type: "info" },
  error: { icon: "times circle", type: "negative" },
  warning: { icon: "exclamation triangle", type: "warning" },
};

function getFlaggedErrors(formUIState) {
  const flaggedClientErrors = {};
  const flaggedClientWarnings = {};
  const flaggedClientInfo = {};
  for (const entry of formUIState?.sectionErrorsFlagged ?? []) {
    for (const path of entry?.error_fields ?? []) {
      flaggedClientErrors[path] = { severity: "error" };
    }
    for (const path of entry?.warning_fields ?? []) {
      flaggedClientWarnings[path] = { severity: "warning" };
    }
    for (const path of entry?.info_fields ?? []) {
      flaggedClientInfo[path] = { severity: "info" };
    }
  }
  return { flaggedClientErrors, flaggedClientWarnings, flaggedClientInfo };
}

function getNonValidationErrors(backendErrors) {
  if (_isEmpty(backendErrors)) return undefined;
  return Object.fromEntries(
    Object.entries(backendErrors).filter(([key]) => !RECORD_FIELD_ERROR_ROOTS.includes(key))
  );
}

function getEffectiveActionState(
  actionState,
  flaggedClientErrors,
  flaggedClientWarnings,
  flaggedClientInfo,
  nonValidationErrors
) {
  if (!_isEmpty(flaggedClientErrors)) return CLIENT_VALIDATION_ERRORS;
  if (_isEmpty(nonValidationErrors) && !SUCCESS_ACTION_STATES.includes(actionState)) {
    if (VISIBLE_ERROR_ACTION_STATES.includes(actionState)) {
      const plainBackendActionState = WITH_VALIDATION_TO_PLAIN[actionState];
      return plainBackendActionState ?? actionState;
    } else if (!_isEmpty(flaggedClientWarnings)) {
      return CLIENT_VALIDATION_WARNINGS;
    } else if (!_isEmpty(flaggedClientInfo)) {
      return CLIENT_VALIDATION_MESSAGES;
    } else {
      return "ERRORS_CLEARED";
    }
  }
  const plainBackendActionState = WITH_VALIDATION_TO_PLAIN[actionState];
  return plainBackendActionState ?? actionState;
}

function getHighestSeverityLevel(formUIState, initialFeedbackType) {
  let highestClientSeverity = initialFeedbackType;
  for (const severity of SEVERITY_ORDER) {
    if (
      (formUIState?.sectionErrorsFlagged ?? []).some(
        (entry) => (entry?.[`${severity}_fields`]?.length ?? 0) > 0
      )
    ) {
      if (SEVERITY_ORDER.indexOf(severity) > SEVERITY_ORDER.indexOf(highestClientSeverity)) {
        highestClientSeverity = severity;
      }
    }
  }
  return highestClientSeverity;
}

function noMessagesPresent(
  actionState,
  flaggedClientErrors,
  flaggedClientWarnings,
  flaggedClientInfo,
  nonValidationErrors
) {
  return (
    !actionState &&
    _isEmpty(flaggedClientErrors) &&
    _isEmpty(flaggedClientWarnings) &&
    _isEmpty(flaggedClientInfo) &&
    _isEmpty(nonValidationErrors)
  );
}

/**
 * React component to display error and warning messages to the user as the form is filled.
 *
 * @param {object} props
 * @param {string} [props.fieldPath] — Passed by Overridable / layout; unused here (sidebar message block).
 * @param {boolean} [props.hideMessageIcon=true] — When false, shows the Semantic UI `Message` leading icon from `feedbackConfig` for the effective severity. When true (default), the icon is omitted for a compact sidebar.
 * @param {object} [props.labels] — Reserved for custom error labels (align with stock API).
 * @param {string} [props.className] — Extra classes appended to the rendered `<Message>` (forwarded from the layout config so callers can apply responsive grid classes like `sixteen wide column mobile tablet only`).
 * @param {string} [props.classnames] — Alias for `className` to match the layout config convention used elsewhere in this package.
 */
const FormFeedback = ({
  fieldPath: _fieldPath,
  hideMessageIcon,
  labels: _labels,
  className,
  classnames,
}) => {
  const store = useStore();
  const { actionState, errors: backendErrors, config } = store.getState().deposit;
  const sectionsConfig = config?.formSectionFields;

  const { formUIState } = useFormUIState();
  const { flaggedClientErrors, flaggedClientWarnings, flaggedClientInfo } =
    getFlaggedErrors(formUIState);
  const nonValidationErrors = getNonValidationErrors(backendErrors);

  if (
    noMessagesPresent(
      actionState,
      flaggedClientErrors,
      flaggedClientWarnings,
      flaggedClientInfo,
      nonValidationErrors
    )
  ) {
    return null;
  }

  let effectiveActionState = getEffectiveActionState(
    actionState,
    flaggedClientErrors,
    flaggedClientWarnings,
    flaggedClientInfo,
    nonValidationErrors
  );
  // If the effective action state is not visible, return null.
  if (
    Object.keys(ACTIONS).includes(effectiveActionState) &&
    !VISIBLE_ACTION_STATES.includes(effectiveActionState)
  ) {
    return null;
  }

  const { feedback: initialFeedbackType, message: actionMessage } = _get(
    ACTIONS,
    effectiveActionState,
    {
      feedback: undefined,
      message: undefined,
    }
  );

  // If no action message is present, still pass any backend error message if it exists.
  const backendErrorMessage = backendErrors?.message || backendErrors?._schema;
  const displayMessage = actionMessage || backendErrorMessage;
  if (!displayMessage) {
    return null;
  }

  // Get the highest client-side severity level if there is one
  const highestClientSeverityLevel = getHighestSeverityLevel(formUIState, initialFeedbackType);
  const feedbackType =
    SEVERITY_ORDER[
      Math.max(
        SEVERITY_ORDER.indexOf(highestClientSeverityLevel),
        SEVERITY_ORDER.indexOf(initialFeedbackType)
      )
    ];

  const { icon, type } = feedbackConfig[feedbackType] || feedbackConfig["warning"];

  return (
    <Message
      visible
      {...{ [type]: true }}
      className={["flashed pb-15", className, classnames].filter(Boolean).join(" ")}
      icon={!hideMessageIcon}
      id={type + "-feedback-div"}
    >
      {!hideMessageIcon ? <Icon name={icon} /> : null}
      <Message.Header className="rel-mt-1 rel-ml-1">{displayMessage}</Message.Header>
      {(!_isEmpty(flaggedClientErrors) ||
        !_isEmpty(flaggedClientWarnings) ||
        !_isEmpty(flaggedClientInfo)) && (
        <Message.List className="mt-15 mb-0 rel-ml-1">
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
  fieldPath: PropTypes.string,
  hideMessageIcon: PropTypes.bool,
  labels: PropTypes.object,
  className: PropTypes.string,
  classnames: PropTypes.string,
};

FormFeedback.defaultProps = {
  fieldPath: undefined,
  hideMessageIcon: true,
  labels: undefined,
  className: undefined,
  classnames: undefined,
};

export { FormFeedback };
