// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Copies of deposit form components that override stock Invenio RDM with our own.
// These mirror the OVERRIDDEN components in field_components.jsx.

import React, { useContext, useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { FormFeedback } from "@js/invenio_rdm_records";
import { Grid } from "semantic-ui-react";
import Overridable from "react-overridable";
import { CommunityField } from "../replacement_components/CommunityField";
import { LanguagesField } from "../replacement_components/LanguagesField";
import ResourceTypeSelectorField from "../replacement_components/ResourceTypeSelectorField";
import { SubmitButtonModal } from "../replacement_components/PublishButton/SubmitButton";
import { FieldComponentWrapper } from "./FieldComponentWrapper";
import { FormUIStateContext } from "../FormLayoutContainer";
import { DeleteComponent } from "./field_components";

const CommunitiesComponent = ({ ...extraProps }) => {
  return (
    <CommunityField
      imagePlaceholderLink="/static/images/square-placeholder.png"
      {...extraProps}
    />
  );
};

const LanguagesComponent = ({ ...extraProps }) => {
  const { setFieldValue, values } = useFormikContext();
  const recordOptions = useStore().getState().deposit.record?.ui?.languages?.filter((lang) => lang !== null) || [];
  const formOptions =
    values?.metadata?.languages?.filter((lang) => lang !== null) ||
    [];

  let initialOptions;
  if (typeof formOptions?.[0] === "string" &&
      formOptions.length === recordOptions.length &&
      formOptions.every((formValue, index) => formValue === recordOptions[index]?.id)) {
    initialOptions = recordOptions;
  } else {
    initialOptions = formOptions;
  }

  useEffect(() => {
    if (initialOptions?.length > 0 && (
        typeof formOptions.some((formOption) => typeof formOption === 'string') ||
        !formOptions ||
        formOptions.some((formOption, index) => formOption.id !== initialOptions[index]?.id || formOption.title_l10n !== initialOptions[index]?.title_l10n)
    )) {
      setFieldValue("metadata.languages", initialOptions);
    }
  }, []);

  const onValueChange = ({event, data, formikProps}, selectedSuggestions) => {
    const fieldValues = selectedSuggestions.map((item) => ({
      title_l10n: item.text,
      id: item.value,
    }))
    setFieldValue("metadata.languages", fieldValues);
  }

  return (
    <FieldComponentWrapper
      componentName="LanguagesField"
      fieldPath="metadata.languages"
      {...extraProps}
    >
      <LanguagesField
        fieldPath="metadata.languages"
        initialOptions={initialOptions}
        placeholder={i18next.t(
          'Type to search for a language (press "enter" to select)'
        )}
        description={i18next.t(extraProps.description)}
        serializeSuggestions={(suggestions) =>
          suggestions.map((item) => ({
            text: item.title_l10n,
            value: item.id,
            key: item.id,
          }))
        }
        noQueryMessage={i18next.t("No languages found")}
        aria-describedby="metadata.languages.helptext"
        multiple={true}
        onValueChange={onValueChange}
      />
    </FieldComponentWrapper>
  );
};

const ResourceTypeComponent = ({ ...extraProps }) => {
  const fieldPath = "metadata.resource_type";
  return (
    <FieldComponentWrapper
      componentName="ResourceTypeField"
      fieldPath={fieldPath}
      {...extraProps}
    >
      <ResourceTypeSelectorField
        fieldPath={fieldPath}
        required={true}
      />
    </FieldComponentWrapper>
  );
};

/**
 * SubmissionComponent is the component that displays the submission buttons
 * and the form feedback.
 *
 * Note: the `clientErrors` variable is an alias for the Formik client-side
 * error state. The `errors` variable comes from the Redux store and represents
 * the error state after the last form submission OR on first page render.
 *
 * The state for confirming whether there should be files or not is stored here.
 *
 */
const SubmissionComponent = () => {
  const { errors: clientErrors, values, setFieldValue } = useFormikContext();
  const { handleFormPageChange } = useContext(FormUIStateContext);
  const [_, setConfirmedNoFiles] = useState(undefined);
  const store = useStore();

  const { actionState, config, errors, record, permissions } =
    store.getState().deposit;
  const hasFiles = Object.keys(store.getState().files.entries).length > 0;
  const filesEnabled = !!values.files.enabled;
  const missingFiles = filesEnabled && !hasFiles;

  const handleConfirmNoFiles = async () => {
    if (!hasFiles) {
      setConfirmedNoFiles(true);
      await setFieldValue("files.enabled", false);
    }
  };

  const handleConfirmNeedsFiles = () => {
    setConfirmedNoFiles(false);
    handleFormPageChange(null, { value: "page-5" });
  };

  let nonValidationErrors;
  if (!_isEmpty(errors)) {
    nonValidationErrors = Object.fromEntries(
      Object.entries(errors).filter(
        ([key]) => !["metadata", "access", "pids", "custom_fields"].includes(key)
      )
    );
  }

  const getAlertClass = () => {
    let alertClass = "";
    if (actionState?.includes("SUCCEEDED")) {
      alertClass = "positive";
    } else if (actionState?.includes("FAILED") || !_isEmpty(nonValidationErrors)) {
      alertClass = "negative";
    } else if (actionState?.includes("ERROR") && !_isEmpty(clientErrors)) {
      alertClass = "warning";
    } else if (!_isEmpty(clientErrors)) {
      alertClass = "negative";
    }
    return alertClass;
  };

  return (
    <Overridable id="InvenioAppRdm.Deposit.CardDepositStatusBox.container">
      <Grid relaxed className={`save-submit-buttons ${getAlertClass()}`}>
        <Grid.Row>
          <Grid.Column computer="8" tablet="6">
            {(actionState ||
              !_isEmpty(clientErrors) ||
              !_isEmpty(nonValidationErrors)) && (
              <Overridable
                id="InvenioAppRdm.Deposit.FormFeedback.container"
                labels={config.custom_fields.error_labels}
                fieldPath="message"
              >
                <FormFeedback
                  fieldPath="message"
                  labels={config.custom_fields.error_labels}
                  clientErrors={clientErrors}
                  nonValidationErrors={nonValidationErrors}
                />
              </Overridable>
            )}

            <SubmitButtonModal
              fluid
              actionName="saveDraft"
              aria-describedby="save-button-description"
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              missingFiles={missingFiles}
            />

            <SubmitButtonModal
              fluid
              actionName="preview"
              aria-describedby="preview-button-description"
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              missingFiles={missingFiles}
            />
            <SubmitButtonModal
              fluid
              actionName="publish"
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              missingFiles={missingFiles}
              aria-describedby="publish-button-description"
              id="deposit-form-publish-button"
              positive
            />
            <DeleteComponent
              permissions={permissions}
              record={record}
              aria-describedby="delete-button-description"
              icon="trash alternate outline"
            />
          </Grid.Column>
          <Grid.Column
            tablet="10"
            computer="8"
            id="save-button-description"
            className="helptext"
          >
            <p>
              <b>Draft deposits</b> can be edited
              {permissions?.can_delete_draft && ", deleted,"} and the files can be added
              or changed.
            </p>
            <p>
              <b>Published deposits</b> can still be edited, but you will no longer be
              able to {permissions?.can_delete_draft && "delete the deposit or "}change
              the attached files. To add or change files for a published deposit you
              must create a new version of the record.
            </p>
            <p>
              Deposits can only be <b>deleted while they are drafts</b>. Once you
              publish your deposit, you can only restrict access and/or create a new
              version.
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Overridable>
  );
};

export {
  CommunitiesComponent,
  LanguagesComponent,
  ResourceTypeComponent,
  SubmissionComponent,
};
