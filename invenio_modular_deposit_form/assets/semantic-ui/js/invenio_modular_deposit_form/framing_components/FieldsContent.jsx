import React from "react";
import { useStore } from "react-redux";
import { Form } from "semantic-ui-react";
import { SectionWrapper } from "./SectionWrapper";

const FormRow = ({ subsections, classnames, ...props }) => {
  const componentsRegistry = useStore().getState().deposit?.config?.componentsRegistry ?? {};
  return (
    <Form.Group className={classnames ? classnames : null}>
      {subsections.map(({ section, component, ...innerProps }, index) => {
        const MyField = componentsRegistry[component][0];
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
  const componentsRegistry = useStore().getState().deposit?.config?.componentsRegistry ?? {};
  const MyField = componentsRegistry[component][0];

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
