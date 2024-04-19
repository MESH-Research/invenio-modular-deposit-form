import React, { useContext } from "react";
import { Form } from "semantic-ui-react";
import { SectionWrapper } from "../field_components/SectionWrapper";
import { FormUIStateContext } from "../InnerDepositForm";

const FormRow = ({ subsections, classnames, ...props }) => {
  return (
    <Form.Group className={classnames ? classnames : null}>
      {subsections.map(({ section, component, ...innerProps }, index) => {
        const { fieldComponents } = useContext(FormUIStateContext);
        const MyField = fieldComponents[component][0];
        return (
          <MyField
            key={index}
            {...{
              section,
              component,
              index,
              ...props,
              ...innerProps,
            }}
          />
        );
      })}
    </Form.Group>
  );
};

const FieldsContent = ({
  section,
  component,
  wrapped,
  index,
  ...props
}) => {

  const { fieldComponents } = useContext(FormUIStateContext);
  const MyField = fieldComponents[component][0];

  return !!wrapped ? (
    <SectionWrapper
      sectionName={section}
      icon={props.icon}
      label={props.label}
      show_heading={props.show_heading}
    >
      <MyField key={index} {...props} />
    </SectionWrapper>
  ) : (
    <MyField key={index} {...props} />
  );
};

export { FieldsContent, FormRow };
