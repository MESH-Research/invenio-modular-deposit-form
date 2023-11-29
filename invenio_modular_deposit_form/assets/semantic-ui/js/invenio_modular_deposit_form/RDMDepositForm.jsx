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
import { Button, Container, Grid, Step, Transition } from "semantic-ui-react";
import PropTypes, { object } from "prop-types";
import Overridable from "react-overridable";
import { flattenKeysDotJoined } from "./utils";
import { fieldComponents } from "./componentsMap";
import { FormPage } from "./FormPage";
import { object as yupObject, string as yupString, date as yupDate } from "yup";

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
  config,
  files,
  record,
  permissions,
  preselectedCommunity,
  commonFields,
  fieldsByType,
  labelModifications,
  placeholderModifications,
  descriptionModifications,
  iconModifications,
  helpTextModifications,
  defaultFieldValues,
  defaultResourceType,
  pidsConfigOverrides,
  priorityFieldValues,
  extraRequiredFields,
}) => {
  const formPages = commonFields[0].subsections;
  const formPageSlugs = formPages.map(({ section }) => section);
  const [currentFormPage, setCurrentFormPage] = useState(formPages[0].section);
  const [currentValues, setCurrentValues] = useState({});
  const [currentErrors, setCurrentErrors] = useState({});
  const [pagesWithErrors, setPagesWithErrors] = useState([]);
  const [touched, setTouched] = useState({});
  const [initialErrors, setInitialErrors] = useState({});
  const [initialTouched, setInitialTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
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
      newPageWrapper.querySelectorAll("button, input")[targetIndex];
    newFirstInput.focus();
  }, [currentFormPage]);

  const handleFormPageChange = (event, { value }) => {
    setCurrentFormPage(value);
    setFormPageInHistory(value);
  };

  const handleValuesChange = (values) => {
    setCurrentValues(values);
    localStorage.setItem("depositFormValues", JSON.stringify(values));
    setCurrentResourceType(values.metadata.resource_type);
    setCurrentTypeFields(fieldsByType[values.metadata.resource_type]);
  };

  function flattenWrappers(page) {
    let flattened = [];
    if (page.subsections) {
      for (const sub of page.subsections) {
        if (sub.component === "SectionWrapper") {
          flattened = flattened.concat(flattenWrappers(sub));
        } else {
          flattened.push(sub);
        }
      }
    }
    return flattened;
  }

  const handleErrorsChange = (
    errors,
    touched,
    initialErrors,
    initialTouched,
    isValid
  ) => {
    if (errors != {}) {
      setCurrentErrors(errors);
      setTouched(touched);
      let errorPages = [];
      // for each page...
      for (const p of formPages) {
        // collect form widget slugs
        let pageFields =
          !!currentTypeFields && !!currentTypeFields[p.section]
            ? flattenWrappers(currentTypeFields[p.section])
            : flattenWrappers(p);
        // get form field label for each slug
        let pageMetaFields = pageFields.reduce((accum, { component }) => {
          accum = accum.concat(fieldComponents[component][1]);
          return accum;
        }, []);
        // get form field labels for current errors
        const errorFields = flattenKeysDotJoined(errors);
        // add page to error pages if the two lists overlap
        if (pageMetaFields.some((item) => errorFields.includes(item))) {
          errorPages.push(p);
        }
      }
      setPagesWithErrors(errorPages);
      errorPages.length && setCurrentFormPage(errorPages[0].section);
    }
    console.log("RDMDepositForm state errors", errors);
    console.log("RDMDepositForm pages with errors", pagesWithErrors);
  };

  if (!!pidsConfigOverrides?.doi) {
    Object.assign(
      config.pids.filter((pid) => pid.scheme === "doi")[0],
      pidsConfigOverrides.doi
    );
  }

  const commonFieldProps = {
    config: config,
    fieldComponents: fieldComponents,
    noFiles: noFiles,
    record: record,
    vocabularies: vocabularies,
    permissions: permissions,
    customFieldsUI: customFieldsUI,
    currentResourceType: currentResourceType,
    ...currentFieldMods,
  };
  console.log("pagesWithErrors", pagesWithErrors);

  return (
    <FormValuesContext.Provider
      value={{
        currentValues,
        handleValuesChange,
        currentErrors,
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
                {record.id !== null ? "Updating " : "New "}
                {record.status === "draft" ? "Draft " : "Published "}Deposit
              </h2>
              <Step.Group
                widths={formPages.length}
                className="upload-form-pager"
                fluid={true}
                // ordered={true}
                size={"small"}
              >
                {formPages.map(({ section, title }, index) => (
                  <Step
                    key={index}
                    as={Button}
                    active={currentFormPage === section}
                    link
                    onClick={handleFormPageChange}
                    value={section}
                    formNoValidate
                    className={`ui button upload-form-stepper-step ${section}
                     ${pagesWithErrors.includes(section) ? "has-error" : ""}`}
                    type="button"
                  >
                    <Step.Content>
                      <Step.Title>{title}</Step.Title>
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
                          commonFieldProps={commonFieldProps}
                          id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                          pageNums={formPages.map(({ section }) => section)}
                          subsections={actualSubsections}
                        />
                      </div>
                    )
                  );
                })}
              </Transition.Group>
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