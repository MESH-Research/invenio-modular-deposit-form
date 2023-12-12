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
  Grid,
  Step,
  Transition,
} from "semantic-ui-react";
import PropTypes, { object } from "prop-types";
import Overridable from "react-overridable";
import { flattenKeysDotJoined, flattenWrappers } from "./utils";
import { fieldComponents } from "./componentsMap";
import { FormPage } from "./FormPage";

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
  const [pagesWithErrors, setPagesWithErrors] = useState({});
  const [pagesWithTouchedErrors, setPagesWithTouchedErrors] = useState({});
  const [currentTouched, setCurrentTouched] = useState({});
  const [currentResourceType, setCurrentResourceType] =
    useState(defaultResourceType);
  const [currentTypeFields, setCurrentTypeFields] = useState(
    fieldsByType[defaultResourceType]
  );
  const currentFieldMods = {
    labelMods: labelModifications[currentResourceType],
    iconMods: iconModifications[currentResourceType],
    helpTextModifications: helpTextModifications[currentResourceType],
    placeholderMods: placeholderModifications[currentResourceType],
    descriptionMods: descriptionModifications[currentResourceType],
    defaultFieldValues: defaultFieldValues[currentResourceType],
    priorityFieldValues: priorityFieldValues[currentResourceType],
    extraRequiredFields: extraRequiredFields[currentResourceType],
  };
  const customFieldsUI = config.custom_fields.ui;
  const [formPageFields, setFormPageFields] = useState({});
  console.log("RDMDepositForm values", currentValues);

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

  const updateFormErrorState = (errors, touched) => {
    console.log("updateFormErrorState errors", errors);
    console.log("updateFormErrorState touched", touched);
    const errorFields = flattenKeysDotJoined(errors);
    const touchedFields = flattenKeysDotJoined(touched);
    let errorPages = {};
    let touchedErrorPages = {};
    // for each page...

    for (const p of formPages) {
      // add page to error pages if the two lists overlap
      const pageErrorFields = formPageFields[p.section]?.filter((item) =>
        errorFields.includes(item)
      );
      const pageTouchedErrorFields = pageErrorFields?.filter((item) =>
        touchedFields.includes(item)
      );
      if (pageErrorFields?.length > 0) {
        errorPages[p.section] = pageErrorFields;
      }
      if (pageTouchedErrorFields?.length > 0) {
        touchedErrorPages[p.section] = pageTouchedErrorFields;
      }
    }
    setPagesWithErrors(errorPages);
    setPagesWithTouchedErrors(touchedErrorPages);
    console.log("updateFormErrorState errorPages", errorPages);
    console.log("updateFormErrorState touchedErrorPages", touchedErrorPages);
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
    updateFormErrorState(currentErrors, currentTouched);
  }, [currentErrors, currentTouched]);

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

  // FIXME: workaround since file uploader has inaccessible first input
  useLayoutEffect(() => {
    const newPageWrapper = document.getElementById(
      `InvenioAppRdm.Deposit.FormPage.${currentFormPage}`
    );
    const targetIndex = currentFormPage === "page-6" ? 1 : 0;
    const newFirstInput =
      newPageWrapper?.querySelectorAll("button, input")[targetIndex];
    newFirstInput?.focus();
  }, [currentFormPage]);

  const handlePageChangeCancel = () => {
    setConfirmingPageChange(false);
  };

  const handlePageChangeConfirm = () => {
    setConfirmingPageChange(false);
    handleFormPageChange(null, {
      value: nextFormPage,
    });
  };

  const handleFormPageChange = (event, { value }) => {
    if (pagesWithErrors[currentFormPage]?.length > 0 && !confirmingPageChange) {
      setConfirmingPageChange(true);
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
      const pageFields =
        !!currentTypeFields && !!currentTypeFields[p.section]
          ? flattenWrappers(currentTypeFields[p.section])
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
  const handleErrorsChange = (errors, touched) => {
    console.log("handleErrorsChange errors", errors);
    console.log("handletouchedChange touched", touched);
    if (errors != {}) {
      setCurrentErrors(errors);
      setCurrentTouched(touched);
    }
  };

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
                // ordered={true}
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
                          id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                          pageNums={formPages.map(({ section }) => section)}
                          subsections={actualSubsections}
                          pageFields={formPageFields[section]}
                        />
                      </div>
                    )
                  );
                })}
              </Transition.Group>

              <Confirm
                id="confirm-page-change"
                className="confirm-page-change"
                open={confirmingPageChange}
                header={i18next.t("Problems with this form page")}
                content={i18next.t(
                  "There are problems with the information you've entered. Are you sure you want to continue?"
                )}
                cancelButton={i18next.t("Fix the problems")}
                confirmButton={i18next.t("Continue anyway")}
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
