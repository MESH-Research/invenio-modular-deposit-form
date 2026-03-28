// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Button, Grid, Icon, Segment } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { useFormUIState } from "../FormUIStateManager.jsx";

/**
 * Back / Continue navigation bar for multi-page deposit form (e.g. in form footer region).
 * Gets runtime data from useFormUIState; accepts classnames and other props from config.
 */
const FormPageNavigationBar = ({ classnames, ...props }) => {
  const {
    pageTargetInViewport,
    previousFormPage,
    nextFormPage,
    handleFormPageChange,
    storageDataPresent,
  } = useFormUIState();
  return (
    <div
      className={`ui container ${
        pageTargetInViewport ? "sticky-footer-static" : "sticky-footer-fixed"
      } ${classnames ?? ""}`.trim()}
    >
      <Segment>
        <Grid className="deposit-form-nav-bar">
          <Grid.Column width={3} textAlign="left">
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
          <Grid.Column className="nav-bar-message" width={10} textAlign="center">
            {!!storageDataPresent && (
              <span className="nav-bar-message-text">
                <Trans
                  defaults="Form values backed up temporarily <0>in this browser</0>."
                  components={[<i />]}
                />
              </span>
            )}
          </Grid.Column>
          <Grid.Column width={3} textAlign="right">
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
                {i18next.t("Next")}
              </Button>
            )}
          </Grid.Column>
        </Grid>
      </Segment>
    </div>
  );
};

FormPageNavigationBar.propTypes = {
  classnames: PropTypes.string,
};

export { FormPageNavigationBar };
