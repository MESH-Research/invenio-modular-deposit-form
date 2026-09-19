// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { useStore } from "react-redux";
import { Grid } from "semantic-ui-react";

/**
 * Center column of the form footer sticky stack.
 *
 * Renders as a `Grid.Column` with config-driven widths and stacks its
 * `subsections` vertically (e.g. HiddenFieldsNotices above FormPageNavigationBar).
 * Use beside SpacerColumn siblings in FormFooterRegion so notices share the same
 * column math as the nav bar.
 *
 * Nested nav should set `asColumn: false` on FormPageNavigationBar so this
 * component owns the column wrapper.
 *
 * @param {Array} [subsections] - Config rows (`component`, props) to stack.
 * @param {string} [classnames] - Extra class names for the column.
 */
const StickyFooter = ({ subsections = [], classnames, ...props }) => {
  const componentsRegistry = useStore().getState().deposit?.config?.componentsRegistry ?? {};

  return (
    <Overridable
      id="InvenioModularDepositForm.StickyFooter.container"
      subsections={subsections}
      classnames={classnames}
      {...props}
    >
      <Grid.Column
        className={["sticky-footer-column", classnames].filter(Boolean).join(" ")}
        {...props}
      >
        <div className="sticky-footer-column-stack">
          {subsections.map(({ section, component, ...innerProps }, index) => {
            const entry = componentsRegistry[component];
            if (!Array.isArray(entry) || entry.length === 0) {
              return null;
            }
            const MyField = entry[0];
            return <MyField key={section ?? index} section={section} {...innerProps} />;
          })}
        </div>
      </Grid.Column>
    </Overridable>
  );
};

StickyFooter.propTypes = {
  subsections: PropTypes.array,
  classnames: PropTypes.string,
};

export { StickyFooter };
