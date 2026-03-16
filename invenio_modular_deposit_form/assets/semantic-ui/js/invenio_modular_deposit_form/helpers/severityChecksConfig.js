/**
 * Severity labels and badge types for validation feedback (errors, warnings, recommendations).
 * Uses stock invenio-app-rdm severityChecksConfig (error, info); we extend with "warning".
 * Used by FormSection, FormStepper, FormSidebarPageMenu, and FormFeedbackSummary for labels and badge styling.
 */

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { severityChecksConfig as stockSeverityChecksConfig } from "@js/invenio_app_rdm/deposit/config";

export const severityChecksConfig = {
  ...stockSeverityChecksConfig,
  warning: {
    label: i18next.t("Warning"),
    description: i18next.t(
      "This check indicates a potential issue you may want to address."
    ),
  },
};

/**
 * Semantic UI Label type (className) per severity. Single source for FormFeedbackSummary,
 * FormSidebarPageMenu, and FormStepper badge styling.
 */
export const SEVERITY_BADGE_TYPES = {
  error: "negative",
  warning: "warning",
  info: "info",
};

/**
 * @param {"error"|"warning"|"info"} severity
 * @returns {string} label for display (e.g. "Error", "Recommendation")
 */
export function getSeverityLabel(severity) {
  const entry = severityChecksConfig[severity];
  return entry?.label ?? severity;
}

/**
 * @param {"error"|"warning"|"info"} severity
 * @returns {string} Semantic UI Label type for badges (e.g. "negative", "warning", "info")
 */
export function getSeverityBadgeType(severity) {
  return SEVERITY_BADGE_TYPES[severity] ?? "warning";
}
