import { Step, Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

const FormPager = ({
  formPages,
  currentFormPage,
  handleFormPageChange,
  pagesWithFlaggedErrors,
}) => {
  return (
    <Step.Group
      widths={formPages.length}
      className="upload-form-pager"
      fluid={true}
      size={"small"}
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
          className={`ui button upload-form-stepper-step ${section}
                ${!!pagesWithFlaggedErrors[section] ? "has-error" : ""}`}
          type="button"
        >
          <Step.Content>
            <Step.Title>{i18next.t(label)}</Step.Title>
          </Step.Content>
        </Step>
      ))}
    </Step.Group>
  );
};

FormPager.propTypes = {
  formPages: PropTypes.array.isRequired,
  currentFormPage: PropTypes.string.isRequired,
  handleFormPageChange: PropTypes.func.isRequired,
  pagesWithFlaggedErrors: PropTypes.object.isRequired,
};

export { FormPager };
