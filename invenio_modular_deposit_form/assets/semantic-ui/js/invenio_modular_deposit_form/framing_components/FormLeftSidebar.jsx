// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Grid } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Left sidebar column. Renders config-defined subsections via the component
 * registry. Optional responsive column widths from config (e.g. mobile, computer)
 * override the defaults (computer=3, mobile=16).
 */
const DEFAULTS = { computer: 3, mobile: 16 };

const FormLeftSidebar = ({ subsections = [], ...props }) => {
  if (!subsections?.length) return null;
  return (
    <Grid.Column {...props} className="deposit-left-sidebar deposit-sidebar">
      <SubsectionsRenderer subsections={subsections} />
    </Grid.Column>
  );
};

FormLeftSidebar.propTypes = {
  subsections: PropTypes.array,
};

export { FormLeftSidebar };
