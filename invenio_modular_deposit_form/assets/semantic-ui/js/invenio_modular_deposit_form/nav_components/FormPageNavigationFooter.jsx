import React, { useContext } from "react";
import { Button, Grid, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../FormLayoutContainer";

/**
 * Back / Continue navigation footer for multi-page deposit form.
 * Gets runtime data from FormUIStateContext; accepts classnames and other props from config.
 */
const FormPageNavigationFooter = ({ classnames, ...props }) => {
  const {
    pageTargetInViewport,
    previousFormPage,
    nextFormPage,
    handleFormPageChange,
  } = useContext(FormUIStateContext) ?? {};
  return (
    <div
      className={`ui container ${
        pageTargetInViewport ? "sticky-footer-static" : "sticky-footer-fixed"
      } ${classnames ?? ""}`.trim()}
    >
      <Grid className="deposit-form-footer">
        <Grid.Column width={3}>
          {!!previousFormPage && (
            <Button
              type="button"
              onClick={handleFormPageChange}
              value={previousFormPage}
              icon
              labelPosition="left"
              className="back-button"
            >
              <Icon name="left arrow" />
              {i18next.t("Back")}
            </Button>
          )}
        </Grid.Column>
        <Grid.Column className="footer-message" width={10}>
          Your current form values are backed up automatically{" "}
          <i>in this browser</i>.<br />
          Save a persistent draft to the cloud on the "Save & Publish" tab.
        </Grid.Column>
        <Grid.Column width={3}>
          {!!nextFormPage && (
            <Button
              type="button"
              onClick={handleFormPageChange}
              value={nextFormPage}
              icon
              labelPosition="right"
              className="continue-button primary"
            >
              <Icon name="right arrow" />
              {i18next.t("Continue")}
            </Button>
          )}
        </Grid.Column>
      </Grid>
    </div>
  );
};

FormPageNavigationFooter.propTypes = {
  classnames: PropTypes.string,
};

export { FormPageNavigationFooter };
