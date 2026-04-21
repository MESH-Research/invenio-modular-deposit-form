// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useMemo, useState, useLayoutEffect } from "react";
import { Button, Grid, Label, Step } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { useFormUIState } from "../FormUIStateManager.jsx";
import { getPageFlaggedErrorCounts } from "../helpers/formUIStateReducer";
import { getSeverityBadgeType, getSeverityLabel } from "../helpers/severityChecksConfig";

/**
 * Stepper row for multi-page deposit form. Renders a step for each form page;
 * clicking a step switches to that page. Gets runtime data from useFormUIState;
 * accepts classnames and other props from subsection config.
 */
const FormStepper = ({ classnames, ...props }) => {
  const ctx = useFormUIState();
  const formPages = ctx.formUIState?.visibleFormPages ?? [];
  const formUIState = ctx.formUIState ?? {};
  const pageCounts = useMemo(() => getPageFlaggedErrorCounts(formUIState), [formUIState]);
  const currentFormPage = formUIState?.currentFormPage;
  const handleFormPageChange = ctx.handleFormPageChange;

  /* Track which step is the last *visible* one across the page so we can strip
   * its trailing chevron. Steps hidden via per-step responsive classes (e.g.
   * `menuItemClasses: "tablet mobile only"`) are still in the DOM, so the
   * default `:last-child:after { display: none }` rule misses them and the
   * visually-last step keeps its pointer. A document-wide query is fine here:
   * the surrounding Step.Groups are themselves wrapped in mutually-exclusive
   * responsive Grid.Columns, so only one group's steps have a non-null
   * offsetParent at any viewport width. */
  const [lastVisibleSection, setLastVisibleSection] = useState(null);
  useLayoutEffect(() => {
    const compute = () => {
      const steps = document.querySelectorAll(".upload-form-stepper-step");
      let last = null;
      steps.forEach((s) => {
        if (s.offsetParent !== null) last = s;
      });
      setLastVisibleSection(last ? last.dataset.section : null);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [formPages.length]);

  if (!formPages?.length) return null;
  return (
    <Grid.Column className={classnames ?? ""} {...props}>
      <Step.Group className="upload-form-pager" fluid={true} size="small">
        {formPages.map(({ section, label, menuItemClasses }) => {
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
              className={[
                "ui button upload-form-stepper-step",
                section,
                severityClass,
                menuItemClasses,
                section === lastVisibleSection ? "last-visible" : "",
              ].filter(Boolean).join(" ")}
              data-section={section}
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
    </Grid.Column>
  );
};

FormStepper.propTypes = {
  classnames: PropTypes.string,
};

export { FormStepper };
