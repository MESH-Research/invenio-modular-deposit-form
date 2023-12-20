import React from "react";
import { Form, Icon, Segment } from "semantic-ui-react";

const SectionWrapper = ({
  children,
  icon,
  sectionName,
  label,
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
          {!!icon && <Icon name={icon} />} {label}
        </legend>
      )}
      {children.length > 1 ? <Form.Group>{children}</Form.Group> : children}
    </Segment>
  );
};

export { SectionWrapper };
