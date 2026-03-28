import React, { useMemo, useState } from "react";
import Overridable from "react-overridable";
import { useStore } from "react-redux";
import { Accordion, Icon, Label, Segment } from "semantic-ui-react";
import { useFormUIState } from "../FormUIStateManager.jsx";
import { getFormSectionElementId } from "../utils";
import { getSectionErrorsBySectionKey } from "../helpers/formUIStateReducer";
import { getSeverityBadgeType, getSeverityLabel } from "../helpers/severityChecksConfig";
import { HiddenFieldsBanner } from "./HiddenFieldsBanner";

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
  const ctx = useFormUIState();
  const store = useStore();
  const formUIState = ctx.formUIState ?? {};
  const formSectionFields = store?.getState?.()?.deposit?.config?.formSectionFields ?? [];
  const currentFormPage = formUIState?.currentFormPage ?? "";
  const currentResourceType = formUIState?.currentResourceType ?? "";

  const sectionErrorsByKey = useMemo(
    () => getSectionErrorsBySectionKey(formUIState),
    [formUIState]
  );
  const sectionKey = `${currentFormPage}\0${sectionName}`;
  const sectionErrors = sectionErrorsByKey[sectionKey];
  const sectionErrorPaths = sectionErrors?.error_fields ?? [];
  const errorCount = sectionErrorPaths.length;
  const warningCount = (sectionErrors?.warning_fields ?? []).length;
  const infoCount = (sectionErrors?.info_fields ?? []).length;
  const hasAny = errorCount > 0 || warningCount > 0 || infoCount > 0;
  const severityClass =
    errorCount > 0 ? "error" : warningCount > 0 ? "warning" : infoCount > 0 ? "info" : "";

  const severityBadges = hasAny && (
    <span className="form-section-severity-badges">
      {errorCount > 0 && (
        <Label size="tiny" circular className={getSeverityBadgeType("error")} key="error">
          {errorCount} {getSeverityLabel("error")}
          {errorCount !== 1 ? "s" : ""}
        </Label>
      )}
      {warningCount > 0 && (
        <Label size="tiny" circular className={getSeverityBadgeType("warning")} key="warning">
          {warningCount} {getSeverityLabel("warning")}
          {warningCount !== 1 ? "s" : ""}
        </Label>
      )}
      {infoCount > 0 && (
        <Label size="tiny" circular className={getSeverityBadgeType("info")} key="info">
          {infoCount} {getSeverityLabel("info")}
          {infoCount !== 1 ? "s" : ""}
        </Label>
      )}
    </span>
  );

  const sectionElementId = getFormSectionElementId(sectionName);
  const content = collapsible ? (
    <Accordion
      fluid
      id={sectionElementId}
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
        <HiddenFieldsBanner
          pageId={currentFormPage}
          sectionId={sectionName}
          sectionErrorPaths={sectionErrorPaths}
          formSectionFields={formSectionFields}
          currentResourceType={currentResourceType}
        />
        {children}
      </Accordion.Content>
    </Accordion>
  ) : (
    <Segment
      id={sectionElementId}
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
        <legend className="field-label-class title invenio-field-label rel-mb-1">
          {!!icon && <Icon name={icon} />} {label}
          {severityBadges}
        </legend>
      )}
      <HiddenFieldsBanner
        pageId={currentFormPage}
        sectionId={sectionName}
        sectionErrorPaths={sectionErrorPaths}
        formSectionFields={formSectionFields}
        currentResourceType={currentResourceType}
      />
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
