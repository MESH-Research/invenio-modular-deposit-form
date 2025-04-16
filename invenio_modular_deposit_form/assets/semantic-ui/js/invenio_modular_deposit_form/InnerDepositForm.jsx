import React, { createContext, useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { useFormikContext } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import {
  Button,
  Confirm,
  Container,
  Icon,
  Grid,
  Message,
  Modal,
  Step,
  Transition,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import { FormPage } from "./framing_components/FormPage";
import {
  areDeeplyEqual,
  isNearViewportBottom,
} from "./utils";
import { RecoveryModal } from "./framing_components/RecoveryModal";
import { useCurrentResourceTypeFields } from "./hooks/useCurrentResourceTypeFields";
import { useFormPageNavigation } from "./hooks/useFormPageNavigation";
import { useIsInViewport } from "./hooks/useIsInViewport";
import { FormErrorManager } from "./helpers/FormErrorManager";

const FormUIStateContext = createContext();

/**
 * Make sure first page element is focused when navigating
 *
 * Passed down to FormPage but also called by confirm modal
 *
 * Timeout allows time for the page to render before focusing the first element.
 *
 * @param {string} currentFormPage - The current form page
 * @param {boolean} recoveryAskedFlag - Whether the recovery modal is open
 */
const focusFirstElement = (currentFormPage, recoveryAskedFlag = false, recoveryAsked = true) => {
  // FIXME: timing issue
  setTimeout(() => {
    // NOTE: recoveryAsked is true by default if no recovery data present
    if (recoveryAsked || recoveryAskedFlag) {
      // FIXME: workaround since file uploader has inaccessible first input
      const targetIndex = currentFormPage === "page-6" ? 1 : 0;
      const idString = `InvenioAppRdm\\.Deposit\\.FormPage\\.${currentFormPage}`;
      const newInputs = document.querySelectorAll(
        `#${idString} button, #${idString} input, #${idString} .selection.dropdown input`
      );
      const newFirstInput = newInputs[targetIndex];
      if (newFirstInput !== undefined) {
        newFirstInput?.focus();
        window.scrollTo(0, 0);
      }
    }
  }, 100);
};


/*
This component provides the frame for deposit form page navigation and error handling. State for form values and errors are handled by Formik and accessed from the Formik context. This component manages form *ui* state.

Visually, this component renders the form page navigation stepper and the form pages themselves. It also provides the confirmation modals for navigating between form pages with errors and for recovering autosaved form values.
*/
const InnerDepositForm = ({
  commonFields,
  currentUserprofile,
  defaultFieldValues,
  defaultResourceType,
  descriptionModifications = undefined,
  extraRequiredFields = undefined,
  fieldsByType,
  fieldComponents,
  files = null,
  helpTextModifications = undefined,
  iconModifications = undefined,
  labelModifications = undefined,
  permissions = null,
  placeholderModifications = undefined,
  preselectedCommunity = undefined,
  priorityFieldValues = undefined,
  previewableExtensions = [], // Add this new prop with a default value
  record,
  vocabularies,
}) => {
  const {
    errors,
    initialErrors,
    initialTouched,
    initialValues,
    isValid,
    setFieldError,
    setFieldValue,
    setFieldTouched,
    setInitialValues,
    setTouched,
    setValues,
    touched,
    validateField,
    validateForm,
    values,
    ...otherProps
  } = useFormikContext();

  const store = useStore();
  const config = store.getState().deposit.config;
  const selectedCommunity = store.getState().deposit.editorState.selectedCommunity;
  let selectedCommunityLabel = selectedCommunity?.metadata?.title;
  if (
    !!selectedCommunityLabel &&
    !selectedCommunityLabel?.toLowerCase().includes("collection")
  ) {
    selectedCommunityLabel = `the "${selectedCommunityLabel}" collection`;
  }

  // state for handling form data local storage
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);

  // check if files are actually present
  let noFiles = false;
  if (!Array.isArray(files.entries) || (!files.entries.length && record.is_published)) {
    noFiles = true;
  }

  // state for form page navigation
  const formPages = commonFields[0].subsections;
  const [currentFormPage, setCurrentFormPage] = useState(formPages[0].section);

  // state for form page error handling
  const [pagesWithErrors, setPagesWithErrors] = useState({});
  const [pagesWithFlaggedErrors, setPagesWithFlaggedErrors] = useState({});

  // state for adapting fields to resource type
  const [currentResourceType, setCurrentResourceType] = useState(defaultResourceType);
  const [currentTypeFields, setCurrentTypeFields] = useState(
    fieldsByType[defaultResourceType]
  );
  const currentFieldMods = {
    labelMods: labelModifications[currentResourceType],
    iconMods: iconModifications[currentResourceType],
    helpTextMods: helpTextModifications[currentResourceType],
    placeholderMods: placeholderModifications[currentResourceType],
    descriptionMods: descriptionModifications[currentResourceType],
    defaultFieldValues: defaultFieldValues[currentResourceType],
    priorityFieldValues: priorityFieldValues[currentResourceType],
    extraRequiredFields: extraRequiredFields[currentResourceType],
  };
  const [formPageFields, setFormPageFields] = useState({});
  const isNewVersionDraft = record.status === "new_version_draft" ? true : false;

  // state for recovering unsaved form values
  const [recoveryAsked, setRecoveryAsked] = useState(false);
  const [storageDataPresent, setStorageDataPresent] = useState(false);
  const confirmModalRef = useRef();

  // enable scrolling to sticky footer when navigating by keyboard
  const pageTargetRef = useRef(null);
  const pageTargetInViewport = useIsInViewport(pageTargetRef);

  // fix sticky footer overlapping content when navigating by keyboard
  // combined with css scroll-margin-bottom
  useEffect(() => {
    function handleFocus(event) {
      if (isNearViewportBottom(event.target, 100)) {
        event.target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    const inputs = document.querySelectorAll(
      "#rdm-deposit-form input, #rdm-deposit-form button:not(.back-button):not(.continue-button), #rdm-deposit-form select"
    );
    inputs.forEach((input) => {
      input.addEventListener("focus", handleFocus);
    });
    const textareas = document.querySelectorAll("#rdm-deposit-form textarea");
    textareas.forEach((textarea) => {
      textarea.addEventListener("focus", handleFocus);
    });
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("focus", handleFocus);
      });
      textareas.forEach((textarea) => {
        textarea.removeEventListener("focus", handleFocus);
      });
    };
  }, [currentFormPage]);

  // handle form page error state for client-side validation
  // NOTE: fields marked if error + touched or if initial error + untouched
  //       or initial error + touched + value unchanged
  //       (initial errors should become errors when touched and not fixed)
  // all fields must be set touched to trigger validation before submit
  // but then untouched after submission

  useEffect(() => {
    new FormErrorManager(
      formPages,
      formPageFields,
      initialErrors,
      errors,
      touched,
      initialValues,
      values
    ).updateFormErrorState(
      setFieldError,
      setFieldTouched,
      setPagesWithErrors,
      setPagesWithFlaggedErrors
    );
  }, [errors, touched, initialErrors, initialValues, values]);

  // handlers for recoveryAsked
  // focus first element when modal is closed to allow keyboard navigation
  const handleRecoveryAsked = () => {
    setRecoveryAsked(true);
    focusFirstElement(currentFormPage, true, recoveryAsked);
  };

  const {
    confirmingPageChange,
    nextFormPage,
    previousFormPage,
    handleFormPageChange,
    handlePageChangeCancel,
    handlePageChangeConfirm,
  } = useFormPageNavigation(
    formPages,
    currentFormPage,
    setCurrentFormPage,
    pagesWithErrors,
    confirmModalRef,
    focusFirstElement,
    recoveryAsked,
    setFieldTouched,
    formPageFields
  );

  useCurrentResourceTypeFields(
    currentResourceType,
    currentTypeFields,
    setCurrentTypeFields,
    setFormPageFields,
    formPages,
    fieldsByType,
    fieldComponents
  );

  // update currentResourceType and currentTypeFields when values change
  useEffect(() => {
    setCurrentResourceType(values.metadata.resource_type);
    setCurrentTypeFields(fieldsByType[values.metadata.resource_type]);
  }, [values.metadata.resource_type]);

  //keep changed form values in local storage
  useEffect(() => {
    if (!!recoveryAsked && !areDeeplyEqual(initialValues, values, ["ui"])) {
      window.localStorage.setItem(
        `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`,
        JSON.stringify(values)
      );
    }
  }, [values]);

  // on first load, check if there is data in local storage
  useEffect(() => {
    const user = currentUserprofile.id;
    const storageValuesKey = `rdmDepositFormValues.${user}.${initialValues?.id}`;
    const storageValues = window.localStorage.getItem(storageValuesKey);
    const storageValuesObj = JSON.parse(storageValues);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, values, [
        "ui",
        "metadata.resource_type",
        "metadata.publication_date",
        "pids.doi",
      ])
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
        await setInitialValues(recoveredStorageValues, false);
      }
      setinitialvalues();
      setRecoveredStorageValues(null);
    }
    window.localStorage.removeItem(
      `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`
    );
  };

  return (
    <Container text id="rdm-deposit-form" className="rel-mt-1">
      <Message warning className="mobile-deposit-warning mobile only">
        <Message.Header>
          <Icon name="info circle" />
          Mobile device support is coming!
        </Message.Header>
        <p>
          We are working to optimize this deposit form for mobile devices. In the
          meantime, please use a device with a larger screen to deposit your work.
        </p>
      </Message>
      <FormUIStateContext.Provider
        value={{
          handleFormPageChange: handleFormPageChange,
          currentUserprofile: currentUserprofile,
          currentFieldMods: currentFieldMods,
          currentResourceType: currentResourceType,
          fieldComponents: fieldComponents,
          noFiles: noFiles,
          vocabularies: vocabularies,
          previewableExtensions: previewableExtensions,
        }}
      >
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={16}>
            <Grid.Row className="deposit-form-header">
              <h1 className="ui header">
                {i18next.t(`${
                  record.id !== null
                    ? isNewVersionDraft
                      ? "New Version of "
                      : "Updating "
                    : "New "
                }
            ${
              ["draft", "draft_with_review"].includes(record.status)
                ? "Draft "
                : "Published "
            }Work`)}
              </h1>
              {!!selectedCommunityLabel && (
                <h2 className="ui header preselected-community-header">
                  for {selectedCommunityLabel}
                </h2>
              )}
            </Grid.Row>
            <Step.Group
              widths={formPages.length}
              className="upload-form-pager"
              fluid={true}
              size={"small"}
            >
              {formPages.map(({ section, label }, index) => (
                <Step
                  key={index}
                  as={Button}
                  active={currentFormPage === section}
                  link
                  onClick={handleFormPageChange}
                  value={section}
                  formNoValidate
                  className={`ui button upload-form-stepper-step ${section}
                    ${!!pagesWithFlaggedErrors[section] ? "has-error" : ""}`}
                  type="button"
                >
                  <Step.Content>
                    <Step.Title>{i18next.t(label)}</Step.Title>
                  </Step.Content>
                </Step>
              ))}
            </Step.Group>

            <Transition.Group animation="fade" duration={{ show: 1000, hide: 20 }}>
              {formPages.map(({ section, subsections }, index) => {
                let actualSubsections = subsections;
                if (!!currentTypeFields && !!currentTypeFields[section]) {
                  actualSubsections = currentTypeFields[section];
                  if (!!actualSubsections[0].same_as) {
                    actualSubsections =
                      fieldsByType[actualSubsections[0].same_as][section];
                  }
                }
                return (
                  currentFormPage === section && (
                    <div key={index}>
                      <FormPage
                        currentFormPage={currentFormPage}
                        focusFirstElement={focusFirstElement}
                        id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                        recoveryAsked={recoveryAsked}
                        subsections={actualSubsections}
                      />
                    </div>
                  )
                );
              })}
            </Transition.Group>

            <div id="sticky-footer-observation-target" ref={pageTargetRef}></div>
            <div
              className={`ui container ${
                pageTargetInViewport ? "sticky-footer-static" : "sticky-footer-fixed"
              }`}
            >
              <Grid className="deposit-form-footer">
                <Grid.Column width={3}>
                  {!!previousFormPage && (
                    <Button
                      type="button"
                      onClick={handleFormPageChange}
                      value={previousFormPage}
                      icon
                      labelPosition="left"
                      className="back-button"
                    >
                      <Icon name="left arrow" />
                      Back
                    </Button>
                  )}
                </Grid.Column>

                <Grid.Column className="footer-message" width={10}>
                  Your current form values are backed up automatically{" "}
                  <i>in this browser</i>.<br />
                  Save a persistent draft to the cloud on the "Save & Publish" tab.
                </Grid.Column>

                <Grid.Column width={3}>
                  {!!nextFormPage && (
                    <Button
                      type="button"
                      onClick={handleFormPageChange}
                      value={nextFormPage}
                      icon
                      labelPosition="right"
                      className="continue-button primary"
                    >
                      <Icon name="right arrow" />
                      Continue
                    </Button>
                  )}
                </Grid.Column>
              </Grid>
            </div>

            <Confirm
              icon="question circle outline"
              id="confirm-page-change"
              className="confirm-page-change"
              open={confirmingPageChange}
              header={i18next.t("Hmmm...")}
              content={
                <Modal.Content image>
                  <Icon name="question circle outline" size="huge" />
                  <Modal.Description>
                    {i18next.t(
                      "There are problems with the information you've entered. Do you want to fix them before moving on?"
                    )}
                  </Modal.Description>
                </Modal.Content>
              }
              confirmButton={
                <button className="ui button">{i18next.t("Continue anyway")}</button>
              }
              cancelButton={
                <button className="ui button positive" ref={confirmModalRef}>
                  {i18next.t("Fix the problems")}
                </button>
              }
              onCancel={handlePageChangeCancel}
              onConfirm={handlePageChangeConfirm}
            />

            {!recoveryAsked && storageDataPresent && (
              <RecoveryModal
                isDraft={values.status === "draft"}
                isVersionDraft={values.status === "new_version_draft"}
                confirmModalRef={confirmModalRef}
                handleStorageData={handleStorageData}
                setRecoveryAsked={handleRecoveryAsked}
              />
            )}
          </Grid.Column>
        </Grid>
      </FormUIStateContext.Provider>
    </Container>
  );
};

InnerDepositForm.propTypes = {
  commonFields: PropTypes.array.isRequired,
  currentUserprofile: PropTypes.object.isRequired,
  defaultFieldValues: PropTypes.object.isRequired,
  defaultResourceType: PropTypes.string.isRequired,
  descriptionModifications: PropTypes.object,
  extraRequiredFields: PropTypes.object,
  fieldsByType: PropTypes.object.isRequired,
  fieldComponents: PropTypes.object.isRequired,
  files: PropTypes.object.isRequired,
  helpTextModifications: PropTypes.object,
  iconModifications: PropTypes.object,
  labelModifications: PropTypes.object,
  permissions: PropTypes.object.isRequired,
  placeholderModifications: PropTypes.object,
  preselectedCommunity: PropTypes.object,
  priorityFieldValues: PropTypes.object,
  previewableExtensions: PropTypes.array, // Add this new prop type
  record: PropTypes.object.isRequired,
  vocabularies: PropTypes.object.isRequired,
};

export { InnerDepositForm, FormUIStateContext };
