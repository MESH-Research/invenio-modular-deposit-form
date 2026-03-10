import React, { useLayoutEffect, useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormUIStateContext } from "../FormLayoutContainer";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";
import { FieldsContent } from "./FieldsContent";

const FormPage = ({
  focusFirstElement,
  id,
  recoveryAsked,
  subsections,
}) => {
  const { formUIState, fileUploadPageId } = useContext(FormUIStateContext);
  const currentFormPage = formUIState?.currentFormPage;

  useLayoutEffect(() => {
    window.setTimeout(() => {
      focusFirstElement(currentFormPage, recoveryAsked, fileUploadPageId);
    }, 200);
  }, [currentFormPage, recoveryAsked, fileUploadPageId]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SubsectionsRenderer
        className="formPageWrapper"
        id={id}
        subsections={subsections}
      />
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
