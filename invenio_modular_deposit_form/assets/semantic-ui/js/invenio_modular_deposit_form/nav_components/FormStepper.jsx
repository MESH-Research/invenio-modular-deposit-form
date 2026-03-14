import React, { useContext, useMemo } from "react";
import { useStore } from "react-redux";
import { Button, Label, Step } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../FormLayoutContainer";
import { getPageFlaggedErrorCounts } from "../helpers/formUIStateReducer";
import { getSeverityLabel } from "../helpers/severityChecksConfig";

/**
 * Stepper row for multi-page deposit form. Renders a step for each form page;
 * clicking a step switches to that page. Gets runtime data from FormUIStateContext;
 * accepts classnames and other props from subsection config.
 */
const FormStepper = ({ classnames, ...props }) => {
  const store = useStore();
  const formPages = store.getState().deposit?.config?.common_fields?.find(
    (item) => item.component === "FormPages"
  )?.subsections ?? [];
  const ctx = useContext(FormUIStateContext);
  const formUIState = ctx?.formUIState ?? {};
  const pageCounts = useMemo(
    () => getPageFlaggedErrorCounts(formUIState),
    [formUIState]
  );
  const currentFormPage = formUIState?.currentFormPage;
  const handleFormPageChange = ctx?.handleFormPageChange;
  if (!formPages?.length) return null;
  return (
    <div className={classnames ?? undefined}>
      <Step.Group
        widths={formPages.length}
        className="upload-form-pager"
        fluid={true}
        size="small"
      >
        {formPages.map(({ section, label }, index) => {
          const counts = pageCounts[section];
          const severityClass = counts?.severity ? `has-${counts.severity}` : "";
          return (
            <Step
              key={index}
              as={Button}
              active={currentFormPage === section}
              link
              onClick={handleFormPageChange}
              value={section}
              formNoValidate
              className={`ui button upload-form-stepper-step ${section} ${severityClass}`}
              type="button"
            >
              <Step.Content>
                <Step.Title>
                  {i18next.t(label ?? section)}
                  {counts && (counts.errors > 0 || counts.warnings > 0 || counts.info > 0) && (
                    <span className="upload-form-stepper-badges">
                      {counts.errors > 0 && (
                        <Label size="tiny" circular className="severity-error" key="error">
                          {counts.errors} {getSeverityLabel("error")}{counts.errors !== 1 ? "s" : ""}
                        </Label>
                      )}
                      {counts.warnings > 0 && (
                        <Label size="tiny" circular className="severity-warning" key="warning">
                          {counts.warnings} {getSeverityLabel("warning")}{counts.warnings !== 1 ? "s" : ""}
                        </Label>
                      )}
                      {counts.info > 0 && (
                        <Label size="tiny" circular className="severity-info" key="info">
                          {counts.info} {getSeverityLabel("info")}{counts.info !== 1 ? "s" : ""}
                        </Label>
                      )}
                    </span>
                  )}
                </Step.Title>
              </Step.Content>
            </Step>
          );
        })}
      </Step.Group>
    </div>
  );
};

FormStepper.propTypes = {
  classnames: PropTypes.string,
};

export { FormStepper };
