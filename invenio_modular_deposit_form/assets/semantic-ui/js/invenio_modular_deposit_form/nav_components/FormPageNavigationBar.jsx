// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
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
 *
 * By default renders as a `Grid.Column` (standalone footer subsection). When nested
 * under StickyFooter, set `asColumn: false` so StickyFooter owns the column and
 * this component only renders the nav Segment.
 *
 * Sticky shell and spacers live on FormFooterRegion. Back / Next use
 * `formUIState.previousFormPage` and `formUIState.nextFormPage` (viewport-aware,
 * stored in the form UI reducer).
 *
 * @param {boolean} [asColumn=true] - Wrap content in Grid.Column when true.
 * @param {string} [classnames] - Extra class names for the column or Segment wrapper.
 */
const FormPageNavigationBar = ({ asColumn = true, classnames, ...props }) => {
  const { formUIState, handleFormPageChange, storageDataPresent } = useFormUIState();
  const { nextFormPage, previousFormPage } = formUIState;

  const nav = (
    <Segment className={!asColumn ? classnames ?? "" : undefined}>
      <Grid className="deposit-form-nav-bar">
        <Grid.Column computer={4} tablet={4} mobile={6} textAlign="left">
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
        <Grid.Column
          className="nav-bar-message pr-0 pl-0"
          computer={8}
          tablet={8}
          mobile={4}
          textAlign="center"
        >
          {!!storageDataPresent && (
            <span className="nav-bar-message-text">
              <Trans
                defaults="Form values backed up temporarily <0>in this browser</0>."
                components={[<i />]}
              />
            </span>
          )}
        </Grid.Column>
        <Grid.Column computer={4} tablet={4} mobile={6} textAlign="right">
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
  );

  if (!asColumn) {
    return nav;
  }

  return (
    <Grid.Column className={classnames ?? ""} {...props}>
      {nav}
    </Grid.Column>
  );
};

FormPageNavigationBar.propTypes = {
  asColumn: PropTypes.bool,
  classnames: PropTypes.string,
};

export { FormPageNavigationBar };
