import React, { useContext } from "react";
import { Header, Menu } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../FormLayoutContainer";

/**
 * Vertically stacked sidebar menu for stepping through form pages.
 * Gets runtime data from FormUIStateContext; accepts classnames and other props from config.
 */
const FormSidebarPageMenu = ({ classnames, ...props }) => {
  const ctx = useContext(FormUIStateContext);
  const formPages = ctx?.formPages;
  const { currentFormPage, pagesWithFlaggedErrors = {} } = ctx?.formUIState ?? {};
  const handleFormPageChange = ctx?.handleFormPageChange;
  if (!formPages?.length) return null;
  return (
    <div className={classnames ?? undefined}>
      <Header as="h2" className="ui medium top attached header">
        {i18next.t("Form pages")}
      </Header>
      <div className="ui segment bottom attached">
        <Menu
          vertical
          fluid
          className="theme-primary-menu deposit-form-sidebar-menu"
          role="navigation"
          aria-label={i18next.t("Form pages")}
        >
          {formPages.map(({ section, label }) => (
            <Menu.Item
              key={section}
              name={section}
              active={currentFormPage === section}
              className={pagesWithFlaggedErrors[section] ? "has-error" : ""}
              onClick={(e, data) =>
                handleFormPageChange(e, { value: data.name })
              }
              content={i18next.t(label ?? section)}
            />
          ))}
        </Menu>
      </div>
    </div>
  );
};

FormSidebarPageMenu.propTypes = {
  classnames: PropTypes.string,
};

export { FormSidebarPageMenu };
