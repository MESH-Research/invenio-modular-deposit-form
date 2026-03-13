import React, { useState } from "react";
import Overridable from "react-overridable";
import { Accordion, Icon, Segment } from "semantic-ui-react";

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

  const content = collapsible ? (
    <Accordion
      fluid
      id={`InvenioAppRdm.Deposit.${sectionName}.container`}
      className={[
        "invenio-fieldset",
        "invenio-accordion-field",
        sectionName,
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
      className={["invenio-fieldset", sectionName, classnames]
        .filter(Boolean)
        .join(" ")}
    >
      {show_heading && (
        <legend className="field-label-class invenio-field-label">
          {!!icon && <Icon name={icon} />} {label}
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

