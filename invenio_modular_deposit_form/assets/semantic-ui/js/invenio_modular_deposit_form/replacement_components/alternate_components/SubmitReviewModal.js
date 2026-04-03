// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { Formik } from "formik";
import _get from "lodash/get";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Trans } from "react-i18next";
import {
  ErrorLabel,
  RadioField,
  TextAreaField,
  ErrorMessage,
} from "react-invenio-forms";
import { Button, Checkbox, Form, Icon, Message, Modal } from "semantic-ui-react";
import * as Yup from "yup";

import { getReadableFields } from "@js/invenio_modular_deposit_form/utils";

const SubmitReviewModal = ({
  community,
  isConfirmModalOpen,
  onClose,
  onSubmit,
  directPublish = false,
  errors = undefined,
  initialReviewComment = "",
  loading = false,
  publishModalExtraContent = undefined,
  permissionsPerField = undefined,
}) => {
  useEffect(() => {
    // A11y: Focus the first input field in the form
    const firstFormFieldWrap = document.getElementById("accept-access-checkbox");
    const checkboxElem = firstFormFieldWrap?.querySelector("input");
    checkboxElem?.focus();
  }, []);

  const ConfirmSubmitReviewSchema = Yup.object({
    acceptAccessToRecord: Yup.bool().oneOf([true], i18next.t("You must accept this.")),
    acceptAfterPublishRecord: Yup.bool().oneOf(
      [true],
      i18next.t("You must accept this.")
    ),
    acceptRestrictedFields: Yup.bool().oneOf(
      [true],
      i18next.t("You must accept this.")
    ),
    reviewComment: Yup.string(),
  });

  const communityTitle = community.metadata.title;
  const currentCommunityPermissions = permissionsPerField?.[community?.slug]?.policy;
  let restrictedFields = [];
  let restrictedFieldLabels = "";
  if (currentCommunityPermissions) {
    restrictedFields = Array.isArray(currentCommunityPermissions)
      ? currentCommunityPermissions
      : Object.keys(currentCommunityPermissions);
    const [readableFields, readableFieldsWithArrays] = getReadableFields(restrictedFields);
    restrictedFieldLabels = [...readableFields, ...readableFieldsWithArrays].join(", ");
  }


  let headerTitle, msgWarningTitle, msgWarningText1, submitBtnLbl;
  if (directPublish) {
    headerTitle = i18next.t("Publish to community");
    msgWarningTitle = i18next.t(
      "Before publishing to the community, please read and check the following:"
    );
    msgWarningText1 = i18next.t(
      "Your upload will be <b>immediately published</b> in '{{communityTitle}}'. You will no longer be able to change the files in the upload! However, you will still be able to update the record's metadata later.",
      { communityTitle: communityTitle }
    );
    submitBtnLbl = i18next.t("Publish record to community");
  } else {
    headerTitle = i18next.t("Submit for review");
    msgWarningTitle = i18next.t(
      "Before requesting review, please read and check the following:"
    );
    msgWarningText1 = i18next.t(
      "If your upload is accepted by the community curators, it will be <b>immediately published</b>. Before that, you will still be able to modify metadata and files of this upload."
    );
    submitBtnLbl = i18next.t("Submit record for review");
  }

  return (
    <Formik
      initialValues={{
        acceptAccessToRecord: false,
        acceptAfterPublishRecord: false,
        acceptRestrictedFields: restrictedFields.length > 0 ? false : true,
        reviewComment: initialReviewComment || "",
      }}
      onSubmit={onSubmit}
      validationSchema={ConfirmSubmitReviewSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, handleSubmit }) => {
        return (
          <Modal
            open={isConfirmModalOpen}
            onClose={onClose}
            size="small"
            closeIcon
            closeOnDimmerClick={false}
          >
            <Modal.Header>{headerTitle}</Modal.Header>
            <Modal.Content>
              {errors && <ErrorMessage errors={errors} />}
              <Message visible warning>
                <p>
                  <Icon name="warning sign" />
                  {msgWarningTitle}
                </p>
              </Message>
              <Form>
                <Form.Field id="accept-access-checkbox">
                  <RadioField
                    control={Checkbox}
                    fieldPath="acceptAccessToRecord"
                    label={<div dangerouslySetInnerHTML={{ __html: i18next.t(
                      "The '{{communityTitle}}' curators will have access to <b>view</b> and <b>edit</b> your upload's metadata and files.",
                      { communityTitle: communityTitle }
                    )}} />}
                    checked={_get(values, "acceptAccessToRecord") === true}
                    onChange={({ data, formikProps }) => {
                      formikProps.form.setFieldValue(
                        "acceptAccessToRecord",
                        data.checked
                      );
                    }}
                    optimized
                  />
                  <ErrorLabel
                    role="alert"
                    fieldPath="acceptAccessToRecord"
                    className="mt-0 mb-5"
                  />
                </Form.Field>
                <Form.Field>
                  <RadioField
                    control={Checkbox}
                    fieldPath="acceptAfterPublishRecord"
                    label={<div dangerouslySetInnerHTML={{ __html: msgWarningText1 }} />}
                    checked={_get(values, "acceptAfterPublishRecord") === true}
                    onChange={({ data, formikProps }) => {
                      formikProps.form.setFieldValue(
                        "acceptAfterPublishRecord",
                        data.checked
                      );
                    }}
                    optimized
                  />
                  <ErrorLabel
                    role="alert"
                    fieldPath="acceptAfterPublishRecord"
                    className="mt-0 mb-5"
                  />
                </Form.Field>
                {restrictedFields?.length > 0 ? (
                  <Form.Field>
                    <RadioField
                      control={Checkbox}
                      fieldPath="acceptRestrictedFields"
                      label={<div dangerouslySetInnerHTML={{ __html: i18next.t(
                        "The {{communityTitle}} collection has <b>additional editing restrictions</b>. After publishing your work to this collection, you may not be able to change these metadata fields without approval and assistance from the collection administrators: <b>{{restrictedFieldLabels}}</b>. See {{communityTitle}}'s curation policy for more details.",
                        {
                          communityTitle: communityTitle,
                          restrictedFieldLabels: restrictedFieldLabels
                        }
                      )}} />}
                      checked={_get(values, "acceptRestrictedFields") === true}
                      onChange={({ data, formikProps }) => {
                        formikProps.form.setFieldValue(
                          "acceptRestrictedFields",
                          data.checked
                        );
                      }}
                    />
                    <ErrorLabel
                      role="alert"
                      fieldPath="acceptRestrictedFields"
                      className="mt-0 mb-5"
                    />
                  </Form.Field>
                ) : (
                  <Form.Field style={{ display: 'none' }}>
                    <RadioField
                      control={Checkbox}
                      fieldPath="acceptRestrictedFields"
                      checked={true}
                    />
                  </Form.Field>
                )}

                {!directPublish && (
                  <TextAreaField
                    fieldPath="reviewComment"
                    label={i18next.t("Message to curators (optional)")}
                  />
                )}

                {publishModalExtraContent && (
                  <div
                    dangerouslySetInnerHTML={{ __html: publishModalExtraContent }}
                  />
                )}
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button
                onClick={onClose}
                floated="left"
                loading={loading}
                disabled={loading}
              >
                <Icon name='remove' /> {i18next.t("Cancel")}
              </Button>
              <Button
                name="submitReview"
                onClick={(event) => {
                  handleSubmit(event);
                }}
                loading={loading}
                disabled={loading}
                positive={directPublish}
                primary={!directPublish}
              >
                <Icon name='checkmark' /> {submitBtnLbl}
              </Button>
            </Modal.Actions>
          </Modal>
        );
      }}
    </Formik>
  );
}

SubmitReviewModal.propTypes = {
  isConfirmModalOpen: PropTypes.bool.isRequired,
  community: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialReviewComment: PropTypes.string,
  publishModalExtraContent: PropTypes.string,
  directPublish: PropTypes.bool,
  errors: PropTypes.node, // TODO FIXME: Use a common error cmp to display errros.
  loading: PropTypes.bool,
};

export { SubmitReviewModal };