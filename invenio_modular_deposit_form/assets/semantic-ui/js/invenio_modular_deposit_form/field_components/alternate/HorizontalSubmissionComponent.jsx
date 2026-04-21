// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import _isEmpty from "lodash/isEmpty";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { Card, Grid } from "semantic-ui-react";
import {
  DeleteButton,
  DepositStatusBox,
  PreviewButton,
  PublishButton,
  SaveButton,
} from "@js/invenio_rdm_records";
import { ShareDraftButton } from "@js/invenio_app_rdm/deposit/ShareDraftButton";
import Overridable from "react-overridable";
import { RECORD_FIELD_ERROR_ROOTS } from "../../constants";
import { FormFeedback as ModularFormFeedback } from "./field_inputs/FormFeedback";

/**
 * HorizontalSubmissionComponent displays the submission buttons and form feedback
 * in a horizontal two-column layout (buttons + helptext).
 *
 * Note: the `clientErrors` variable is an alias for the Formik client-side
 * error state. The `errors` variable comes from the Redux store and represents
 * the error state after the last form submission OR on first page render.
 *
 * Uses stock SaveButton, PreviewButton, PublishButton, FormFeedback, DeleteButton
 * from @js/invenio_rdm_records.
 * @overridable InvenioAppRdm.Deposit.CardDepositStatusBox.container (outer); InvenioAppRdm.Deposit.FormFeedback.container (form feedback block).
 * Override (field_components/overridable/SubmissionComponent.jsx) uses SubmitButtonModal (save/preview/publish) with
 * missing-files confirmation and "no files" flow; stock uses separate buttons and
 * PublishButton disables when files enabled but none uploaded (no confirm modal for that).
 */
const HorizontalSubmissionComponent = () => {
  const { errors: clientErrors } = useFormikContext();
  const store = useStore();

  const { actionState, config, errors, record, permissions } = store.getState().deposit;
  const groupsEnabled = config?.groups_enabled ?? false;

  // errors not related to validation, following a different format {status:.., message:..}
  let nonValidationErrors;
  if (!_isEmpty(errors)) {
    nonValidationErrors = Object.fromEntries(
      Object.entries(errors).filter(([key]) => !RECORD_FIELD_ERROR_ROOTS.includes(key))
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
    <Overridable
      id="InvenioAppRdm.Deposit.CardDepositStatusBox.container"
      record={record}
      permissions={permissions}
      groupsEnabled={groupsEnabled}
    >
      <Grid relaxed className={`save-submit-buttons ${getAlertClass()}`}>
        <Grid.Row>
          <Grid.Column computer="8" tablet="6">
            <DepositStatusBox />
            <ModularFormFeedback labels={config.custom_fields.error_labels} />

            <SaveButton fluid aria-describedby="save-button-description" />
            <PreviewButton fluid aria-describedby="preview-button-description" />
            <PublishButton
              fluid
              aria-describedby="publish-button-description"
              id="deposit-form-publish-button"
            />

            {(record?.is_draft === null || permissions?.can_manage) && (
              <ShareDraftButton
                record={record}
                permissions={permissions}
                groupsEnabled={groupsEnabled}
              />
            )}
            {permissions?.can_delete_draft && (
              <Overridable id="InvenioAppRdm.Deposit.CardDeleteButton.container" record={record}>
                <Card>
                  <Card.Content>
                    <DeleteButton fluid />
                  </Card.Content>
                </Card>
              </Overridable>
            )}
            {/* FIXME: RecordDeletionComponent (v14): import from v14_components.jsx, register in instance, add to layout */}
          </Grid.Column>
          <Grid.Column tablet="10" computer="8" id="save-button-description" className="helptext">
            <p>
              <b>Draft deposits</b> can be edited
              {permissions?.can_delete_draft && ", deleted,"} and the files can be added or changed.
            </p>
            <p>
              <b>Published deposits</b> can still be edited, but you will no longer be able to{" "}
              {permissions?.can_delete_draft && "delete the deposit or "}change the attached files.
              To add or change files for a published deposit you must create a new version of the
              record.
            </p>
            <p>
              Deposits can only be <b>deleted while they are drafts</b>. Once you publish your
              deposit, you can only restrict access and/or create a new version.
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Overridable>
  );
};

export { HorizontalSubmissionComponent };
