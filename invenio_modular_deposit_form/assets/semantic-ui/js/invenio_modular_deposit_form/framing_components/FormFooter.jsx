import { Grid, Button, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";

const FormFooter = ({
  previousFormPage,
  nextFormPage,
  handleFormPageChange,
  pageTargetRef,
  pageTargetInViewport,
}) => {
  return (
    <>
      <div
        id="sticky-footer-observation-target"
        ref={pageTargetRef}
      ></div>
      <div
        className={`ui container ${
          pageTargetInViewport
            ? "sticky-footer-static"
            : "sticky-footer-fixed"
        }`}
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

          <Overridable id="InvenioAppRdm.Deposit.FooterMessage.container">
            <Grid.Column className="footer-message" width={10}>
              {i18next.t("Your current form values are backed up automatically")}
              <i>{i18next.t("in this browser")}</i>.
              <br />
              {i18next.t("Save a persistent draft to the cloud on the 'Save & Publish' tab.")}
            </Grid.Column>
          </Overridable>

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
    </>
  );
};

export { FormFooter };
