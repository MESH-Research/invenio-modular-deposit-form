import React from "react";
import { Icon, Segment } from "semantic-ui-react";

const SectionWrapper = ({
  children,
  icon,
  sectionName,
  title,
  show_heading = false,
}) => {
  return (
    <Segment
      id={`InvenioAppRdm.Deposit.${sectionName}.container`}
      as="fieldset"
      className={`invenio-fieldset ${sectionName}`}
    >
      {show_heading && (
        <legend className="field-label-class invenio-field-label">
          {!!icon && <Icon name={icon} />} {title}
        </legend>
      )}
      {children}
    </Segment>
  );
};

export { SectionWrapper };
