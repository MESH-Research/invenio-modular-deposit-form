// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Grid } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

const FormRightSidebar = ({ subsections = [], ...props }) => {
  if (!subsections?.length) return null;
  return (
    <Grid.Column {...props} className="deposit-right-sidebar deposit-sidebar">
      <SubsectionsRenderer subsections={subsections} />
    </Grid.Column>
  );
};

FormRightSidebar.propTypes = {
  subsections: PropTypes.array,
};

export { FormRightSidebar };
