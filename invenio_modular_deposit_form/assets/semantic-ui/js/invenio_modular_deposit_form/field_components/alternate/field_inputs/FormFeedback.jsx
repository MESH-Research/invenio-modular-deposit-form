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

import _isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import { Icon, Loader, Message } from "semantic-ui-react";
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
  DRAFT_SAVE_STARTED,
  DRAFT_SAVE_SUCCEEDED,
  DRAFT_SUBMIT_REVIEW_FAILED,
  DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS,
  DRAFT_SUBMIT_REVIEW_STARTED,
  FILE_IMPORT_FAILED,
  FILE_UPLOAD_SAVE_DRAFT_FAILED,
  RESERVE_PID_FAILED,
} from "@js/invenio_rdm_records/src/deposit/state/types";
import { useFormUIState } from "../../../FormUIStateManager.jsx";
import { FadeCollapseStack, useFadeCollapseStack } from "../../../helpers/FadeCollapseStack";
import { FormFeedbackSummary } from "./form_feedback_components/FormFeedbackSummary";

/** How long success/failure toasts stay visible if the user does not edit. */
const EPHEMERAL_TOAST_MS = 5000;
/** Fade/collapse timing for action toasts. */
const ACTION_TOAST_TRANSITION_MS = 400;

/**
 * User-facing copy when the API rejects the request for CSRF reasons
 * (stale tab / expired cookie). Kept until refresh — not ephemeral.
 */
const CSRF_STALE_TAB_MESSAGE = i18next.t(
  "Sorry, your browser tab is stale. For security reasons, please refresh your browser and try again."
);

/**
 * Action toasts are driven only by Redux `deposit.actionState`.
 * Publish/submit/preview/delete have no `*_SUCCEEDED` — on success the thunks navigate away
 * while `*_STARTED` remains; failure replaces it with `*_FAILED`.
 *
 * `ephemeral: true` — success and failure toasts auto-dismiss (timer + Formik edit).
 * Loading toasts (`loading: true`) stay until `actionState` changes (next push hides them).
 */
const ACTION_TOASTS = {
  [DRAFT_SAVE_STARTED]: {
    feedback: "info",
    loading: true,
    message: i18next.t("Saving…"),
  },
  [DRAFT_PUBLISH_STARTED]: {
    feedback: "info",
    loading: true,
    message: i18next.t("Publishing…"),
  },
  [DRAFT_SUBMIT_REVIEW_STARTED]: {
    feedback: "info",
    loading: true,
    message: i18next.t("Submitting for review…"),
  },
  [DRAFT_PREVIEW_STARTED]: {
    feedback: "info",
    loading: true,
    message: i18next.t("Opening preview…"),
  },
  [DRAFT_DELETE_STARTED]: {
    feedback: "info",
    loading: true,
    message: i18next.t("Deleting…"),
  },
  [DRAFT_SAVE_SUCCEEDED]: {
    feedback: "positive",
    ephemeral: true,
    message: i18next.t("Record successfully saved."),
  },
  [DRAFT_HAS_VALIDATION_ERRORS]: {
    feedback: "positive",
    ephemeral: true,
    message: i18next.t("Record successfully saved."),
  },
  [DRAFT_SAVE_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "The draft was not saved. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PUBLISH_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "The draft was not published. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PUBLISH_FAILED_WITH_VALIDATION_ERRORS]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "The draft was not published. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_SUBMIT_REVIEW_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "The draft was not submitted for review. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_SUBMIT_REVIEW_FAILED_WITH_VALIDATION_ERRORS]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "The draft was not submitted for review. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_DELETE_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "Draft deletion failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [DRAFT_PREVIEW_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "Draft preview failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [RESERVE_PID_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "Identifier reservation failed. Please try again. If the problem persists, contact user support."
    ),
  },
  [DISCARD_PID_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "Identifier could not be discarded. Please try again. If the problem persists, contact user support."
    ),
  },
  [FILE_UPLOAD_SAVE_DRAFT_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "Draft save failed before file upload. Please try again. If the problem persists, contact user support."
    ),
  },
  [FILE_IMPORT_FAILED]: {
    feedback: "error",
    ephemeral: true,
    message: i18next.t(
      "Files import from the previous version failed. Please try again. If the problem persists, contact user support."
    ),
  },
};

/**
 * Error intro verb follows the action that would be blocked:
 * draft-save-blocking → saving; else community selected → submitting; else publishing.
 *
 * @param {boolean} hasDraftBlockingClientErrors
 * @param {boolean} hasSelectedCommunity
 * @returns {string}
 */
function getErrorsIntroMessage(hasDraftBlockingClientErrors, hasSelectedCommunity) {
  if (hasDraftBlockingClientErrors) {
    return i18next.t("Before saving, please fix these issues");
  }
  if (hasSelectedCommunity) {
    return i18next.t("Before submitting, please fix these issues");
  }
  return i18next.t("Before publishing, please fix these issues");
}

const VALIDATION_INTROS = {
  warnings: {
    feedback: "warning",
    message: i18next.t("Note the warnings in"),
  },
  info: {
    feedback: "info",
    message: i18next.t("Note the messages in"),
  },
  loaded: {
    feedback: "error",
    message: i18next.t("Draft has validation feedback in"),
  },
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

/**
 * @param {string} actionState
 * @param {object} flaggedClientErrors
 * @param {object} flaggedClientWarnings
 * @param {object} flaggedClientInfo
 * @param {boolean} hasDraftBlockingClientErrors
 * @param {boolean} hasSelectedCommunity
 * @returns {{ feedback: string, message: string } | null}
 */
function getValidationIntro(
  actionState,
  flaggedClientErrors,
  flaggedClientWarnings,
  flaggedClientInfo,
  hasDraftBlockingClientErrors,
  hasSelectedCommunity
) {
  if (!_isEmpty(flaggedClientErrors)) {
    return {
      feedback: "error",
      message: getErrorsIntroMessage(hasDraftBlockingClientErrors, hasSelectedCommunity),
    };
  }
  if (actionState === DRAFT_LOADED_WITH_VALIDATION_ERRORS) return VALIDATION_INTROS.loaded;
  if (!_isEmpty(flaggedClientWarnings)) return VALIDATION_INTROS.warnings;
  if (!_isEmpty(flaggedClientInfo)) return VALIDATION_INTROS.info;
  return null;
}

function hasFlaggedValidation(flaggedClientErrors, flaggedClientWarnings, flaggedClientInfo) {
  return (
    !_isEmpty(flaggedClientErrors) ||
    !_isEmpty(flaggedClientWarnings) ||
    !_isEmpty(flaggedClientInfo)
  );
}

/**
 * Whether Formik values satisfy the first-save prerequisites that unlock Save:
 * a non-blank title, and either uploaded files or metadata-only (`files.enabled === false`).
 * Ignores other fields that may already have defaults (e.g. resource_type, publication_date).
 *
 * @param {object} values - Formik values
 * @returns {boolean}
 */
function hasFirstSavePrerequisites(values) {
  const title = String(values?.metadata?.title ?? "").trim();
  if (!title) {
    return false;
  }
  const filesEnabled = values?.files?.enabled;
  const fileCount = values?.files?.count;
  if (filesEnabled === true && !(fileCount > 0)) {
    return false;
  }
  return true;
}

const INITIAL_SAVE_HINT = {
  feedback: "info",
  message: i18next.t(
    "Before saving, please provide at least a title and uploaded files (or mark the record as metadata-only)."
  ),
};

/**
 * Build the FadeCollapseStack push payload for the current Redux action state,
 * or `null` when there is no toast (caller should dismiss).
 *
 * CSRF backend messages get a fixed stale-tab copy and are never ephemeral.
 *
 * @param {string} actionState
 * @param {object|null|undefined} backendErrors - `state.deposit.errors`
 * @returns {{ props: object, autoHideMs: number|null, meta: object } | null}
 */
function resolveActionToast(actionState, backendErrors) {
  const toastConfig = ACTION_TOASTS[actionState];
  if (!toastConfig) {
    return null;
  }
  const backendMessage = backendErrors?.message || backendErrors?._schema;
  const csrfError =
    toastConfig.feedback === "error" && backendMessage?.toLowerCase().includes("csrf");
  let message = toastConfig.message;
  if (csrfError) {
    message = CSRF_STALE_TAB_MESSAGE;
  } else if (toastConfig.feedback === "error" && backendMessage) {
    message = backendMessage;
  }
  if (!message) {
    return null;
  }
  const ephemeral = csrfError ? false : Boolean(toastConfig.ephemeral);
  return {
    props: {
      feedback: toastConfig.feedback,
      loading: Boolean(toastConfig.loading),
      message,
    },
    autoHideMs: ephemeral ? EPHEMERAL_TOAST_MS : null,
    meta: {
      ephemeral,
      feedback: toastConfig.feedback,
      loading: Boolean(toastConfig.loading),
    },
  };
}

/**
 * Never-saved drafts with no other feedback yet, and missing title/files prerequisites.
 *
 * @param {object} opts
 * @param {string|undefined} opts.recordId
 * @param {string} opts.actionState
 * @param {boolean} opts.hasVisibleActionToast
 * @param {object|null} opts.validationIntro
 * @param {object} opts.values - Formik values
 * @returns {boolean}
 */
function shouldShowInitialSaveHint({
  recordId,
  actionState,
  hasVisibleActionToast,
  validationIntro,
  values,
}) {
  return (
    !recordId &&
    !ACTION_TOASTS[actionState] &&
    !hasVisibleActionToast &&
    !validationIntro &&
    !hasFirstSavePrerequisites(values)
  );
}

/**
 * Dismiss ephemeral toasts on Formik edit: success on `dirty`, errors when values change
 * after the toast appeared (baseline capture).
 *
 * @param {object} opts
 * @param {boolean} opts.dirty
 * @param {object} opts.values
 * @param {Array} opts.items - FadeCollapseStack items
 * @param {Function} opts.dismiss
 */
function useDismissEphemeralToasts({ dirty, values, items, dismiss }) {
  useEffect(() => {
    if (!dirty) {
      return;
    }
    dismiss((item) => item.visible && item.meta?.ephemeral && item.meta?.feedback !== "error");
  }, [dirty, dismiss]);

  const errorBaselineRef = useRef(null);
  useEffect(() => {
    const visibleError = items.find(
      (item) => item.visible && item.meta?.ephemeral && item.meta?.feedback === "error"
    );
    if (!visibleError) {
      errorBaselineRef.current = null;
      return;
    }
    if (errorBaselineRef.current === null) {
      errorBaselineRef.current = { id: visibleError.id, values };
      return;
    }
    if (
      errorBaselineRef.current.id === visibleError.id &&
      !isEqual(values, errorBaselineRef.current.values)
    ) {
      dismiss((item) => item.id === visibleError.id);
      errorBaselineRef.current = null;
    }
  }, [values, items, dismiss]);
}

/**
 * Sidebar feedback: action toast stack (save/publish/…) on top, validation section list below.
 * On never-saved drafts, shows an info hint when title/files prerequisites are unmet and
 * nothing else is displayed yet.
 *
 * @param {object} props
 * @param {string} [props.fieldPath] — Passed by Overridable / layout; unused here.
 * @param {boolean} [props.hideMessageIcon=true] — When false, shows severity icons on messages.
 * @param {object} [props.labels] — Reserved for custom error labels (align with stock API).
 * @param {string} [props.className] — Extra classes on the wrapper.
 * @param {string} [props.classnames] — Alias for `className` (layout config convention).
 */
const FormFeedback = ({
  fieldPath: _fieldPath,
  hideMessageIcon,
  labels: _labels,
  className,
  classnames,
}) => {
  const actionState = useSelector((state) => state.deposit?.actionState);
  const backendErrors = useSelector((state) => state.deposit?.errors);
  const recordId = useSelector((state) => state.deposit?.record?.id);
  const sectionsConfig = useSelector((state) => state.deposit?.config?.formSectionFields);
  const selectedCommunity = useSelector((state) => state.deposit?.editorState?.selectedCommunity);
  const { dirty, values } = useFormikContext();

  const { formUIState } = useFormUIState();
  const { flaggedClientErrors, flaggedClientWarnings, flaggedClientInfo } =
    getFlaggedErrors(formUIState);
  const showValidation = hasFlaggedValidation(
    flaggedClientErrors,
    flaggedClientWarnings,
    flaggedClientInfo
  );

  const { items, push, dismiss, handleExited, durationMs } = useFadeCollapseStack({
    durationMs: ACTION_TOAST_TRANSITION_MS,
  });

  useEffect(() => {
    const toast = resolveActionToast(actionState, backendErrors);
    if (!toast) {
      dismiss();
      return;
    }
    push(toast);
  }, [actionState, backendErrors?.message, backendErrors?._schema, push, dismiss]);

  useDismissEphemeralToasts({ dirty, values, items, dismiss });

  const validationIntro = showValidation
    ? getValidationIntro(
        actionState,
        flaggedClientErrors,
        flaggedClientWarnings,
        flaggedClientInfo,
        Boolean(formUIState?.hasDraftBlockingClientErrors),
        !_isEmpty(selectedCommunity)
      )
    : null;

  const showInitialSaveHint = shouldShowInitialSaveHint({
    recordId,
    actionState,
    hasVisibleActionToast: items.some((item) => item.visible),
    validationIntro,
    values,
  });

  if (!items.length && !validationIntro && !showInitialSaveHint) {
    return null;
  }

  const wrapperClass = ["form-feedback", className, classnames].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass}>
      <FadeCollapseStack
        items={items}
        onExited={handleExited}
        component={ActionToastMessage}
        durationMs={durationMs}
        sharedProps={{ hideMessageIcon }}
      />
      {validationIntro ? (
        <ValidationMessage
          feedback={validationIntro.feedback}
          hideMessageIcon={hideMessageIcon}
          message={validationIntro.message}
          sectionsConfig={sectionsConfig}
          currentResourceType={formUIState?.currentResourceType}
        />
      ) : showInitialSaveHint ? (
        <ActionToastMessage
          feedback={INITIAL_SAVE_HINT.feedback}
          hideMessageIcon={hideMessageIcon}
          message={INITIAL_SAVE_HINT.message}
        />
      ) : null}
    </div>
  );
};

function ActionToastMessage({ feedback, hideMessageIcon, loading, message }) {
  const { icon, type } = feedbackConfig[feedback] || feedbackConfig.warning;
  return (
    <Message
      visible
      {...{ [type]: true }}
      className="flashed pb-15"
      icon={!hideMessageIcon || loading}
      id={`${type}-action-feedback-div`}
    >
      {loading ? (
        <Loader active inline size="small" />
      ) : !hideMessageIcon ? (
        <Icon name={icon} className="mr-0 ml-15 pt-10" />
      ) : null}
      <Message.Content>
        <p className="pt-15 pr-15 pl-15">{message}</p>
      </Message.Content>
    </Message>
  );
}

ActionToastMessage.propTypes = {
  feedback: PropTypes.string.isRequired,
  hideMessageIcon: PropTypes.bool,
  loading: PropTypes.bool,
  message: PropTypes.string.isRequired,
};

function ValidationMessage({
  feedback,
  hideMessageIcon,
  message,
  sectionsConfig,
  currentResourceType,
}) {
  const { icon, type } = feedbackConfig[feedback] || feedbackConfig.warning;
  return (
    <Message
      visible
      {...{ [type]: true }}
      className="flashed pb-15"
      icon={!hideMessageIcon}
      id={`${type}-validation-feedback-div`}
    >
      <Message.Content className="rel-ml-1 mr-15 rel-mt-1">
        <Message.Header className="">{message}</Message.Header>
        <Message.List className="mt-10 mb-0">
          <FormFeedbackSummary
            sectionsConfig={sectionsConfig}
            currentResourceType={currentResourceType}
          />
        </Message.List>
      </Message.Content>
      {!hideMessageIcon ? <Icon name={icon} className="mr-15 ml-0 pt-10" /> : null}
    </Message>
  );
}

ValidationMessage.propTypes = {
  feedback: PropTypes.string.isRequired,
  hideMessageIcon: PropTypes.bool,
  message: PropTypes.string.isRequired,
  sectionsConfig: PropTypes.array,
  currentResourceType: PropTypes.string,
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
  hideMessageIcon: false,
  labels: undefined,
  className: undefined,
  classnames: undefined,
};

export { FormFeedback };
