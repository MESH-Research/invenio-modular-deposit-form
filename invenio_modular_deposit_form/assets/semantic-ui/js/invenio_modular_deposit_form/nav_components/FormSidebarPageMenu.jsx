// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useContext, useMemo } from "react";
import { Button, Header, Label, Menu } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../FormLayoutContainer";
import { getPageFlaggedErrorCounts } from "../helpers/formUIStateReducer";
import { getSeverityBadgeType, getSeverityLabel } from "../helpers/severityChecksConfig";

/**
 * Vertically stacked sidebar menu for stepping through form pages.
 * Menu items show severity-aware badges (error/warning/info counts) and
 * a severity class (has-error, has-warning, has-info).
 *
 * Items use Menu.Item as={Button} (type="button") for semantics and tab order;
 * deposit_form.less overrides default centered content on fluid buttons.
 */
const FormSidebarPageMenu = ({ classnames, ...props }) => {
  const ctx = useContext(FormUIStateContext);
  const formPages = ctx?.formUIState?.visibleFormPages ?? [];
  const formUIState = ctx?.formUIState ?? {};
  const pageCounts = useMemo(() => getPageFlaggedErrorCounts(formUIState), [formUIState]);
  const currentFormPage = formUIState?.currentFormPage;
  const handleFormPageChange = ctx?.handleFormPageChange;
  if (!formPages?.length) return null;
  return (
    <div className={classnames ?? undefined}>
      <Header as="h2" className="ui medium top attached header">
        {i18next.t("Form pages")}
      </Header>
      <div className="ui segment bottom attached p-0">
        <Menu
          vertical
          fluid
          className="theme-primary-menu deposit-form-sidebar-menu borderless"
          role="navigation"
          aria-label={i18next.t("Form pages")}
        >
          {formPages.map(({ section, label }) => {
            const counts = pageCounts[section];
            const severityClass = counts?.severity ? `has-${counts.severity}` : "";
            const hasBadges =
              counts && (counts.errors > 0 || counts.warnings > 0 || counts.info > 0);
            return (
              <Menu.Item
                key={section}
                as={Button}
                type="button"
                formNoValidate
                name={section}
                active={currentFormPage === section}
                className={[severityClass, "fluid"].filter(Boolean).join(" ")}
                aria-current={currentFormPage === section ? "page" : undefined}
                onClick={(e) => handleFormPageChange(e, { value: section })}
              >
                {hasBadges && (
                  <span className="deposit-form-sidebar-menu-badges">
                    {counts.errors > 0 && (
                      <Label
                        size="tiny"
                        circular
                        className={getSeverityBadgeType("error")}
                        key="error"
                      >
                        {counts.errors} {getSeverityLabel("error")}
                        {counts.errors !== 1 ? "s" : ""}
                      </Label>
                    )}
                    {counts.warnings > 0 && (
                      <Label
                        size="tiny"
                        circular
                        className={getSeverityBadgeType("warning")}
                        key="warning"
                      >
                        {counts.warnings} {getSeverityLabel("warning")}
                        {counts.warnings !== 1 ? "s" : ""}
                      </Label>
                    )}
                    {counts.info > 0 && (
                      <Label
                        size="tiny"
                        circular
                        className={getSeverityBadgeType("info")}
                        key="info"
                      >
                        {counts.info} {getSeverityLabel("info")}
                        {counts.info !== 1 ? "s" : ""}
                      </Label>
                    )}
                  </span>
                )}
                <span className="deposit-form-sidebar-menu-label">
                  {i18next.t(label ?? section)}
                </span>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
    </div>
  );
};

FormSidebarPageMenu.propTypes = {
  classnames: PropTypes.string,
};

export { FormSidebarPageMenu };
