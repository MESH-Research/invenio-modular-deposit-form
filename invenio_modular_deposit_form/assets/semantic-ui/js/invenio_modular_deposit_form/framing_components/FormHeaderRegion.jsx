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
 * Full-width grid row: form header region. Renders config-defined subsections
 * via the component registry (e.g. FormStepper, or any other registered component).
 */
const FormHeaderRegion = ({ subsections = [], ...props }) => {
  if (!subsections?.length) return null;
  return (
    <Overridable
      id="InvenioModularDepositForm.headerRegion.container"
      subsections={subsections}
      {...props}
    >
      <SubsectionsRenderer
        className={`row form-header-region ${props?.classnames ? props.classnames : ""}`}
        id="rdm-deposit-form-header"
        subsections={subsections}
        {...props}
      />
    </Overridable>
  );
};

FormHeaderRegion.propTypes = {
  subsections: PropTypes.array,
};

export { FormHeaderRegion };
