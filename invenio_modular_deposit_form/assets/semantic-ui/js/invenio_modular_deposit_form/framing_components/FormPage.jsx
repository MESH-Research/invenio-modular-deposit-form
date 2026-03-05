import React, { useLayoutEffect, useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SectionWrapper } from "../field_components/SectionWrapper";
import { FieldsContent } from "./FieldsContent";
import { FormUIStateContext } from "../InnerDepositForm";
import PropTypes from "prop-types";

const FormPage = ({
  focusFirstElement,
  id,
  recoveryAsked,
  subsections,
}) => {
  const { currentFormPage } = useContext(FormUIStateContext);

  useLayoutEffect(() => {
    window.setTimeout(() => {
      focusFirstElement(currentFormPage, recoveryAsked);
    }, 200);
  }, [currentFormPage, recoveryAsked]);

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
                key={index}
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

FormPage.propTypes = {
  focusFirstElement: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  recoveryAsked: PropTypes.bool,
  subsections: PropTypes.array.isRequired,
};

export { FieldsContent, FormPage };
