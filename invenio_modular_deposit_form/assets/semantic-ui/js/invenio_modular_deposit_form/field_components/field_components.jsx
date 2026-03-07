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

import React, { Fragment } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import {
  AccessRightField,
  CommunityHeader,
  CopyrightsField,
  CreatibutorsField,
  DatesField,
  DeleteButton,
  DescriptionsField,
  FileUploader,
  FormFeedback,
  IdentifiersField,
  LanguagesField,
  LicenseField,
  PIDField,
  PreviewButton,
  PublicationDateField,
  PublisherField,
  PublishButton,
  ReferencesField,
  RelatedWorksField,
  ResourceTypeField,
  SaveButton,
  SubjectsField,
  TitlesField,
  UppyUploader,
  VersionField,
} from "@js/invenio_rdm_records";
import { FundingField } from "@js/invenio_vocabularies";
import { ShareDraftButton } from "@js/invenio_app_rdm/deposit/ShareDraftButton";
import { Grid } from "semantic-ui-react";
import Overridable from "react-overridable";
import { SizesField } from "../replacement_components/SizesField";
import { moveToArrayStart } from "../utils";
import { CustomFieldInjector } from "./CustomFieldInjector";
import { FieldComponentWrapper } from "./FieldComponentWrapper";

// v14 (invenio-app-rdm master) components; not present in v13. Safe to import when app
// provides @js/invenio_app_rdm; wrap in try/catch so build/runtime with v13 does not break.
let RecordDeletion = null;
let FileModificationUntil = null;
try {
  const recordDeletionMod = require("@js/invenio_app_rdm/components/RecordDeletion");
  RecordDeletion = recordDeletionMod.RecordDeletion;
} catch (_) {}
try {
  const fileModMod = require("@js/invenio_app_rdm/components/FileModificationUntil");
  FileModificationUntil = fileModMod.FileModificationUntil;
} catch (_) {}

const AbstractComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit.record;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    // <Overridable
    //   id="InvenioAppRdm.Deposit.DescriptionsField.container"
    //   record={record}
    //   vocabularies={vocabularies}
    //   fieldPath="metadata.description"
    // >
    <FieldComponentWrapper
      componentName="DescriptionsField"
      fieldPath="metadata.description"
      {...extraProps}
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

const AccessRightsComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { config, record, permissions } = store.getState().deposit;

  return (
    <FieldComponentWrapper
      componentName="AccessRightField"
      fieldPath="access"
      {...extraProps}
      icon={extraProps.icon || "shield"}
      label={extraProps.label || i18next.t("Public access")}
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

// OVERRIDDEN
// ReactOverridable id: InvenioAppRdm.Deposit.DateField.container (via FieldComponentWrapper).
// Stock: InvenioRdmRecords.DatesField.AddDateArrayField.Container.
// Wraps stock DatesField from @js/invenio_rdm_records. Stock props: fieldPath, options (shape.type),
// label, labelIcon, placeholderDate, required, requiredOptions, showEmptyValue.
// Override version (override_components.jsx) uses our DatesField replacement; same props passed
// (fieldPath, options=vocabularies.metadata.dates, showEmptyValue=false). Stock uses labelIcon;
// our replacement used icon—equivalent.
const AdditionalDatesComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="DateField"
      fieldPath="metadata.dates"
      {...extraProps}
    >
      <DatesField
        fieldPath="metadata.dates"
        options={vocabularies.metadata.dates}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

const AdditionalDescriptionComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit.record;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="DescriptionsField"
      fieldPath="metadata.description"
      {...extraProps}
    >
      <DescriptionsField
        options={vocabularies.metadata.descriptions}
        recordUI={_get(record, "ui", null)}
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

const AdditionalTitlesComponent = () => {
  return <></>;
};

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

// OVERRIDDEN
// ReactOverridable id: InvenioAppRdm.Deposit.CommunityHeader.container.
// Stock: CommunityHeader from @js/invenio_rdm_records (Redux-connected). Inner Overridable ids:
//   InvenioRdmRecords.CommunityHeader.CommunityHeaderElement.Container,
//   InvenioRdmRecords.CommunityHeader.CommunitySelectionButton.Container,
//   InvenioRdmRecords.CommunityHeader.RemoveCommunityButton.Container.
// Stock props (required): imagePlaceholderLink, record. Other props from Redux (community,
//   showCommunityHeader, showCommunitySelectionButton, disableCommunitySelectionButton,
//   changeSelectedCommunity). Override version (override_components.jsx) uses our CommunityField
//   replacement which accepts imagePlaceholderLink and ...extraProps (no explicit record—likely
//   reads from store internally). Stock does not use FieldComponentWrapper.
const CommunitiesComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit?.record;
  return (
    <CommunityHeader
      imagePlaceholderLink="/static/images/square-placeholder.png"
      record={record ?? {}}
      {...extraProps}
    />
  );
};

const ContributorsComponent = ({ ...extraProps }) => {
  const config = useStore().getState().deposit.config;
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="ContibutorsField"
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

const DateComponent = ({ ...extraProps }) => {
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

// Wrapper for v14 RecordDeletion (invenio-app-rdm). Renders only when stock component
// is available and config.record_deletion is present with enabled flag (v13 has neither).
const RecordDeletionComponent = () => {
  const store = useStore();
  const { config, record, permissions } = store.getState().deposit;
  const recordDeletion = config.record_deletion ?? {};
  const options = _get(config, "vocabularies.metadata.deletion_request_removal_reasons", []);
  if (!RecordDeletion || !record?.is_published || !recordDeletion.enabled) {
    return null;
  }
  return (
    <RecordDeletion
      record={record ?? {}}
      permissions={permissions ?? {}}
      recordDeletion={recordDeletion}
      options={options}
    />
  );
};

// Wrapper for v14 FileModificationUntil (invenio-app-rdm). Shows "Unlocked, X days to
// publish changes" in the Files section when file_modification is present. Not part of
// FileUploader; v13 does not have this component.
const FileModificationUntilComponent = () => {
  const store = useStore();
  const { config, record } = store.getState().deposit;
  const fileModification = config.file_modification;
  const filesLocked = config.files_locked ?? false;
  if (!FileModificationUntil || fileModification == null) return null;
  return (
    <FileModificationUntil
      filesLocked={filesLocked}
      fileModification={fileModification}
      record={record ?? {}}
    />
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

// OVERRIDDEN
// ReactOverridable id: InvenioAppRdm.Deposit.PIDField.container (stock has no wrapper; not using FieldComponentWrapper—FIXME in original).
// Stock: PIDField from @js/invenio_rdm_records. No Overridable ids inside; uses FastField + CustomPIDField.
// Stock props: fieldPath, fieldLabel, isEditingPublishedRecord, record (required), pidType; optional btnLabelDiscardPID,
//   btnLabelGetPID, canBeManaged, canBeUnmanaged, managedHelpText, pidIcon, pidLabel, pidPlaceholder, required, unmanagedHelpText.
// Override version (override_components.jsx) uses our PIDField replacement; same props from config.pids + record.
// Difference: stock requires record explicitly; our replacement may read it from context. Stock has pidIcon default "barcode".
const DoiComponent = ({ ...extraProps }) => {
  const store = useStore();
  const pids = store.getState().deposit.config.pids;
  const record = store.getState().deposit.record;

  return (
    <Fragment>
      {pids.map((pid) => (
        <Fragment key={pid.scheme}>
          <PIDField
            btnLabelDiscardPID={pid.btn_label_discard_pid}
            btnLabelGetPID={pid.btn_label_get_pid}
            canBeManaged={pid.can_be_managed}
            canBeUnmanaged={pid.can_be_unmanaged}
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
            required
            unmanagedHelpText={pid.unmanaged_help_text}
            {...extraProps}
          />
        </Fragment>
      ))}
    </Fragment>
  );
};

const FilesUploadComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { config, record } = store.getState().deposit;
  const files = store.getState().files;
  const noFiles = Object.keys(files?.entries ?? {}).length === 0 && record?.is_published;
  const useUppy = config.use_uppy ?? false;
  const commonFileUploaderProps = {
    noFiles,
    isDraftRecord: !record.is_published,
    quota: config.quota,
    decimalSizeDisplay: config.decimal_size_display,
    filesLocked: config.files_locked ?? false,
    allowEmptyFiles: config.allow_empty_files ?? true,
    showMetadataOnlyToggle: false, // permissions?.can_manage_files
    // v14 only: pass when present so v13 uploaders (no fileModification prop) are unchanged
    ...(config.file_modification != null && { fileModification: config.file_modification }),
  };

  return (
    <>
      {/* <Overridable
      id="InvenioAppRdm.Deposit.AccordionFieldFiles.container"
      record={record}
      config={config}
      noFiles={noFiles}
    >*/}
      <FieldComponentWrapper
        componentName="FileUploader"
        fieldPath="files"
        {...extraProps}
      >
        <>
          <FileModificationUntilComponent />
          {useUppy ? (
            <UppyUploader {...commonFileUploaderProps} />
          ) : (
            <FileUploader {...commonFileUploaderProps} />
          )}
        </>
      </FieldComponentWrapper>
      {/*</Overridable> */}
    </>
  );
};

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

// OVERRIDDEN
// ReactOverridable id: InvenioAppRdm.Deposit.LanguagesField.container (via FieldComponentWrapper).
// Stock: LanguagesField from @js/invenio_rdm_records. No Overridable inside; wraps RemoteSelectField.
// Stock props: fieldPath, label, labelIcon, required, multiple, clearable, placeholder, initialOptions
//   (array of { key, value, text }), serializeSuggestions; default noQueryMessage "Search for languages...".
// Override version (override_components.jsx) adds useEffect + onValueChange to keep form state as objects
//   (id, title_l10n) for readable labels; stock may store only ids. Stock uses suggestionAPIUrl
//   /api/vocabularies/languages. Map initialOptions to { key, value, text } for stock.
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

const LicensesComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="LicenseField"
      fieldPath="metadata.rights"
      {...extraProps}
    >
      <LicenseField
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

const CopyrightsComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="CopyrightsField"
      fieldPath="metadata.copyright"
      {...extraProps}
    >
      <CopyrightsField fieldPath="metadata.copyright" />
    </FieldComponentWrapper>
  );
};

const MetadataOnlyComponent = () => {
  return <></>;
};

const PublisherComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="PublisherField"
      fieldPath="metadata.publisher"
      description=""
      helpText=""
      placeholder={""}
      {...extraProps}
    >
      <PublisherField fieldPath="metadata.publisher" required />
    </FieldComponentWrapper>
  );
};

const ReferencesComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="ReferencesField"
      fieldPath={"metadata.references"}
      {...extraProps}
    >
      <ReferencesField showEmptyValue />
    </FieldComponentWrapper>
  );
};

const RelatedWorksComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="RelatedWorksField"
      fieldPath={"metadata.related_identifiers"}
      {...extraProps}
    >
      <RelatedWorksField
        fieldPath="metadata.related_identifiers"
        options={vocabularies.metadata.identifiers}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

// OVERRIDDEN
// ReactOverridable id: InvenioAppRdm.Deposit.ResourceTypeSelectorField.container (via FieldComponentWrapper).
// Stock: ResourceTypeField from @js/invenio_rdm_records. No Overridable inside; wraps SelectField.
// Stock props: fieldPath, options (array of { icon, type_name, subtype_name, id }), label, labelIcon, required.
// Override version (override_components.jsx) uses our ResourceTypeSelectorField (button-style UI). Stock uses
// dropdown SelectField with createOptions mapping options to { value, icon, text }. Pass vocabularies.metadata.resource_type as options.
const ResourceTypeComponent = ({ ...extraProps }) => {
  const fieldPath = "metadata.resource_type";
  const options = useStore().getState().deposit?.config?.vocabularies?.metadata?.resource_type ?? [];
  return (
    <FieldComponentWrapper
      componentName="ResourceTypeSelectorField"
      fieldPath={fieldPath}
      {...extraProps}
    >
      <ResourceTypeField
        fieldPath={fieldPath}
        options={options}
        required={true}
      />
    </FieldComponentWrapper>
  );
};

// OVERRIDDEN
// ReactOverridable id: InvenioAppRdm.Deposit.SizeField.container (via FieldComponentWrapper).
// No stock SizesField in @js/invenio_rdm_records deposit fields; metadata.sizes is not a dedicated
// field component in stock RDM. This version continues to use our SizesField replacement.
const SizesComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="SizeField"
      fieldPath="metadata.sizes"
      icon={"crop"}
      label={i18next.t("Dimensions")}
      {...extraProps}
    >
      <SizesField fieldPath="metadata.sizes" label="Size" />
    </FieldComponentWrapper>
  );
};

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
      fieldPath="metadata.subjects"
      placeholder={i18next.t("Search for a subject by name (press 'enter' to select)")}
      label="Subjects"
      description={i18next.t(
        "These standardized subject headings help people to find your materials!"
      )}
      {...extraProps}
    >
      <SubjectsField
        initialOptions={_get(record, "ui.subjects", null)}
        limitToOptions={myLimitToOptions}
      />
    </FieldComponentWrapper>
  );
};

// OVERRIDDEN
/**
 * SubmissionComponent is the component that displays the submission buttons
 * and the form feedback.
 *
 * Note: the `clientErrors` variable is an alias for the Formik client-side
 * error state. The `errors` variable comes from the Redux store and represents
 * the error state after the last form submission OR on first page render.
 *
 * Uses stock SaveButton, PreviewButton, PublishButton, FormFeedback, DeleteButton
 * from @js/invenio_rdm_records. Override id: InvenioAppRdm.Deposit.CardDepositStatusBox.container.
 * Override (override_components.jsx) uses SubmitButtonModal (save/preview/publish) with
 * missing-files confirmation and "no files" flow; stock uses separate buttons and
 * PublishButton disables when files enabled but none uploaded (no confirm modal for that).
 */
const SubmissionComponent = () => {
  const { errors: clientErrors } = useFormikContext();
  const store = useStore();

  const { actionState, config, errors, record, permissions } =
    store.getState().deposit;

  // errors not related to validation, following a different format {status:.., message:..}
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
            {record?.is_published && <RecordDeletionComponent />}
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

const SubtitleComponent = () => {
  return <></>;
};

const TitleComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };
  const record = useStore().getState().deposit.record;
  return (
    <FieldComponentWrapper
      componentName="TitlesField"
      fieldPath="metadata.title"
      required
      label={extraProps.label}
      {...extraProps}
    >
      <TitlesField
        fieldPath="metadata.title"
        options={vocabularies.metadata.titles}
        recordUI={record.ui}
      />
    </FieldComponentWrapper>
  );
};

const VersionComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="VersionField"
      fieldPath="metadata.version"
      helpText=""
      {...extraProps}
    >
      <VersionField />
    </FieldComponentWrapper>
  );
};

export {
  AbstractComponent,
  AccessRightsComponent,
  AdditionalDatesComponent,
  AdditionalDescriptionComponent,
  AdditionalTitlesComponent,
  AlternateIdentifiersComponent,
  CommunitiesComponent,
  ContributorsComponent,
  CopyrightsComponent,
  CreatorsComponent,
  DateComponent,
  DeleteComponent,
  DoiComponent,
  FilesUploadComponent,
  FundingComponent,
  LanguagesComponent,
  LicensesComponent,
  MetadataOnlyComponent,
  PublisherComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  SizesComponent,
  SubjectsComponent,
  SubmissionComponent,
  SubtitleComponent,
  TitleComponent,
  VersionComponent,
};
