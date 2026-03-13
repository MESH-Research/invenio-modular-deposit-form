import React, { useLayoutEffect, useContext } from "react";
import Overridable from "react-overridable";
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
  classnames,
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
    <Overridable
      id="InvenioModularDepositForm.FormPage.container"
      pageId={id}
      subsections={subsections}
      classnames={classnames}
    >
      <DndProvider backend={HTML5Backend}>
        <SubsectionsRenderer
          className={["formPageWrapper", classnames].filter(Boolean).join(" ")}
          id={id}
          subsections={subsections}
          isFormPagesRegion
        />
      </DndProvider>
    </Overridable>
  );
};

FormPage.propTypes = {
  focusFirstElement: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  recoveryAsked: PropTypes.bool,
  classnames: PropTypes.string,
  subsections: PropTypes.array.isRequired,
};

export { FieldsContent, FormPage };
