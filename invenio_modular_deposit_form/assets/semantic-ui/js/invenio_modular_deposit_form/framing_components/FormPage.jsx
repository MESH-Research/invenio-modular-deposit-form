import React, { useLayoutEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SectionWrapper } from "../field_components/SectionWrapper";
import { FieldsContent } from "./FieldsContent";
import PropTypes from "prop-types";



const FormPage = ({
  currentFormPage,
  focusFirstElement,
  id,
  subsections,
}) => {

  useLayoutEffect(() => {
    window.setTimeout(() => {
      focusFirstElement(currentFormPage);
    }, 200);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formPageWrapper" id={id}>
        {subsections.map(
          (
            {
              section,
              component,
              wrapped,
              subsections: innerSections,
              ...props
            },
            index
          ) => {
            return component === "SectionWrapper" ? (
              <SectionWrapper sectionName={section} key={section} {...props}>
                {innerSections.map(({ component, ...innerProps }, index) => (
                  <FieldsContent
                    key={index}
                    {...{
                      section,
                      component,
                      wrapped,
                      index,
                      ...innerProps,
                    }}
                  />
                ))}
              </SectionWrapper>
            ) : (
              <FieldsContent
                {...{
                  section,
                  component,
                  wrapped,
                  index,
                  ...props,
                }}
              />
            );
          }
        )}
      </div>
    </DndProvider>
  );
};

PropTypes.FormPage = {
  focusFirstElement: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  subsections: PropTypes.array.isRequired,
}

export { FieldsContent, FormPage };
