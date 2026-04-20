// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// The Knowledge Commons Repository and Invenio App RDM are both free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Fragment, useEffect, useRef } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { useFormikContext } from "formik";
import { FeedbackLabel, FieldLabel } from "react-invenio-forms";
import { useStore } from "react-redux";
import {
  AccessRightField,
  CommunityHeader,
  DeleteButton,
  DepositStatusBox,
  FileUploader,
  LicenseField,
  PreviewButton,
  PublicationDateField,
  PublishButton,
  ReferencesField,
  SaveButton,
  UppyUploader,
} from "@js/invenio_rdm_records";
import { useFormUIState } from "../FormUIStateManager.jsx";
import { SyncFilesCountFromRedux } from "../helpers/SyncFilesCountFromRedux";
import { PIDField as ReplacementPIDField } from "../replacement_components/field_components/PIDField";
import { FormFeedback as ModularFormFeedback } from "./alternate/field_inputs/FormFeedback";
import {
  CopyrightsField,
  CreatibutorsField,
  DatesField,
  DescriptionsField,
  IdentifiersField,
  LanguagesField,
  PublisherField,
  RelatedWorksField,
  ResourceTypeField,
  SubjectsField,
  TitlesField,
  VersionField,
} from "../replacement_components/field_components";
import { CreatibutorsFieldFlat } from "./alternate/field_inputs";
import { FundingField } from "@js/invenio_vocabularies";
import { ShareDraftButton } from "@js/invenio_app_rdm/deposit/ShareDraftButton";
import { Card, Form, Grid } from "semantic-ui-react";
import Overridable from "react-overridable";
import { getTouchedParent } from "../utils";
import { FieldComponentWrapper } from "./FieldComponentWrapper";

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
      labelIcon="shield"
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
 * Additional dates field (metadata.dates). Replacement DatesField (`replacement_components`; local widgets).
 * For dropdown-based additional dates use `AdditionalDatesAlternateComponent` (`alternate_components/DatesFieldAlternate`).
 * @overridable InvenioAppRdm.Deposit.DateField.container (via FieldComponentWrapper)
 */
const AdditionalDatesComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper componentName="DateField" {...extraProps} fieldPath="metadata.dates">
      <DatesField
        fieldPath="metadata.dates"
        options={vocabularies.metadata.dates}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

/**
 * Alternate identifiers / URLs (metadata.identifiers). Replacement IdentifiersField
 * (`replacement_components`; bare `GroupField` like stock — see fork header).
 * @overridable InvenioAppRdm.Deposit.IdentifiersField.container (via FieldComponentWrapper)
 */
const AlternateIdentifiersComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="IdentifiersField"
      fieldPath="metadata.identifiers"
      label={i18next.t("URLs and Other Identifiers")}
      labelIcon="barcode"
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
 * Community selection (no fieldPath). Uses stock CommunityHeader.
 * For CommunityField UI use `CommunitiesAlternateComponent` (`field_components/alternate/`).
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
      labelIcon="user plus"
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
      labelIcon="user"
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
 * Publication date (metadata.publication_date). Uses stock `PublicationDateField` from `@js/invenio_rdm_records`.
 * Use in layouts that reference `PublicationDateComponent`. For dropdown-based publication date (and for
 * `CombinedDatesComponent`), use `PublicationDateAlternateComponent` instead.
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
 * `icon` is the Semantic UI Button icon name (same as stock), not `FieldLabel` / `labelIcon`;
 * it is applied directly to DeleteButton and must not be passed through FieldComponentWrapper
 * (the wrapper only forwards `labelIcon` to children).
 * @overridable InvenioAppRdm.Deposit.CardDeleteButton.container (via FieldComponentWrapper)
 */
const DeleteComponent = ({ icon = "trash alternate outline", ...extraProps }) => {
  const permissions = useStore().getState().deposit.permissions;

  return (
    <>
      {permissions?.can_delete_draft ? (
        <FieldComponentWrapper componentName="CardDeleteButton" fieldPath={""} {...extraProps}>
          <DeleteButton fluid size="large" className="centered warning" icon={icon} />
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
 * DOI field (pids.doi) using replacement PIDField.
 * @overridable InvenioAppRdm.Deposit.PIDField.container (via FieldComponentWrapper)
 */
const DoiComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { config, record } = store.getState().deposit;
  const pids = Array.isArray(config?.pids) ? config.pids : [];
  const doiPid = pids.find((pid) => pid?.scheme === "doi");

  if (!doiPid) {
    return null;
  }

  return (
    <FieldComponentWrapper componentName="PIDField" {...extraProps} fieldPath="pids.doi">
      <ReplacementPIDField
        btnLabelDiscardPID={doiPid.btn_label_discard_pid}
        btnLabelGetPID={doiPid.btn_label_get_pid}
        canBeManaged={doiPid.can_be_managed}
        canBeUnmanaged={doiPid.can_be_unmanaged}
        doiDefaultSelection={doiPid.default_selected}
        optionalDOItransitions={doiPid.optional_doi_transitions ?? {}}
        fieldPath="pids.doi"
        fieldLabel={doiPid.field_label}
        isEditingPublishedRecord={record?.is_published === true}
        managedHelpText={doiPid.managed_help_text}
        pidLabel={doiPid.pid_label}
        pidPlaceholder={doiPid.pid_placeholder}
        pidType={doiPid.scheme}
        record={record ?? {}}
        required={config?.is_doi_required ?? true}
        reservedHelpText={doiPid.reserved_help_text}
        unmanagedHelpText={doiPid.unmanaged_help_text}
      />
    </FieldComponentWrapper>
  );
};

/**
 * File upload section (files). Uses stock FileUploader or UppyUploader.
 * @overridable InvenioAppRdm.Deposit.FileUploader.container (via FieldComponentWrapper)
 */
const FileUploadComponent = ({ ...extraProps }) => {
  const store = useStore();
  const { touched, setFieldTouched, values, validateField } = useFormikContext();
  const filesEnabled = values?.files?.enabled;
  const prevFilesEnabledRef = useRef(undefined);

  // Stock FileUploaderToolbar calls setFieldValue twice in one handler; the second
  // validateOnChange run merges from stale state and can re-apply a files error.
  // After commit, values are correct — re-validate the `files` branch when enabled toggles.
  useEffect(() => {
    const prev = prevFilesEnabledRef.current;
    prevFilesEnabledRef.current = filesEnabled;
    if (prev !== undefined && prev !== filesEnabled) {
      void validateField("files");
    }
  }, [filesEnabled, validateField]);

  const { formUIState } = useFormUIState();
  const { config, permissions, record } = store.getState().deposit;
  const files = store.getState().files;
  const noFiles = Object.keys(files?.entries ?? {}).length === 0 && record?.is_published;
  const showMetaOnly = extraProps.showMetadataOnlyToggle;
  const useUppy = config.use_uppy ?? false;

  // Find error state to manually display error tooltip.
  const pageId = formUIState?.currentFormPage ?? "";
  const flagged = formUIState?.sectionErrorsFlagged ?? [];
  const isFilesFieldPath = (p) => p === "files" || p.startsWith("files.");
  const sectionErrors = flagged.find(
    (e) => e.page === pageId && (e?.error_fields ?? []).some(isFilesFieldPath)
  );
  const fileErrorPaths = (sectionErrors?.error_fields ?? []).filter(isFilesFieldPath);

  // Manually set child paths touched when necessary to trigger FeedbackLabel display
  // (which depends on exact field match, not just parent field).
  useEffect(() => {
    fileErrorPaths.forEach((path) => {
      if (_get(touched, path) !== true && getTouchedParent(touched, path)) {
        setFieldTouched(path, true, false);
      }
    });
  }, [fileErrorPaths, setFieldTouched, touched]);

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

  const fileFieldLabel = extraProps.label;
  const fileFieldIcon = extraProps.icon ?? extraProps.labelIcon ?? "file";

  return (
    <>
      {fileFieldLabel && (
        <Form.Field>
          <FieldLabel htmlFor="files" icon={fileFieldIcon} label={fileFieldLabel} />
        </Form.Field>
      )}
      <SyncFilesCountFromRedux />
      {fileErrorPaths.length > 0 && (
        <div className="field rel-mt-1 error" role="alert">
          <FeedbackLabel fieldPath="files" pointing="below" hasSubfields />
        </div>
      )}
      <FieldComponentWrapper componentName="FileUploader" fieldPath="files" {...extraProps}>
        {useUppy ? (
          <UppyUploader {...commonFileUploaderProps} />
        ) : (
          <FileUploader {...commonFileUploaderProps} />
        )}
      </FieldComponentWrapper>
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
 * Formik stores codes in metadata.languages (strings); RemoteSelectField mirrors { id, title_l10n } to ui.metadata.languages.
 * @overridable InvenioAppRdm.Deposit.LanguagesField.container (via FieldComponentWrapper)
 */
const LanguagesComponent = ({ ...extraProps }) => {
  const { values } = useFormikContext();
  const depositRecordUiLanguages =
    useStore()
      .getState()
      .deposit.record?.ui?.languages?.filter((lang) => lang !== null) || [];
  const formikUiLanguages =
    _get(values, "ui.metadata.languages", [])?.filter((lang) => lang !== null) || [];
  /** RemoteSelectField mirrors selected labels to ui.<fieldPath>; prefer that over Redux record UI. */
  const uiSourceOptions =
    formikUiLanguages.length > 0 ? formikUiLanguages : depositRecordUiLanguages;

  const languageCodes =
    values?.metadata?.languages?.filter((lang) => lang !== null && typeof lang === "string") || [];

  const initialOptions = languageCodes.map((code) => {
    const hit = uiSourceOptions.find((o) => o.id === code);
    return hit ?? { id: code, title_l10n: code };
  });

  return (
    <FieldComponentWrapper
      componentName="LanguagesField"
      fieldPath="metadata.languages"
      {...extraProps}
    >
      <LanguagesField
        fieldPath="metadata.languages"
        initialOptions={initialOptions}
        placeholder={i18next.t('Type to search for a language (press "enter" to select)')}
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
    <FieldComponentWrapper componentName="LicenseField" {...extraProps} fieldPath="metadata.rights">
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
            sortBy: "bestmatch",
            sortOrder: "asc",
            layout: "list",
            page: 1,
            size: 12,
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
 * Related works (metadata.related_identifiers). Replacement RelatedWorksField (`replacement_components`; local widgets).
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
 * Resource type (metadata.resource_type). Uses modular ResourceTypeField (replacement SelectField).
 * For button-style shortcuts + “Other” select, use `ResourceTypeSelectorComponent` in `field_components/alternate/`.
 * @overridable InvenioAppRdm.Deposit.ResourceTypeField.container (via FieldComponentWrapper; matches v14 stock id)
 */
const ResourceTypeComponent = ({ ...extraProps }) => {
  const fieldPath = "metadata.resource_type";
  const options =
    useStore().getState().deposit?.config?.vocabularies?.metadata?.resource_type ?? [];

  return (
    <FieldComponentWrapper componentName="ResourceTypeField" {...extraProps} fieldPath={fieldPath}>
      <ResourceTypeField fieldPath={fieldPath} options={options} required={true} />
    </FieldComponentWrapper>
  );
};

/**
 * Subjects (metadata.subjects). Replacement `SubjectsField` (omits header when `label` is unset).
 * @overridable InvenioAppRdm.Deposit.SubjectsField.container (via FieldComponentWrapper)
 */
const SubjectsComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };
  const record = useStore().getState().deposit.record;

  let myLimitToOptions = [...vocabularies.metadata.subjects.limit_to];
  // FIXME: KCWorks-specific logic we need to override
  // myLimitToOptions.reverse();
  // myLimitToOptions = moveToArrayStart(myLimitToOptions, ["FAST-topical", "all"], "value");
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
 * show save/publish feedback.
 * Forwards optional props (e.g. `hideMessageIcon`) to modular `FormFeedback`
 * (`replacement_components/alternate_components/FormFeedback.jsx`).
 * @overridable InvenioAppRdm.Deposit.FormFeedback.container
 */
const FormFeedbackComponent = (props) => {
  return (
    <Overridable id="InvenioAppRdm.Deposit.FormFeedback.container" fieldPath="message">
      <ModularFormFeedback {...props} fieldPath="message" />
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
              <Grid.Column computer={8} mobile={16} className="pb-0 left-btn-col">
                <SaveButton fluid />
              </Grid.Column>

              <Grid.Column computer={8} mobile={16} className="pb-0 right-btn-col">
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
  LanguagesComponent,
  LicensesComponent,
  PublisherComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  ShareDraftButtonComponent,
  SubjectsComponent,
  SubmissionComponent,
  TitlesComponent,
  VersionComponent,
};
