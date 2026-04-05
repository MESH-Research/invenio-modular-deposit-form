// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Full-width grid row: form footer region. Renders children (e.g. observation target)
 * then config-defined subsections via the component registry.
 */
const FormFooterRegion = ({ subsections = [], children, ...props }) => {
  if (!subsections?.length && !children) return null;
  return (
    <Overridable
      id="InvenioModularDepositForm.footerRegion.container"
      subsections={subsections}
      {...props}
    >
      <>
        {children}
        {subsections?.length > 0 && (
          <SubsectionsRenderer
            className={`form-footer-region row ${props?.classnames ? props.classnames : ""}`}
            id="rdm-deposit-form-footer"
            subsections={subsections}
          />
        )}
      </>
    </Overridable>
  );
};

FormFooterRegion.propTypes = {
  subsections: PropTypes.array,
  children: PropTypes.node,
};

export { FormFooterRegion };
