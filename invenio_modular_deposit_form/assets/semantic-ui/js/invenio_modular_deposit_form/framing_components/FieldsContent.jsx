import React, { useContext } from "react";
import { SectionWrapper } from "../field_components/SectionWrapper";
import { FormUIStateContext } from "../InnerDepositForm";

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

export { FieldsContent };
