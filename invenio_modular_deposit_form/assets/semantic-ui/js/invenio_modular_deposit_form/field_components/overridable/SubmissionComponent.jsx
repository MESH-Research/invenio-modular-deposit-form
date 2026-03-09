// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock submission area with SubmitButtonModal + form feedback.

import React, { useContext, useState } from "react";
import _isEmpty from "lodash/isEmpty";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { FormFeedback } from "@js/invenio_rdm_records";
import { Grid } from "semantic-ui-react";
import Overridable from "react-overridable";
import { SubmitButtonModal } from "../../replacement_components/PublishButton/SubmitButton";
import { FormUIStateContext } from "../../FormLayoutContainer";
import { DeleteComponent } from "../field_components";

/**
 * Submission section: save/preview/publish modals, form feedback, delete. Uses SubmitButtonModal and FormUIStateContext
 * instead of stock buttons.
 *
 * When used as an override (via the Overridable id), this component receives the same props as the
 * default child (e.g. record, config) from the parent. It also reads deposit state from the store.
 *
 * This package provides the default component for this section. Include the regular component name
 * from field_components.jsx (SubmissionComponent) in your configured form layout. To use this
 * overridable version instead, use either:
 *
 * 1. Overridable registry: in your instance's assets/js/invenio_app_rdm/overridableRegistry/mapping.js,
 * add this component to overriddenComponents for the Overridable id `InvenioAppRdm.Deposit.CardDepositStatusBox.container`.
 * To pass additional props when using the Overridable registry, use ReactOverridable's parametrize
 * (e.g. parametrize(OverrideSubmissionComponent, { ...props })) and register the parametrized component;
 * see the instance's mapping.js for examples.
 *
 * @example Overridable registry (in instance assets/js/invenio_app_rdm/overridableRegistry/mapping.js)
 * ```js
 * import { OverrideSubmissionComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * overriddenComponents["InvenioAppRdm.Deposit.CardDepositStatusBox.container"] = OverrideSubmissionComponent;
 * ```
 *
 * 2. Component registry: register this component in the instance's invenio_modular_deposit_form
 * component registry and include it in the configured form layout by name (OverrideSubmissionComponent).
 * To pass additional props when using the component registry, pass them via the layout config
 * (section props for that component). Optional: set config.custom_fields.error_labels if you use
 * custom error labels for FormFeedback.
 *
 * @example Component registry (instance componentsRegistry.js and form layout)
 * In your instance's componentsRegistry.js (from your entry point or alias), add an entry for this
 * override. You can use key SubmissionComponent to replace the default or OverrideSubmissionComponent
 * as a new name. In the form layout, set the section's component to that key; section props and config
 * are passed to the component.
 *
 * ```js
 * import { OverrideSubmissionComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * SubmissionComponent: [OverrideSubmissionComponent, []],
 * ```
 */
const OverrideSubmissionComponent = () => {
  const { errors: clientErrors, values, setFieldValue } = useFormikContext();
  const { fileUploadPageId, handleFormPageChange } = useContext(FormUIStateContext);
  const [, setConfirmedNoFiles] = useState(undefined);
  const store = useStore();

  const { actionState, config, errors, record, permissions } =
    store.getState().deposit;
  const hasFiles = Object.keys(store.getState().files.entries).length > 0;
  const filesEnabled = !!values.files?.enabled;
  const missingFiles = filesEnabled && !hasFiles;

  const handleConfirmNoFiles = async () => {
    if (!hasFiles) {
      setConfirmedNoFiles(true);
      await setFieldValue("files.enabled", false);
    }
  };

  const handleConfirmNeedsFiles = () => {
    setConfirmedNoFiles(false);
    if (fileUploadPageId) {
      handleFormPageChange(null, { value: fileUploadPageId });
    }
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
    <Grid relaxed className={`save-submit-buttons ${getAlertClass()}`}>
        <Grid.Row>
          <Grid.Column computer="8" tablet="6">
            {(actionState ||
              !_isEmpty(clientErrors) ||
              !_isEmpty(nonValidationErrors)) && (
              <Overridable
                id="InvenioAppRdm.Deposit.FormFeedback.container"
                labels={config?.custom_fields?.error_labels}
                fieldPath="message"
              >
                <FormFeedback
                  fieldPath="message"
                  labels={config?.custom_fields?.error_labels}
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
  );
};

export { OverrideSubmissionComponent };
