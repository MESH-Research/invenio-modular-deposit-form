import React, { useContext, useMemo, useState } from "react";
import Overridable from "react-overridable";
import { Accordion, Icon, Label, Segment } from "semantic-ui-react";
import { FormUIStateContext } from "../FormLayoutContainer";
import { getSectionErrorsBySectionKey } from "../helpers/formUIStateReducer";
import { getSeverityLabel } from "../helpers/severityChecksConfig";

const FormSection = ({
  children,
  icon,
  sectionName,
  label,
  show_heading = false,
  collapsible = false,
  startExpanded = true,
  classnames,
}) => {
  const [isOpen, setIsOpen] = useState(startExpanded);
  const ctx = useContext(FormUIStateContext);
  const formUIState = ctx?.formUIState ?? {};
  const currentFormPage = formUIState?.currentFormPage ?? "";
  const sectionErrorsByKey = useMemo(
    () => getSectionErrorsBySectionKey(formUIState),
    [formUIState]
  );
  const sectionKey = `${currentFormPage}\0${sectionName}`;
  const sectionErrors = sectionErrorsByKey[sectionKey];
  const errorCount = (sectionErrors?.error_fields ?? []).length;
  const warningCount = (sectionErrors?.warning_fields ?? []).length;
  const infoCount = (sectionErrors?.info_fields ?? []).length;
  const hasAny = errorCount > 0 || warningCount > 0 || infoCount > 0;
  const severityClass = errorCount > 0 ? "error" : warningCount > 0 ? "warning" : infoCount > 0 ? "info" : "";

  const severityBadges =
    hasAny && (
      <span className="form-section-severity-badges">
        {errorCount > 0 && (
          <Label size="tiny" circular className="accordion-label error" key="error">
            {errorCount} {getSeverityLabel("error")}{errorCount !== 1 ? "s" : ""}
          </Label>
        )}
        {warningCount > 0 && (
          <Label size="tiny" circular className="accordion-label warning" key="warning">
            {warningCount} {getSeverityLabel("warning")}{warningCount !== 1 ? "s" : ""}
          </Label>
        )}
        {infoCount > 0 && (
          <Label size="tiny" circular className="accordion-label info" key="info">
            {infoCount} {getSeverityLabel("info")}{infoCount !== 1 ? "s" : ""}
          </Label>
        )}
      </span>
    );

  const content = collapsible ? (
    <Accordion
      fluid
      id={`InvenioAppRdm.Deposit.${sectionName}.container`}
      className={[
        "invenio-fieldset",
        "invenio-accordion-field",
        sectionName,
        severityClass,
        classnames,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Accordion.Title
        active={isOpen}
        index={0}
        onClick={() => setIsOpen(!isOpen)}
        className="invenio-field-label"
      >
        {!!icon && <Icon name={icon} />} {label}
        {severityBadges}
        <Icon name="dropdown" className="accordion-dropdown-icon" />
      </Accordion.Title>
      <Accordion.Content active={isOpen}>
        {children}
      </Accordion.Content>
    </Accordion>
  ) : (
    <Segment
      id={`InvenioAppRdm.Deposit.${sectionName}.container`}
      as="fieldset"
      className={[
        "invenio-fieldset",
        "invenio-form-section",
        sectionName,
        severityClass,
        classnames,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {show_heading && (
        <legend className="field-label-class title invenio-field-label">
          {!!icon && <Icon name={icon} />} {label}
          {severityBadges}
        </legend>
      )}
      {children}
    </Segment>
  );

  return (
    <Overridable
      id="InvenioModularDepositForm.FormSection.container"
      sectionName={sectionName}
      label={label}
      icon={icon}
      collapsible={collapsible}
      show_heading={show_heading}
      classnames={classnames}
    >
      {content}
    </Overridable>
  );
};

export { FormSection };

