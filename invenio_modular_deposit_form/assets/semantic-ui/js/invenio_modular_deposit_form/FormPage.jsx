import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Button, Icon, Modal } from "semantic-ui-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormValuesContext } from "./RDMDepositForm";
import { SectionWrapper } from "./field_components/SectionWrapper";
import { FieldsContent } from "./FieldsContent";
import { initial } from "lodash";
import { areDeeplyEqual } from "./utils";

function useIsInViewport(ref) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsIntersecting(entry.isIntersecting)
      ),
    []
  );

  useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}

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
  currentFormPage,
  focusFirstElement,
  id,
  pageNums,
  recoveryAsked,
  setRecoveryAsked,
  storageDataPresent,
  setStorageDataPresent,
  subsections,
  handleSettingFieldTouched,
}) => {
  const {
    errors,
    initialErrors,
    initialTouched,
    initialValues,
    isValid,
    setFieldValue,
    setFieldTouched,
    setTouched,
    setValues,
    touched,
    validateField,
    validateForm,
    values,
    ...otherProps
  } = useFormikContext();
  const {
    currentValues,
    handleValuesChange,
    currentErrors,
    currentTouched,
    handleErrorsChange,
    handleFormPageChange,
  } = useContext(FormValuesContext);
  // console.log("FormPage formik errors", errors);
  // console.log("FormPage formik touched", touched);
  // console.log("FormPage formik values", values);
  const currentPageIndex = pageNums.indexOf(currentFormPage);
  const nextPageIndex = currentPageIndex + 1;
  const previousPageIndex = currentPageIndex - 1;
  const nextPage =
    nextPageIndex < pageNums.length ? pageNums[nextPageIndex] : null;
  const previousPage =
    previousPageIndex >= 0 ? pageNums[previousPageIndex] : null;
  const pageTargetRef = useRef(null);
  const confirmModalRef = useRef(null);
  // FIXME: sticky footer deactivated
  const pageTargetInViewport = useIsInViewport(pageTargetRef);
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);

  //pass values up from Formik context to main form context
  useEffect(() => {
    handleValuesChange(values);
    if (!!recoveryAsked && !areDeeplyEqual(initialValues, values, ["ui"])) {
      window.localStorage.setItem(
        `rdmDepositFormValues.${commonFieldProps.currentUserprofile.id}.${values.id}`,
        JSON.stringify(values)
      );
    }
  }, [values]);

  //pass errors up from Formik context to main form context on initial render
  useEffect(() => {
    if (currentErrors !== errors) {
      handleErrorsChange(
        errors,
        touched,
        initialErrors,
        initialTouched,
        isValid
      );
    }
  }, []);

  // on first load, check if there is data in local storage
  useEffect(() => {
    const user = commonFieldProps.currentUserprofile.id;
    const storageValuesKey = `rdmDepositFormValues.${user}.${initialValues?.id}`;
    const storageValues = window.localStorage.getItem(storageValuesKey);

    const storageValuesObj = JSON.parse(storageValues);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, values, ["ui"])
    ) {
      setRecoveredStorageValues(storageValuesObj);
      setStorageDataPresent(true);
    } else {
      setRecoveryAsked(true);
    }
  }, []);

  const handleStorageData = (recover) => {
    if (recover) {
      async function setinitialvalues() {
        await setValues(recoveredStorageValues, false);
      }
      setinitialvalues();
      setRecoveredStorageValues(null);
    }
    window.localStorage.removeItem(
      `rdmDepositFormValues.${commonFieldProps.currentUserprofile.id}.${values.id}`
    );
  };

  //pass setFieldTouched up from Formik context to main form context
  useEffect(() => {
    handleSettingFieldTouched(setFieldTouched);
  }, []);

  //pass errors up from Formik context to main form context when they change
  useEffect(() => {
    console.log("errors or touched changed errors", errors);
    console.log("errors or touched changed touched", touched);
    if (currentErrors !== errors || currentTouched !== touched) {
      handleErrorsChange(
        errors,
        touched,
        initialErrors,
        initialTouched,
        isValid
      );
    }
  }, [errors, touched]);

  const handleButtonClick = (event, { value }) => {
    handleFormPageChange(event, { value });
  };

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

        <div
          className={`ui container ${
            // "sticky-footer-static"
            // FIXME: sticky footer deactivated
            pageTargetInViewport
              ? "sticky-footer-static"
              : "sticky-footer-fixed"
          }`}
        >
          {!!previousPage && (
            <Button
              type="button"
              floated="left"
              onClick={handleButtonClick}
              value={previousPage}
              icon
              labelPosition="left"
            >
              <Icon name="left arrow" />
              Back
            </Button>
          )}

          {!!nextPage && (
            <Button
              primary
              type="button"
              floated="right"
              onClick={handleButtonClick}
              value={nextPage}
              icon
              labelPosition="right"
            >
              <Icon name="right arrow" />
              Continue
            </Button>
          )}
        </div>
        <div id="sticky-footer-observation-target" ref={pageTargetRef}></div>
      </div>

      {!recoveryAsked && storageDataPresent && (
        <RecoveryModal
          isDraft={values.status === "draft"}
          isVersionDraft={values.status === "new_version_draft"}
          confirmModalRef={confirmModalRef}
          focusFirstElement={focusFirstElement}
          handleStorageData={handleStorageData}
          setRecoveryAsked={setRecoveryAsked}
        />
      )}
    </DndProvider>
  );
};

export { FieldsContent, FormPage };
