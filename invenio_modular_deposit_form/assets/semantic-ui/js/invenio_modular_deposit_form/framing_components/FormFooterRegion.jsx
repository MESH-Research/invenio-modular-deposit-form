// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Grid } from "semantic-ui-react";
import { useFormUIState } from "../FormUIStateManager.jsx";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Form footer region. Renders an optional observation-target child, then a
 * sticky `Grid as={Container}` whose direct children are config subsections
 * (e.g. SpacerColumn, FormPageNavigationBar).
 */
const FormFooterRegion = ({ subsections = [], children, ...props }) => {
  const { pageTargetInViewport } = useFormUIState();
  if (!subsections?.length && !children) return null;

  const stickyClass = pageTargetInViewport ? "sticky-footer-static" : "sticky-footer-fixed";

  return (
    <Overridable
      id="InvenioModularDepositForm.footerRegion.container"
      subsections={subsections}
      {...props}
    >
      <div
        className={`form-footer-region row ${props?.classnames ? props.classnames : ""}`}
        id="rdm-deposit-form-footer"
      >
        {children}
        {subsections?.length > 0 && (
          <Grid as={Container} className={stickyClass}>
            <SubsectionsRenderer subsections={subsections} />
          </Grid>
        )}
      </div>
    </Overridable>
  );
};

FormFooterRegion.propTypes = {
  subsections: PropTypes.array,
  children: PropTypes.node,
};

export { FormFooterRegion };
