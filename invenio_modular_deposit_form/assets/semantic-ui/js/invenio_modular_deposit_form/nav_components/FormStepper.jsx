import React, { useContext } from "react";
import { Button, Step } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../FormLayoutContainer";

/**
 * Stepper row for multi-page deposit form. Renders a step for each form page;
 * clicking a step switches to that page. Gets runtime data from FormUIStateContext;
 * accepts classnames and other props from subsection config.
 */
const FormStepper = ({ classnames, ...props }) => {
  const ctx = useContext(FormUIStateContext);
  const formPages = ctx?.formPages;
  const { currentFormPage, pagesWithFlaggedErrors = {} } = ctx?.formUIState ?? {};
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
        {formPages.map(({ section, label }, index) => (
          <Step
            key={index}
            as={Button}
            active={currentFormPage === section}
            link
            onClick={handleFormPageChange}
            value={section}
            formNoValidate
            className={`ui button upload-form-stepper-step ${section} ${
              pagesWithFlaggedErrors[section] ? "has-error" : ""
            }`}
            type="button"
          >
            <Step.Content>
              <Step.Title>{i18next.t(label ?? section)}</Step.Title>
            </Step.Content>
          </Step>
        ))}
      </Step.Group>
    </div>
  );
};

FormStepper.propTypes = {
  classnames: PropTypes.string,
};

export { FormStepper };
