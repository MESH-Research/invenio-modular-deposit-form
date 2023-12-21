import React from "react";
import { Form } from "semantic-ui-react";
import { SectionWrapper } from "./field_components/SectionWrapper";

const FormRow = ({ subsections, ...props }) => {
  console.log("FormRow", props);
  return (
    <Form.Group>
      {subsections.map(({ section, component, ...innerProps }, index) => {
        const MyField = props.fieldComponents[component][0];
        console.log("FormRow subsection", component, innerProps);
        return (
          <MyField
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
  commonFieldProps,
  ...props
}) => {
  const MyField = commonFieldProps.fieldComponents[component][0];
  return !!wrapped ? (
    <SectionWrapper
      sectionName={section}
      icon={props.icon}
      label={props.label}
      show_heading={props.show_heading}
    >
      <MyField key={index} {...commonFieldProps} {...props} />
    </SectionWrapper>
  ) : (
    <MyField key={index} {...commonFieldProps} {...props} />
  );
};

export { FieldsContent, FormRow };
