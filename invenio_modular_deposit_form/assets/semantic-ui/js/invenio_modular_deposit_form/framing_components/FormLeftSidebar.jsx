// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useRef } from "react";
import { Grid, Ref, Sticky } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Left sidebar column. Renders config-defined subsections via the component
 * registry. Responsive column widths can be passed via props from the layout
 * config (e.g. `mobile`, `computer`).
 *
 * Sidebar contents are pinned via `Sticky` to match upstream RDMDepositForm.
 * Pass `sticky={false}` from the layout config to opt out (e.g. for sidebars
 * whose total height exceeds the viewport, where pinning would hide the bottom).
 */
const FormLeftSidebar = ({ subsections = [], sticky = true, ...props }) => {
  if (!subsections?.length) return null;
  const sidebarRef = useRef(null);
  if (!sticky) {
    return (
      <Grid.Column {...props} className="deposit-left-sidebar deposit-sidebar">
        <SubsectionsRenderer subsections={subsections} />
      </Grid.Column>
    );
  }
  return (
    <Ref innerRef={sidebarRef}>
      <Grid.Column {...props} className="deposit-left-sidebar deposit-sidebar">
        <Sticky context={sidebarRef} offset={20}>
          <SubsectionsRenderer subsections={subsections} />
        </Sticky>
      </Grid.Column>
    </Ref>
  );
};

FormLeftSidebar.propTypes = {
  subsections: PropTypes.array,
  sticky: PropTypes.bool,
};

export { FormLeftSidebar };
