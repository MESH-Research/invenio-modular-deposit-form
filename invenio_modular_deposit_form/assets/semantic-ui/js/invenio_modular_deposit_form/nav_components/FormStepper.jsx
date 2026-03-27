// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useContext, useMemo } from "react";
import { Button, Label, Step } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../FormLayoutContainer";
import { getPageFlaggedErrorCounts } from "../helpers/formUIStateReducer";
import { getSeverityBadgeType, getSeverityLabel } from "../helpers/severityChecksConfig";

/**
 * Stepper row for multi-page deposit form. Renders a step for each form page;
 * clicking a step switches to that page. Gets runtime data from FormUIStateContext;
 * accepts classnames and other props from subsection config.
 */
const FormStepper = ({ classnames, ...props }) => {
  const ctx = useContext(FormUIStateContext);
  const formPages = ctx?.formUIState?.visibleFormPages ?? [];
  const formUIState = ctx?.formUIState ?? {};
  const pageCounts = useMemo(() => getPageFlaggedErrorCounts(formUIState), [formUIState]);
  const currentFormPage = formUIState?.currentFormPage;
  const handleFormPageChange = ctx?.handleFormPageChange;
  if (!formPages?.length) return null;
  return (
    <div className={classnames ?? undefined}>
      <Step.Group widths={formPages.length} className="upload-form-pager" fluid={true} size="small">
        {formPages.map(({ section, label }) => {
          const counts = pageCounts[section];
          const severityClass = counts?.severity ? `has-${counts.severity}` : "";
          return (
            <Step
              key={section}
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
                        <Label
                          size="tiny"
                          circular
                          className={getSeverityBadgeType("error")}
                          key="error"
                        >
                          {counts.errors} {getSeverityLabel("error")}
                          {counts.errors !== 1 ? "s" : ""}
                        </Label>
                      )}
                      {counts.warnings > 0 && (
                        <Label
                          size="tiny"
                          circular
                          className={getSeverityBadgeType("warning")}
                          key="warning"
                        >
                          {counts.warnings} {getSeverityLabel("warning")}
                          {counts.warnings !== 1 ? "s" : ""}
                        </Label>
                      )}
                      {counts.info > 0 && (
                        <Label
                          size="tiny"
                          circular
                          className={getSeverityBadgeType("info")}
                          key="info"
                        >
                          {counts.info} {getSeverityLabel("info")}
                          {counts.info !== 1 ? "s" : ""}
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
