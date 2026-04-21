// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useRef } from "react";
import { Grid, Ref, Sticky } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

const FormRightSidebar = ({ subsections = [], ...props }) => {
  if (!subsections?.length) return null;
  // Match upstream RDMDepositForm sidebar: pin contents while the user scrolls
  // through the long form. `Ref` provides the scroll context to `Sticky`.
  const sidebarRef = useRef(null);
  return (
    <Ref innerRef={sidebarRef}>
      <Grid.Column {...props} className="deposit-right-sidebar deposit-sidebar">
        <Sticky context={sidebarRef} offset={20}>
          <SubsectionsRenderer subsections={subsections} />
        </Sticky>
      </Grid.Column>
    </Ref>
  );
};

FormRightSidebar.propTypes = {
  subsections: PropTypes.array,
};

export { FormRightSidebar };
