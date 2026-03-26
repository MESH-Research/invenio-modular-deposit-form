import React from "react";
import Overridable from "react-overridable";
import { useStore } from "react-redux";
import { Form } from "semantic-ui-react";
import { FormSection } from "./FormSection";

const FormRow = ({ subsections, component, classnames, ...props }) => {
  const componentsRegistry = useStore().getState().deposit?.config?.componentsRegistry ?? {};
  return (
    <Overridable
      id="InvenioModularDepositForm.FormRow.container"
      classnames={classnames}
      subsections={subsections}
    >
      <Form.Group className={`${classnames ? classnames : ""} invenio-group-field`}>
        {subsections.map(({ section, component, ...innerProps }, index) => {
          const MyField = componentsRegistry[component][0];
          return (
            <MyField
              key={index}
              isRowField={true}
              {...{
                section,
                index,
                ...props,
                ...innerProps,
              }}
            />
          );
        })}
      </Form.Group>
    </Overridable>
  );
};

const FieldsContent = ({ section, component, wrapped, index, ...props }) => {
  const componentsRegistry = useStore().getState().deposit?.config?.componentsRegistry ?? {};
  const MyField = componentsRegistry[component][0];

  return !!wrapped ? (
    <FormSection
      sectionName={section}
      icon={props.icon}
      label={props.label}
      show_heading={props.show_heading}
      classnames={props.classnames}
    >
      <MyField key={index} section={section} {...props} />
    </FormSection>
  ) : (
    <MyField key={index} section={section} {...props} />
  );
};

export { FieldsContent, FormRow };
