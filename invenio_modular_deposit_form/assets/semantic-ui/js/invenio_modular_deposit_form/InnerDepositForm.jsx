import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { combineReducers } from "redux";
import { useStore, useDispatch } from "react-redux";
import { useFormikContext } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { FormFeedback } from "@js/invenio_rdm_records";
import { depositReducer, fileReducer } from "@js/invenio_rdm_records";
import {
  Button,
  Confirm,
  Container,
  Icon,
  Grid,
  Modal,
  Step,
  Transition,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { FormPage } from "./framing_components/FormPage";
import {
  areDeeplyEqual,
  flattenKeysDotJoined,
  flattenWrappers,
  getTouchedParent,
  isNearViewportBottom,
} from "./utils";
import {
  RecoveryModal,
} from "./framing_components/RecoveryModal";
import { useIsInViewport } from "./hooks/useIsInViewport";

const FormUIStateContext = createContext();

/*
This component provides the frame for deposit form page navigation and error handling. State for form values and errors are handled by Formik and accessed from the Formik context. This component manages form *ui* state.

Visually, this component renders the form page navigation stepper and the form pages themselves. It also provides the confirmation modals for navigating between form pages with errors and for recovering autosaved form values.
*/
const InnerDepositForm = ({
  commonFields,
  config,
  currentUserprofile,
  defaultFieldValues,
  defaultResourceType,
  descriptionModifications=undefined,
  extraRequiredFields=undefined,
  fieldsByType,
  fieldComponents,
  files=null,
  helpTextModifications=undefined,
  iconModifications=undefined,
  labelModifications=undefined,
  permissions=null,
  pidsConfigOverrides=undefined,
  placeholderModifications=undefined,
  priorityFieldValues=undefined,
  record,
  vocabularies,
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


  // state for handling form data local storage
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);

  // check if files are actually present
  let noFiles = false;
  if (
    !Array.isArray(files.entries) ||
    (!files.entries.length && record.is_published)
  ) {
    noFiles = true;
  }

  // state for form page navigation
  const formPages = commonFields[0].subsections;
  const formPageSlugs = formPages.map(({ section }) => section);
  const [currentFormPage, setCurrentFormPage] = useState(formPages[0].section);
  const pageNums = formPages.map(({ section }) => section);
  const currentPageIndex = pageNums.indexOf(currentFormPage);
  const nextPageIndex = currentPageIndex + 1;
  const previousPageIndex = currentPageIndex - 1;
  const nextFormPage =
    nextPageIndex < pageNums.length ? pageNums[nextPageIndex] : null;
  const previousFormPage =
    previousPageIndex >= 0 ? pageNums[previousPageIndex] : null;
  const [confirmingPageChange, setConfirmingPageChange] = useState(false);
  const [pagesWithErrors, setPagesWithErrors] = useState({});
  const [pagesWithTouchedErrors, setPagesWithTouchedErrors] = useState({});

  const [currentResourceType, setCurrentResourceType] =
    useState(defaultResourceType);
  const [currentTypeFields, setCurrentTypeFields] = useState(
    fieldsByType[defaultResourceType]
  );
  // const [fieldTouchHandler, setFieldTouchHandler] = useState();
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
  const customFieldsUI = config.custom_fields.ui;
  const [formPageFields, setFormPageFields] = useState({});
  console.log("RDMDepositForm values", values);
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
        console.log("scrolling to input near bottom of page");
        event.target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    const inputs = document.querySelectorAll(
      "#rdm-deposit-form input, #rdm-deposit-form button, #rdm-deposit-form select"
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


  // handle form page navigation by URL param and history
  const setFormPageInHistory = (value) => {
    if (value === undefined) {
      value = currentFormPage;
    }
    let urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("depositFormPage")) {
      urlParams.append("depositFormPage", value);
    } else if (!urlParams.depositFormPage !== value) {
      urlParams.set("depositFormPage", value);
    }
    const currentBaseURL = window.location.origin;
    const currentPath = window.location.pathname;
    const currentParams = urlParams.toString();
    const newCurrentURL = `${currentBaseURL}${currentPath}?${currentParams}`;
    window.history.pushState("fake-route", document.title, newCurrentURL);
  };

  const handleFormPageParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let urlFormPage = urlParams.get("depositFormPage");
    if (!!urlFormPage && formPageSlugs.includes(urlFormPage)) {
      setCurrentFormPage(urlFormPage);
    } else {
      urlFormPage = "1";
    }
    return urlFormPage;
  };

  useEffect(() => {
    const startingParam = handleFormPageParam();
    // Add a fake history event so that the back button does nothing if pressed once
    setFormPageInHistory(startingParam);
    window.addEventListener("popstate", handleFormPageParam);

    return () => {
      window.removeEventListener("popstate", handleFormPageParam);
      // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
      if (window.history.state === "fake-route") {
        window.history.back();
      }
    };
  }, []);

  // handle form page error state for client-side validation
  const updateFormErrorState = (errors, touched, initialErrors) => {
    const errorFields = flattenKeysDotJoined(errors);
    console.log("errors****************************", errors);
    console.log("formpagefields****************************", formPageFields);
    const touchedFields = flattenKeysDotJoined(touched);
    const initialErrorFields = flattenKeysDotJoined(initialErrors);
    let errorPages = {};
    let touchedErrorPages = {};
    // for each page...

    for (const p of formPages) {
      // add page to error pages if the two lists overlap
      const pageErrorFields = formPageFields[p.section]?.filter((item) =>
        errorFields.includes(item)
      );
      const pageTouchedErrorFields = pageErrorFields?.filter(
        (item) =>
          touchedFields.includes(item) || getTouchedParent(touched, item)
      );
      const pageInitialErrorFields = formPageFields[p.section]?.filter((item) =>
        initialErrorFields.includes(item)
      );
      if (pageErrorFields?.length > 0) {
        errorPages[p.section] = pageErrorFields;
      }
      if (pageTouchedErrorFields?.length > 0) {
        touchedErrorPages[p.section] = pageTouchedErrorFields;
      } else if (
        pageInitialErrorFields?.length > 0 &&
        pageErrorFields?.length > 0
      ) {
        touchedErrorPages[p.section] = pageInitialErrorFields;
      }
    }
    setPagesWithErrors(errorPages);
    setPagesWithTouchedErrors(touchedErrorPages);
    // TODO: don't need to navigate back now because errors handled client-side?
    // errorPages.length && setCurrentFormPage(errorPages[0].section);
  };

  useEffect(() => {
    updateFormErrorState(errors, touched, initialErrors);
  }, [errors, touched, initialErrors]);

  // make sure first page element is focused when navigating
  // passed down to FormPage but also called by confirm modal
  const focusFirstElement = (currentFormPage) => {
    // FIXME: timing issue
    setTimeout(() => {
      // FIXME: workaround since file uploader has inaccessible first input
      const targetIndex = currentFormPage === "page-6" ? 1 : 0;
      const idString = `InvenioAppRdm\\.Deposit\\.FormPage\\.${currentFormPage}`;
      const newInputs = document.querySelectorAll(
        `#${idString} button, #${idString} input, #${idString} .selection.dropdown input`
      );
      console.log("newInputs", newInputs);
      const newFirstInput = newInputs[targetIndex];
      if ( newFirstInput !== undefined ) {
        newFirstInput?.focus();
        window.scrollTo(0, 0);
        console.log("focusing on first input:", newFirstInput);
      }
    }, 100);
  };

  // handlers for page change confirmation modal
  const handlePageChangeCancel = () => {
    setConfirmingPageChange(false);
    focusFirstElement(currentFormPage);
  };

  const handlePageChangeConfirm = () => {
    setConfirmingPageChange(false);
    handleFormPageChange(null, {
      value: nextFormPage,
    });
  };

  const handleFormPageChange = (event, { value }) => {
    for (const field of formPageFields[currentFormPage]) {
      setFieldTouched(field);
    }
    if (pagesWithErrors[currentFormPage]?.length > 0 && !confirmingPageChange) {
      setConfirmingPageChange(true);
      setTimeout(() => {
        confirmModalRef.current.focus();
      }, 20);
      // setNextFormPage(value);
    } else {
      setCurrentFormPage(value);
      setFormPageInHistory(value);
    }
  };

  // update formPageFields when currentResourceType changes
  useEffect(() => {
    let newTypeFields = {};
    for (const p of formPages) {
      // collect form widget slugs
      let adjustedTypeFields = currentTypeFields;
      if (
        adjustedTypeFields &&
        adjustedTypeFields[p.section] &&
        adjustedTypeFields[p.section][0].same_as
      ) {
        const newType = currentTypeFields[p.section][0].same_as;
        adjustedTypeFields = fieldsByType[newType];
        setCurrentTypeFields(adjustedTypeFields);
      }
      const pageFields =
        !!adjustedTypeFields && !!adjustedTypeFields[p.section]
          ? flattenWrappers({ subsections: adjustedTypeFields[p.section] })
          : flattenWrappers(p);
      // get form field label for each slug
      const pageMetaFields = pageFields.reduce((accum, { component }) => {
        accum = accum.concat(fieldComponents[component][1]);
        return accum;
      }, []);
      newTypeFields[p.section] = pageMetaFields;
    }
    setFormPageFields(newTypeFields);
  }, [currentResourceType]);

  // update currentResourceType and currentTypeFields when values change
  useEffect(() => {
    setCurrentResourceType(values.metadata.resource_type);
    setCurrentTypeFields(fieldsByType[values.metadata.resource_type]);
  }, [values.metadata.resource_type]);

  if (!!pidsConfigOverrides?.doi) {
    Object.assign(
      config.pids.filter((pid) => pid.scheme === "doi")[0],
      pidsConfigOverrides.doi
    );
  }

  const commonFieldProps = {
    config: config,
    currentUserprofile: currentUserprofile,
    fieldComponents: fieldComponents,
    noFiles: noFiles,
    record: record,
    vocabularies: vocabularies,
    permissions: permissions,
    customFieldsUI: customFieldsUI,
    currentResourceType: currentResourceType,
    ...currentFieldMods,
  };

  //keep changed values in local storage
  useEffect(() => {
    if (!!recoveryAsked && !areDeeplyEqual(initialValues, values, ["ui"])) {
      window.localStorage.setItem(
        `rdmDepositFormValues.${commonFieldProps.currentUserprofile.id}.${values.id}`,
        JSON.stringify(values)
      );
    }
  }, [values]);

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


  return (
    <Container text id="rdm-deposit-form" className="rel-mt-1">
      <FormUIStateContext.Provider value={
        {handleFormPageChange: handleFormPageChange}
      }>
      <Overridable
        id="InvenioAppRdm.Deposit.FormFeedback.container"
        labels={config.custom_fields.error_labels}
        fieldPath="message"
      >
        <FormFeedback
          fieldPath="message"
          labels={config.custom_fields.error_labels}
        />
      </Overridable>

      <Grid className="mt-25">
        <Grid.Column mobile={16} tablet={16} computer={16}>
          <h2>
            {i18next.t(`${record.id !== null ? "Updating " : "New "}
            ${record.status === "draft" ? "Draft " : "Published "}Deposit`)}
          </h2>
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
                    ${!!pagesWithTouchedErrors[section] ? "has-error" : ""}`}
                type="button"
              >
                <Step.Content>
                  <Step.Title>{i18next.t(label)}</Step.Title>
                </Step.Content>
              </Step>
            ))}
          </Step.Group>

          <Transition.Group
            animation="fade"
            duration={{ show: 1000, hide: 20 }}
          >
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
                      commonFieldProps={commonFieldProps}
                      currentFormPage={currentFormPage}
                      focusFirstElement={focusFirstElement}
                      id={`InvenioAppRdm.Deposit.FormPage.${section}`}
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
              pageTargetInViewport
                ? "sticky-footer-static"
                : "sticky-footer-fixed"
            }`}
          >
            {!!previousFormPage && (
              <Button
                type="button"
                onClick={handleFormPageChange}
                value={previousFormPage}
                icon
                labelPosition="left"
              >
                <Icon name="left arrow" />
                Back
              </Button>
            )}

            {!!nextFormPage && (
              <Button
                primary
                type="button"
                onClick={handleFormPageChange}
                value={nextFormPage}
                icon
                labelPosition="right"
              >
                <Icon name="right arrow" />
                Continue
              </Button>
            )}
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
              <button className="ui button">
                {i18next.t("Continue anyway")}
              </button>
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
              focusFirstElement={focusFirstElement}
              handleStorageData={handleStorageData}
              setRecoveryAsked={setRecoveryAsked}
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
  config: PropTypes.object.isRequired,
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
  pidsConfigOverrides: PropTypes.object,
  priorityFieldValues: PropTypes.object,
  record: PropTypes.object.isRequired,
  vocabularies: PropTypes.object.isRequired,
};

export { InnerDepositForm, FormUIStateContext };
