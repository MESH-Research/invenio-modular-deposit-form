import React from "react";
import { Segment } from "semantic-ui-react";

const SectionWrapper = ({ children, sectionName }) => {
  console.log("SectionWrapper", sectionName, children);
  return (
    <Segment
      id={`InvenioAppRdm.Deposit.${sectionName}.container`}
      as="fieldset"
    >
      {children}
    </Segment>
  );
};

export { SectionWrapper };
