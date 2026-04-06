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
 * Top title row for the deposit form (`deposit-form-title`). Subsections use the component
 * registry (e.g. FormTitle, SpacerColumn) like FormHeaderRegion.
 */
const FormTitleRegion = ({ subsections = [], ...props }) => {
  if (!subsections?.length) return null;
  return (
    <Overridable
      id="InvenioModularDepositForm.titleRegion.container"
      subsections={subsections}
      {...props}
    >
      <SubsectionsRenderer
        className={`row deposit-form-title ${props?.classnames ? props.classnames : ""}`}
        id="rdm-deposit-form-title"
        subsections={subsections}
        {...props}
      />
    </Overridable>
  );
};

FormTitleRegion.propTypes = {
  subsections: PropTypes.array,
};

export { FormTitleRegion };
