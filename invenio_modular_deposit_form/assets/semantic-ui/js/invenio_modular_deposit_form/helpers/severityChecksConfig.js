/**
 * Severity labels for validation feedback (errors, warnings, recommendations).
 * Uses stock invenio-app-rdm severityChecksConfig (error, info); we extend with "warning".
 * Used by FormSection, FormStepper, and FormSidebarPageMenu for badge text.
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
 * @param {"error"|"warning"|"info"} severity
 * @returns {string} label for display (e.g. "Error", "Recommendation")
 */
export function getSeverityLabel(severity) {
  const entry = severityChecksConfig[severity];
  return entry?.label ?? severity;
}
