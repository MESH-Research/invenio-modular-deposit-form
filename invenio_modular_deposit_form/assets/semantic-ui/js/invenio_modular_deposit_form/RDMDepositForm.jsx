// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// based on portions of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
// Copyright (C) 2022-2023 KTH Royal Institute of Technology.
//
// The Knowledge Commons Repository and Invenio App RDM are both free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { DepositFormApp, FormFeedback } from "@js/invenio_rdm_records";
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
import PropTypes, { object } from "prop-types";
import Overridable from "react-overridable";
import {
  flattenKeysDotJoined,
  flattenWrappers,
  getTouchedParent,
} from "./utils";
import { fieldComponents } from "./componentsMap";
import { FormPage } from "./FormPage";
import { initial, set } from "lodash";

const validator = require(`@js/invenio_modular_deposit_form_extras/validator.js`);
const validationSchema = validator?.validationSchema
  ? validator?.validationSchema
  : null;
const validate = validator?.validate ? validator?.validate : null;

// React Context to track the current form values.
// Will contain the Formik values object passed up from a
// form field.
const FormValuesContext = createContext();

export const RDMDepositForm = ({
  commonFields,
  config,
  currentUserprofile,
  defaultFieldValues,
  defaultResourceType,
  descriptionModifications,
  extraRequiredFields,
  files,
  fieldsByType,
  helpTextModifications,
  iconModifications,
  labelModifications,
  record,
  permissions,
  pidsConfigOverrides,
  placeholderModifications,
  preselectedCommunity,
  priorityFieldValues,
}) => {
  const formPages = commonFields[0].subsections;
  const formPageSlugs = formPages.map(({ section }) => section);
  const [currentFormPage, setCurrentFormPage] = useState(formPages[0].section);
  const [nextFormPage, setNextFormPage] = useState(null);
  const [confirmingPageChange, setConfirmingPageChange] = useState(false);
  const [currentValues, setCurrentValues] = useState({});
  const [currentErrors, setCurrentErrors] = useState({});
  const [currentInitialErrors, setCurrentInitialErrors] = useState({});
  const [pagesWithErrors, setPagesWithErrors] = useState({});
  const [pagesWithTouchedErrors, setPagesWithTouchedErrors] = useState({});
  const [currentTouched, setCurrentTouched] = useState({});
  const [currentResourceType, setCurrentResourceType] =
    useState(defaultResourceType);
  const [currentTypeFields, setCurrentTypeFields] = useState(
    fieldsByType[defaultResourceType]
  );
  const [fieldTouchHandler, setFieldTouchHandler] = useState();
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
  console.log("RDMDepositForm values", currentValues);
  const [recoveryAsked, setRecoveryAsked] = useState(false);
  const [storageDataPresent, setStorageDataPresent] = useState(false);
  const confirmModalRef = useRef();

  // fix sticky footer overlapping content when navigating by keyboard
  // combined with css scroll-margin-bottom
  useEffect(() => {
    function handleFocus(event) {
      event.target.scrollIntoView({ block: "center", behavior: "smooth" });
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

  const updateFormErrorState = (errors, touched, initialErrors) => {
    const errorFields = flattenKeysDotJoined(errors);
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
          touchedFields.includes(item) || getTouchedParent(currentTouched, item)
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

  useEffect(() => {
    updateFormErrorState(currentErrors, currentTouched, currentInitialErrors);
  }, [currentErrors, currentTouched, currentInitialErrors]);

  // TODO: Make ALL vocabulary be generated by backend.
  // Currently, some vocabulary is generated by backend and some is
  // generated by frontend here. Iteration is faster and abstractions can be
  // discovered by generating vocabulary here. Once happy with vocabularies,
  // then we can generate it in the backend.
  const vocabularies = {
    metadata: {
      ...config.vocabularies,

      creators: {
        ...config.vocabularies.creators,
        type: [
          { text: "Person", value: "personal" },
          { text: "Organization", value: "organizational" },
        ],
      },

      contributors: {
        ...config.vocabularies.contributors,
        type: [
          { text: "Person", value: "personal" },
          { text: "Organization", value: "organizational" },
        ],
      },
      identifiers: {
        ...config.vocabularies.identifiers,
      },
    },
  };

  // check if files are present
  let noFiles = false;
  if (
    !Array.isArray(files.entries) ||
    (!files.entries.length && record.is_published)
  ) {
    noFiles = true;
  }

  const focusFirstElement = () => {
    setTimeout(() => {
      // FIXME: workaround since file uploader has inaccessible first input
      const targetIndex = currentFormPage === "page-6" ? 1 : 0;
      const idString = `InvenioAppRdm\\.Deposit\\.FormPage\\.${currentFormPage}`;
      const newInputs = document.querySelectorAll(
        `#${idString} button, #${idString} input, #${idString} .selection.dropdown input`
      );
      const newFirstInput = newInputs[targetIndex];
      newFirstInput?.focus();
      console.log("scrolling: focusing on", newFirstInput);
    }, 100);
  };

  useLayoutEffect(() => {
    focusFirstElement();
  }, [currentFormPage]);

  const handlePageChangeCancel = () => {
    setConfirmingPageChange(false);
    focusFirstElement();
  };

  const handlePageChangeConfirm = () => {
    setConfirmingPageChange(false);
    handleFormPageChange(null, {
      value: nextFormPage,
    });
  };

  const handleFormPageChange = (event, { value }) => {
    for (const field of formPageFields[currentFormPage]) {
      fieldTouchHandler(field);
      // let str = `*[id*=${field}]`
      //   .split(".")
      //   .join("\\.")
      //   .replace(":", "\\:")
      //   .replace("_", "\\_");
      // document.querySelectorAll(str).forEach((e) => {
      //   e.focus();
      //   e.blur();
      // });
    }
    if (pagesWithErrors[currentFormPage]?.length > 0 && !confirmingPageChange) {
      setConfirmingPageChange(true);
      setTimeout(() => {
        confirmModalRef.current.focus();
      }, 20);
      setNextFormPage(value);
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

  const handleValuesChange = (values) => {
    setCurrentValues(values);
    setCurrentResourceType(values.metadata.resource_type);
    setCurrentTypeFields(fieldsByType[values.metadata.resource_type]);
  };

  // receive error values up from Formik context to main form context
  // collect form field labels for current errors, and set pages with errors
  const handleErrorsChange = (errors, touched, initialErrors) => {
    console.log("handleErrorsChange errors", errors);
    console.log("handleErrorsChange touched", touched);
    console.log("handleErrorsChange fields", currentTypeFields);
    if (errors != {}) {
      setCurrentErrors(errors);
      setCurrentTouched(touched);
    }
    if (initialErrors != {}) {
      setCurrentInitialErrors(initialErrors);
    }
  };

  if (!!pidsConfigOverrides?.doi) {
    Object.assign(
      config.pids.filter((pid) => pid.scheme === "doi")[0],
      pidsConfigOverrides.doi
    );
  }

  // pass setFieldTouched up from Formik context to main form context
  const handleSettingFieldTouched = (setTouchedFunction) => {
    setFieldTouchHandler(() => setTouchedFunction);
  };

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

  return (
    <FormValuesContext.Provider
      value={{
        currentValues,
        handleValuesChange,
        currentErrors,
        currentTouched,
        handleErrorsChange,
        handleFormPageChange,
      }}
    >
      <DepositFormApp
        config={config}
        record={record}
        preselectedCommunity={preselectedCommunity}
        files={files}
        permissions={permissions}
        validate={validate}
        validationSchema={validationSchema}
      >
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

        <Container text id="rdm-deposit-form" className="rel-mt-1">
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
                          currentFormPage={section}
                          currentUserprofile={currentUserprofile}
                          commonFieldProps={commonFieldProps}
                          focusFirstElement={focusFirstElement}
                          id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                          pageFields={formPageFields[section]}
                          pageNums={formPages.map(({ section }) => section)}
                          recoveryAsked={recoveryAsked}
                          setRecoveryAsked={setRecoveryAsked}
                          storageDataPresent={storageDataPresent}
                          setStorageDataPresent={setStorageDataPresent}
                          subsections={actualSubsections}
                          handleSettingFieldTouched={handleSettingFieldTouched}
                        />
                      </div>
                    )
                  );
                })}
              </Transition.Group>

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
            </Grid.Column>
          </Grid>
        </Container>
      </DepositFormApp>
    </FormValuesContext.Provider>
  );
};

RDMDepositForm.propTypes = {
  config: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  preselectedCommunity: PropTypes.object,
  files: PropTypes.object,
  permissions: PropTypes.object,
};

RDMDepositForm.defaultProps = {
  preselectedCommunity: undefined,
  permissions: null,
  files: null,
};

export { FormValuesContext };
