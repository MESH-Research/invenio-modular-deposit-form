import React, { useEffect, useRef, useState } from "react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Button, Icon, Modal } from "semantic-ui-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SectionWrapper } from "./field_components/SectionWrapper";
import { FieldsContent } from "./FieldsContent";
import PropTypes from "prop-types";


const RecoveryModal = ({
  confirmModalRef,
  focusFirstElement,
  handleStorageData,
  isDraft,
  isVersionDraft,
  setRecoveryAsked,
}) => {
  const [open, setOpen] = useState(true);
  const firstButtonRef = useRef(null);
  useEffect(() => {
    window.setTimeout(() => {
      firstButtonRef.current.focus();
    }, 20);
  }, []);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      <Modal.Header>
        <Icon name="redo" /> {i18next.t("Recover unsaved information?")}
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>
            {i18next.t(
              "This form was closed with unsaved information. Do you want to recover it and continue with the same work?"
            )}
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          // color="black"
          content={
            isDraft
              ? i18next.t("No, start a new work")
              : i18next.t("No, start from the saved version")
          }
          onClick={() => {
            setOpen(false);
            handleStorageData(false);
            focusFirstElement();
            setRecoveryAsked(true);
          }}
          ref={firstButtonRef}
        />
        <Button
          content={
            isDraft
              ? i18next.t("Yes, recover the unsaved draft")
              : i18next.t("Yes, recover the unsaved changes")
          }
          labelPosition="right"
          icon="checkmark"
          onClick={() => {
            setOpen(false);
            handleStorageData(true);
            focusFirstElement();
            setRecoveryAsked(true);
          }}
          positive
          ref={confirmModalRef}
        />
      </Modal.Actions>
    </Modal>
  );
};

const FormPage = ({
  commonFieldProps,
  id,
  subsections,
}) => {
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
                      commonFieldProps,
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
                  commonFieldProps,
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
  commonFieldProps: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  subsections: PropTypes.array.isRequired,
}

export { FieldsContent, FormPage };
