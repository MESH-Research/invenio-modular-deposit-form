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

import React, { Fragment, useContext } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { useFormikContext } from "formik";
import { FeedbackLabel } from "react-invenio-forms";
import { useStore } from "react-redux";
import {
  AccessRightField,
  CommunityHeader,
  DatesField,
  DeleteButton,
  DepositStatusBox,
  FileUploader,
  IdentifiersField,
  LicenseField,
  PreviewButton,
  PublicationDateField,
  PublishButton,
  ReferencesField,
  RelatedWorksField,
  SaveButton,
  SubjectsField,
  UppyUploader,
} from "@js/invenio_rdm_records";
import { FormUIStateContext } from "../FormLayoutContainer";
import { PIDField as ReplacementPIDField } from "../replacement_components/field_components/PIDField";
import { FormFeedback as ModularFormFeedback } from "../replacement_components/form_feedback/FormFeedback";
import {
  CreatibutorsField,
  CopyrightsField,
  DescriptionsField,
  LanguagesField,
  PublisherField,
  ResourceTypeField,
  TitlesField,
  VersionField,
} from "../replacement_components/field_components";
import { FundingField } from "@js/invenio_vocabularies";
import { ShareDraftButton } from "@js/invenio_app_rdm/deposit/ShareDraftButton";
import { Grid, Card } from "semantic-ui-react";
import Overridable from "react-overridable";
import { moveToArrayStart } from "../utils";
import { FieldComponentWrapper } from "./FieldComponentWrapper";
import { RECORD_FIELD_ERROR_ROOTS } from "../constants";

/**
 * Main description/abstract field (metadata.description). Replacement DescriptionsField (field_components).
 * @overridable InvenioAppRdm.Deposit.DescriptionsField.container (via FieldComponentWrapper)
 */
const AbstractComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit.record;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="DescriptionsField"
      {...extraProps}
      fieldPath="metadata.description"
    >
      <DescriptionsField
        fieldPath="metadata.description"
        options={vocabularies.metadata.descriptions}
        recordUI={_get(record, "ui", null)}
        label={extraProps.label || "Description"}
        editorConfig={{
          removePlugins: [
            "Image",
            "ImageCaption",
            "ImageStyle",
            "ImageToolbar",
            "ImageUpload",
            "MediaEmbed",
            "Table",
            "TableToolbar",
            "TableProperties",
            "TableCellProperties",
          ],
        }}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Access rights field (access). Uses stock AccessRightField.
 * @overridable InvenioAppRdm.Deposit.AccessRightField.container (via FieldComponentWrapper)
 */
const AccessRightsComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { config, record, permissions } = store.getState().deposit;

  return (
    <FieldComponentWrapper
      componentName="AccessRightField"
      icon="shield"
      label={i18next.t("Public access")}
      {...extraProps}
      fieldPath="access"
    >
      <AccessRightField
        fieldPath="access"
        showMetadataAccess={permissions?.can_manage_record_access}
        record={record ?? {}}
        recordRestrictionGracePeriod={config.record_restriction_grace_period ?? 30}
        allowRecordRestriction={config.allow_record_restriction ?? true}
        fluid
      />
    </FieldComponentWrapper>
  );
};

/**
 * Additional dates field (metadata.dates). Uses stock DatesField. Overridable version in overridable/ uses DatesFieldAlternate.
 * @overridable InvenioAppRdm.Deposit.DateField.container (via FieldComponentWrapper)
 */
const AdditionalDatesComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="DateField"
      {...extraProps}
      fieldPath="metadata.dates"
    >
      <DatesField
        fieldPath="metadata.dates"
        options={vocabularies.metadata.dates}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Alternate identifiers / URLs (metadata.identifiers). Uses stock IdentifiersField.
 * @overridable InvenioAppRdm.Deposit.IdentifiersField.container (via FieldComponentWrapper)
 */
const AlternateIdentifiersComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="IdentifiersField"
      fieldPath="metadata.identifiers"
      label={i18next.t("URLs and Other Identifiers")}
      icon={"barcode"}
      {...extraProps}
    >
      <IdentifiersField
        schemeOptions={vocabularies.metadata.identifiers.scheme}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Community selection (no fieldPath). Uses stock CommunityHeader. Overridable version uses CommunityField.
 * @overridable InvenioAppRdm.Deposit.CommunityHeader.container (stock does not use FieldComponentWrapper)
 */
const CommunitiesComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit?.record;
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.CommunityHeader.container"
      record={record ?? {}}
      {...extraProps}
    >
      <CommunityHeader
        imagePlaceholderLink="/static/images/square-placeholder.png"
        record={record ?? {}}
        {...extraProps}
      />
    </Overridable>
  );
};

/**
 * Contributors (metadata.contributors). Uses stock CreatibutorsField with schema "contributors".
 * @overridable InvenioAppRdm.Deposit.ContributorsField.container (via FieldComponentWrapper)
 */
const ContributorsComponent = ({ ...extraProps }) => {
  const config = useStore().getState().deposit.config;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="ContributorsField"
      fieldPath="metadata.contributors"
      label={i18next.t("Contributors")}
      icon="user plus"
      {...extraProps}
    >
      <CreatibutorsField
        addButtonLabel={i18next.t("Add contributor")}
        roleOptions={vocabularies.metadata.contributors.role}
        schema="contributors"
        autocompleteNames={config.autocomplete_names}
        modal={{
          addLabel: "Add contributor",
          editLabel: "Edit contributor",
        }}
        id="InvenioAppRdm.Deposit.ContributorsField.card"
      />
    </FieldComponentWrapper>
  );
};

/**
 * Creators (metadata.creators). Uses stock CreatibutorsField with schema "creators".
 * @overridable InvenioAppRdm.Deposit.CreatorsField.container (via FieldComponentWrapper)
 */
const CreatorsComponent = ({ ...extraProps }) => {
  const config = useStore().getState().deposit.config;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="CreatorsField"
      fieldPath="metadata.creators"
      label={i18next.t("Creators")}
      icon="user"
      description=""
      {...extraProps}
    >
      <CreatibutorsField
        roleOptions={vocabularies.metadata.creators.role}
        schema="creators"
        autocompleteNames={config.autocomplete_names}
        required
        config={config}
        addButtonLabel={i18next.t("Add creator")}
        modal={{
          addLabel: i18next.t("Add creator"),
          editLabel: i18next.t("Edit creator"),
        }}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Publication date (metadata.publication_date). Uses stock PublicationDateField.
 * Can be used alone or inside CombinedDatesComponent with AdditionalDatesComponent.
 * @overridable InvenioAppRdm.Deposit.PublicationDateField.container (via FieldComponentWrapper)
 */
const PublicationDateComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="PublicationDateField"
      fieldPath="metadata.publication_date"
      {...extraProps}
    >
      <PublicationDateField required fieldPath="metadata.publication_date" />
    </FieldComponentWrapper>
  );
};

/**
 * Delete draft button. Uses stock DeleteButton. Renders only when permissions.can_delete_draft.
 * @overridable InvenioAppRdm.Deposit.CardDeleteButton.container (via FieldComponentWrapper)
 */
const DeleteComponent = ({ ...extraProps }) => {
  const permissions = useStore().getState().deposit.permissions;

  return (
    <>
      {permissions?.can_delete_draft ? (
        <FieldComponentWrapper
          componentName="CardDeleteButton"
          fieldPath={""}
          {...extraProps}
        >
          <DeleteButton fluid size="large" className="centered warning" />
        </FieldComponentWrapper>
      ) : null}
    </>
  );
};

const ShareDraftButtonComponent = () => {
  const store = useStore();
  const { config, record, permissions } = store.getState().deposit;
  const groupsEnabled = config.groups_enabled ?? false;
  const requireSecretLinksExpiration = config.require_secret_links_expiration;
  return (
    <ShareDraftButton
      record={record ?? {}}
      permissions={permissions ?? {}}
      groupsEnabled={groupsEnabled}
      requireSecretLinksExpiration={requireSecretLinksExpiration}
    />
  );
};

/**
 * DOI/identifier field(s). One stock PIDField per scheme in config.pids. Overridable version in overridable/ uses replacement PIDField.
 * @overridable InvenioAppRdm.Deposit.PIDField.container (wrapped in Overridable here; not using FieldComponentWrapper)
 */
const DoiComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { config, record } = store.getState().deposit;
  const pids = Array.isArray(config?.pids) ? config.pids : [];

  return (
    <Overridable id="InvenioAppRdm.Deposit.PIDField.container">
      <Fragment>
      {pids.map((pid) => (
        <Fragment key={pid.scheme}>
            <ReplacementPIDField
              btnLabelDiscardPID={pid.btn_label_discard_pid}
              btnLabelGetPID={pid.btn_label_get_pid}
              canBeManaged={pid.can_be_managed}
              canBeUnmanaged={pid.can_be_unmanaged}
              doiDefaultSelection={pid.default_selected ?? {}}
              optionalDOItransitions={pid.optional_doi_transitions ?? {}}
              fieldPath={`pids.${pid.scheme}`}
              fieldLabel={pid.field_label}
              isEditingPublishedRecord={
                record?.is_published === true
              }
              managedHelpText={pid.managed_help_text}
              pidLabel={pid.pid_label}
              pidPlaceholder={pid.pid_placeholder}
              pidType={pid.scheme}
              record={record ?? {}}
              required={config?.is_doi_required ?? true}
              unmanagedHelpText={pid.unmanaged_help_text}
              {...extraProps}
            />
          </Fragment>
        ))}
      </Fragment>
    </Overridable>
  );
};

/**
 * File upload section (files). Uses stock FileUploader or UppyUploader.
 * Root `FeedbackLabel` for `files` is rendered here (not inside FileUploader) so messages
 * come only from Formik `errors` / `initialErrors`, i.e. the shared validation schema + server merge.
 * @overridable InvenioAppRdm.Deposit.FileUploader.container (via FieldComponentWrapper)
 */
const FileUploadComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { config, permissions, record } = store.getState().deposit;
  const files = store.getState().files;
  const noFiles = Object.keys(files?.entries ?? {}).length === 0 && record?.is_published;
  const showMetaOnly = extraProps.showMetadataOnlyToggle
  const useUppy = config.use_uppy ?? false;
  const commonFileUploaderProps = {
    noFiles,
    isDraftRecord: !record.is_published,
    quota: config.quota,
    decimalSizeDisplay: config.decimal_size_display,
    filesLocked: config.files_locked ?? false,
    allowEmptyFiles: config.allow_empty_files ?? true,
    showMetadataOnlyToggle: showMetaOnly ?? permissions?.can_manage_files, 
    // v14 only: pass when present so v13 uploaders (no fileModification prop) are unchanged
    ...(config.file_modification != null && { fileModification: config.file_modification }),
  };

  return (
    <>
      <FieldComponentWrapper
        componentName="FileUploader"
        fieldPath="files"
        {...extraProps}
      >
        {useUppy ? (
          <UppyUploader {...commonFileUploaderProps} />
        ) : (
          <FileUploader {...commonFileUploaderProps} />
        )}
      </FieldComponentWrapper>
      <div className="rel-mt-1" role="alert">
        <FeedbackLabel fieldPath="files" pointing="below" />
      </div>
    </>
  );
};

/**
 * Funding (metadata.funding). Uses FundingField from invenio_vocabularies.
 * Options are not passed in: award/funder choices come from the backend via
 * searchConfig (e.g. /api/awards for award search, /api/funders in custom award form).
 * @overridable InvenioAppRdm.Deposit.FundingField.container (via FieldComponentWrapper)
 */
const FundingComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="FundingField"
      fieldPath="metadata.funding"
      {...extraProps}
    >
      <FundingField
        searchConfig={{
          searchApi: {
            axios: {
              headers: {
                Accept: "application/vnd.inveniordm.v1+json",
              },
              url: "/api/awards",
              withCredentials: false,
            },
          },
          initialQueryState: {
            sortBy: "bestmatch",
            sortOrder: "asc",
            layout: "list",
            page: 1,
            size: 5,
          },
        }}
        label="Funding"
        labelIcon="money bill alternate outline"
        icon="money bill alternate outline"
        deserializeAward={(award) => {
          return {
            title: award.title_l10n,
            number: award.number,
            funder: award.funder ?? "",
            id: award.id,
            ...(award.identifiers && {
              identifiers: award.identifiers,
            }),
            ...(award.acronym && { acronym: award.acronym }),
          };
        }}
        deserializeFunder={(funder) => {
          return {
            id: funder.id,
            name: funder.name,
            ...(funder.title_l10n && { title: funder.title_l10n }),
            ...(funder.pid && { pid: funder.pid }),
            ...(funder.country && { country: funder.country }),
            ...(funder.identifiers && {
              identifiers: funder.identifiers,
            }),
          };
        }}
        computeFundingContents={(funding) => {
          let headerContent,
            descriptionContent,
            awardOrFunder = "";

          if (funding.funder) {
            const funderName =
              funding.funder?.name ?? funding.funder?.title ?? funding.funder?.id ?? "";
            awardOrFunder = "funder";
            headerContent = funderName;
            descriptionContent = "";

            // there cannot be an award without a funder
            if (funding.award) {
              awardOrFunder = "award";
              descriptionContent = funderName;
              headerContent = funding.award.title;
            }
          }

          return { headerContent, descriptionContent, awardOrFunder };
        }}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Languages (metadata.languages). Replacement LanguagesField (field_components).
 * @overridable InvenioAppRdm.Deposit.LanguagesField.container (via FieldComponentWrapper)
 */
const LanguagesComponent = ({ ...extraProps }) => {
  const { values } = useFormikContext();
  const recordOptions = useStore().getState().deposit.record?.ui?.languages?.filter((lang) => lang !== null) || [];
  const formOptions =
    values?.metadata?.languages?.filter((lang) => lang !== null) || [];

  let initialOptions;
  if (typeof formOptions?.[0] === "string" &&
      formOptions.length === recordOptions.length &&
      formOptions.every((formValue, index) => formValue === recordOptions[index]?.id)) {
    initialOptions = recordOptions;
  } else {
    initialOptions = formOptions;
  }
  const stockInitialOptions = initialOptions?.map((opt) =>
    typeof opt === "object" && opt !== null && "id" in opt
      ? { key: opt.id, value: opt.id, text: opt.title_l10n ?? opt.id }
      : { key: opt, value: opt, text: opt }
  );

  return (
    <FieldComponentWrapper
      componentName="LanguagesField"
      fieldPath="metadata.languages"
      {...extraProps}
    >
      <LanguagesField
        fieldPath="metadata.languages"
        initialOptions={stockInitialOptions}
        placeholder={i18next.t(
          'Type to search for a language (press "enter" to select)'
        )}
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
      />
    </FieldComponentWrapper>
  );
};

/**
 * Licenses (metadata.rights). Uses stock LicenseField.
 * @overridable InvenioAppRdm.Deposit.LicenseField.container (via FieldComponentWrapper)
 */
const LicensesComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="LicenseField"
      {...extraProps}
      fieldPath="metadata.rights"
    >
      <LicenseField
        fieldPath="metadata.rights"
        searchConfig={{
          searchApi: {
            axios: {
              headers: {
                Accept: "application/vnd.inveniordm.v1+json",
              },
              url: "/api/vocabularies/licenses",
              withCredentials: false,
            },
          },
          initialQueryState: {
            filters: [["tags", "recommended"]],
          },
        }}
        serializeLicenses={(result) => ({
          title: result.title_l10n,
          description: result.description_l10n,
          id: result.id,
          link: result.props.url,
        })}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Copyright (metadata.copyright). Replacement CopyrightsField (field_components).
 * @overridable InvenioAppRdm.Deposit.CopyrightsField.container (via FieldComponentWrapper)
 */
const CopyrightsComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="CopyrightsField"
      {...extraProps}
      fieldPath="metadata.copyright"
    >
      <CopyrightsField fieldPath="metadata.copyright" />
    </FieldComponentWrapper>
  );
};

/**
 * Publisher (metadata.publisher). Replacement PublisherField (field_components).
 * @overridable InvenioAppRdm.Deposit.PublisherField.container (via FieldComponentWrapper)
 */
const PublisherComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="PublisherField"
      description=""
      helpText=""
      placeholder={""}
      {...extraProps}
      fieldPath="metadata.publisher"
    >
      <PublisherField fieldPath="metadata.publisher" required />
    </FieldComponentWrapper>
  );
};

/**
 * References (metadata.references). Uses stock ReferencesField.
 * @overridable InvenioAppRdm.Deposit.ReferencesField.container (via FieldComponentWrapper)
 */
const ReferencesComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="ReferencesField"
      {...extraProps}
      fieldPath={"metadata.references"}
    >
      <ReferencesField showEmptyValue />
    </FieldComponentWrapper>
  );
};

/**
 * Related works (metadata.related_identifiers). Uses stock RelatedWorksField.
 * @overridable InvenioAppRdm.Deposit.RelatedWorksField.container (via FieldComponentWrapper)
 */
const RelatedWorksComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="RelatedWorksField"
      {...extraProps}
      fieldPath={"metadata.related_identifiers"}
    >
      <RelatedWorksField
        fieldPath="metadata.related_identifiers"
        options={vocabularies.metadata.identifiers}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Resource type (metadata.resource_type). Uses modular ResourceTypeField (replacement SelectField). Override version uses button-style ResourceTypeSelectorField.
 * @overridable InvenioAppRdm.Deposit.ResourceTypeField.container (via FieldComponentWrapper; matches v14 stock id)
 */
const ResourceTypeComponent = ({ ...extraProps }) => {
  const fieldPath = "metadata.resource_type";
  const options = useStore().getState().deposit?.config?.vocabularies?.metadata?.resource_type ?? [];

  console.log("form ui state:", useContext(FormUIStateContext));
  console.log("formik:", useFormikContext());

  return (
    <FieldComponentWrapper
      componentName="ResourceTypeField"
      {...extraProps}
      fieldPath={fieldPath}
    >
      <ResourceTypeField
        fieldPath={fieldPath}
        options={options}
        required={true}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Subjects (metadata.subjects). Uses stock SubjectsField.
 * @overridable InvenioAppRdm.Deposit.SubjectsField.container (via FieldComponentWrapper)
 */
const SubjectsComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };
  const record = useStore().getState().deposit.record;

  let myLimitToOptions = [...vocabularies.metadata.subjects.limit_to];
  myLimitToOptions.reverse();
  myLimitToOptions = moveToArrayStart(
    myLimitToOptions,
    ["FAST-topical", "all"],
    "value"
  );
  return (
    <FieldComponentWrapper
      componentName="SubjectsField"
      placeholder={i18next.t("Search for a subject by name (press 'enter' to select)")}
      label="Subjects"
      description={i18next.t(
        "These standardized subject headings help people to find your materials!"
      )}
      {...extraProps}
      fieldPath="metadata.subjects"
    >
      <SubjectsField
        initialOptions={_get(record, "ui.subjects", null)}
        limitToOptions={myLimitToOptions}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Standalone form feedback block for the sidebar. Renders only when there are
 * errors or action state. Use above SubmissionComponent in FormRightSidebar to
 * show save/publish feedback without bundling it into the submission component.
 * @overridable InvenioAppRdm.Deposit.FormFeedback.container
 */
const FormFeedbackComponent = () => {

  return (
    <Overridable
      id="InvenioAppRdm.Deposit.FormFeedback.container"
      fieldPath="message"
    >
      <ModularFormFeedback fieldPath="message" />
    </Overridable>
  );
};

// OVERRIDDEN
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

  const { actionState, config, errors, record, permissions } =
    store.getState().deposit;

  // errors not related to validation, following a different format {status:.., message:..}
  let nonValidationErrors;
  if (!_isEmpty(errors)) {
    nonValidationErrors = Object.fromEntries(
      Object.entries(errors).filter(
        ([key]) => !RECORD_FIELD_ERROR_ROOTS.includes(key)
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

            <SaveButton fluid aria-describedby="save-button-description" />
            <PreviewButton fluid aria-describedby="preview-button-description" />
            <PublishButton
              fluid
              aria-describedby="publish-button-description"
              id="deposit-form-publish-button"
            />
            {(record?.is_draft === null || permissions?.can_manage) && (
              <ShareDraftButtonComponent />
            )}
            <DeleteComponent
              permissions={permissions}
              record={record}
              aria-describedby="delete-button-description"
              icon="trash alternate outline"
            />
            {/* RecordDeletionComponent (v14): import from v14_components.jsx, register in instance, add to layout */}
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

/**
 * SubmissionComponent matches the stock invenio-app-rdm deposit sidebar layout:
 * Card with DepositStatusBox, then Card.Content with Save | Preview, Publish, Share,
 * then optional Card with DeleteButton. No FormFeedback (stock shows it at top of form).
 * Use with AccessRightsComponent in the right sidebar to mimic the full stock sidebar.
 * @overridable InvenioAppRdm.Deposit.CardDepositStatusBox.container (outer); InvenioAppRdm.Deposit.CardDeleteButton.container (delete card).
 */
const SubmissionComponent = () => {
  const store = useStore();
  const { config, record, permissions } = store.getState().deposit;
  const groupsEnabled = config?.groups_enabled ?? false;

  return (
    <>
      <Overridable
        id="InvenioAppRdm.Deposit.CardDepositStatusBox.container"
        record={record}
        permissions={permissions}
        groupsEnabled={groupsEnabled}
      >
        <Card>
          <Card.Content>
            <DepositStatusBox />
          </Card.Content>
          <Card.Content>
            <Grid relaxed>
              <Grid.Column
                computer={8}
                mobile={16}
                className="pb-0 left-btn-col"
              >
                <SaveButton fluid />
              </Grid.Column>

              <Grid.Column
                computer={8}
                mobile={16}
                className="pb-0 right-btn-col"
              >
                <PreviewButton fluid />
              </Grid.Column>

              <Grid.Column width={16} className="pt-10">
                <PublishButton fluid record={record} />
              </Grid.Column>

              <Grid.Column width={16} className="pt-0">
                {(record?.is_draft === null || permissions?.can_manage) && (
                  <ShareDraftButton
                    record={record}
                    permissions={permissions}
                    groupsEnabled={groupsEnabled}
                  />
                )}
              </Grid.Column>
            </Grid>
          </Card.Content>
        </Card>
      </Overridable>
      {permissions?.can_delete_draft && (
        <Overridable id="InvenioAppRdm.Deposit.CardDeleteButton.container" record={record}>
          <Card>
            <Card.Content>
              <DeleteButton fluid />
            </Card.Content>
          </Card>
        </Overridable>
      )}
    </>
  );
};

/**
 * Title (metadata.title). Uses modular TitlesField (see `replacement_components/field_components`).
 * @overridable InvenioAppRdm.Deposit.TitlesField.container (via FieldComponentWrapper)
 */
const TitlesComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };
  const record = useStore().getState().deposit.record;
  return (
    <FieldComponentWrapper
      componentName="TitlesField"
      required
      label={extraProps.label}
      {...extraProps}
      fieldPath="metadata.title"
    >
      <TitlesField
        fieldPath="metadata.title"
        options={vocabularies.metadata.titles}
        recordUI={record.ui}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Version (metadata.version). Replacement VersionField (field_components).
 * @overridable InvenioAppRdm.Deposit.VersionField.container (via FieldComponentWrapper)
 */
const VersionComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="VersionField"
      helpText=""
      {...extraProps}
      fieldPath="metadata.version"
    >
      <VersionField />
    </FieldComponentWrapper>
  );
};

export {
  AbstractComponent,
  AccessRightsComponent,
  AdditionalDatesComponent,
  AlternateIdentifiersComponent,
  CommunitiesComponent,
  ContributorsComponent,
  CopyrightsComponent,
  CreatorsComponent,
  PublicationDateComponent,
  DeleteComponent,
  DoiComponent,
  FileUploadComponent,
  FormFeedbackComponent,
  FundingComponent,
  HorizontalSubmissionComponent,
  LanguagesComponent,
  LicensesComponent,
  PublisherComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  SubjectsComponent,
  SubmissionComponent,
  TitlesComponent,
  VersionComponent,
};
