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

import React, { Fragment, useContext, useState } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { useFormikContext } from "formik";
import { ReactReduxContext, useStore } from "react-redux";
import { AccordionField } from "react-invenio-forms";
import {
  AccessRightField,
  DescriptionsField,
  CommunityHeader,
  CreatibutorsField,
  DeleteButton,
  DepositFormApp,
  DepositStatusBox,
  FileUploader,
  FormFeedback,
  IdentifiersField,
  PreviewButton,
  LicenseField,
  PublicationDateField,
  PublishButton,
  PublisherField,
  ReferencesField,
  RelatedWorksField,
  SubjectsField,
  TitlesField,
  VersionField,
  SaveButton,
} from "@js/invenio_rdm_records";
import { FundingField } from "@js/invenio_vocabularies";
import { Grid, Message } from "semantic-ui-react";
// import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { DatesField } from "../replacement_components/DatesField";
import { CommunityField } from "../replacement_components/CommunityField";
import { LanguagesField } from "../replacement_components/LanguagesField";
import { PIDField } from "../replacement_components/PIDField";
import ResourceTypeSelectorField from "../replacement_components/ResourceTypeSelectorField";
import { SizesField } from "../replacement_components/SizesField";
import { SubmitButtonModal } from "../replacement_components/PublishButton/SubmitButton";
import { moveToArrayStart } from "../utils";
import { CustomFieldInjector } from "./CustomFieldInjector";
import { FieldComponentWrapper } from "./FieldComponentWrapper";
import { FormUIStateContext } from "../InnerDepositForm";

const AbstractComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit.record;
  const { vocabularies } = useContext(FormUIStateContext);

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
  const permissions = store.getState().deposit.permissions;

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
        fluid
      />
    </FieldComponentWrapper>
  );
};

const AdditionalDatesComponent = ({ ...extraProps }) => {
  const { vocabularies } = useContext(FormUIStateContext);

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
  const { vocabularies } = useContext(FormUIStateContext);

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
  const { vocabularies } = useContext(FormUIStateContext);

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

const BookTitleComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.title"
      idString="ImprintTitleField"
      description={""}
      label={"Book title"}
      icon={"book"}
      {...extraProps}
    />
  );
};

const CodeDevelopmentStatusComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:developmentStatus"
      idString="CodeDevelopmentStatusField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeOperatingSystemComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:operatingSystem"
      idString="CodeOperatingSystemField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeProgrammingLanguageComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:programmingLanguage"
      idString="CodeProgrammingLanguageField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeRepositoryComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:codeRepository"
      idString="CodeRepositoryField"
      description={""}
      {...extraProps}
    />
  );
};

const CodeRuntimePlatformComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Software"
      fieldName="code:runtimePlatform"
      idString="CodeRuntimePlatformField"
      description={""}
      {...extraProps}
    />
  );
};

const CommonsDomainComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:commons_domain"
      idString="CommonsDomainField"
      description={""}
      {...extraProps}
    />
  );
};

const CommunitiesComponent = ({ ...extraProps }) => {
  {
    /* <Overridable id="InvenioAppRdm.Deposit.CommunityHeader.container">
    <CommunityHeader imagePlaceholderLink="/static/images/square-placeholder.png" />
  </Overridable> */
  }
  return (
    <CommunityField
      imagePlaceholderLink="/static/images/square-placeholder.png"
      {...extraProps}
    />
  );
};

const ContributorsComponent = ({ ...extraProps }) => {
  const config = useStore().getState().deposit.config;
  const { vocabularies } = useContext(FormUIStateContext);

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
  const { vocabularies } = useContext(FormUIStateContext);

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
          <DeleteButton fluid />
        </FieldComponentWrapper>
      ) : null}
    </>
  );
};

const DoiComponent = ({ ...extraProps }) => {
  const store = useStore();
  const pids = store.getState().deposit.config.pids;
  const record = store.getState().deposit.record;

  return (
    // FIXME: PIDField doesn't play nicely with FieldComponentWrapper
    // <FieldComponentWrapper componentName="PIDField" {...extraProps}>
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
              record.is_published === true // is_published is `null` at first upload
            }
            managedHelpText={pid.managed_help_text}
            pidLabel={pid.pid_label}
            pidPlaceholder={pid.pid_placeholder}
            pidType={pid.scheme}
            unmanagedHelpText={pid.unmanaged_help_text}
            required
            {...extraProps}
          />
        </Fragment>
      ))}
    </Fragment>
    // </FieldComponentWrapper>
  );
};

const FilesUploadComponent = ({ ...extraProps }) => {
  const { config, record } = useStore().getState().deposit;
  const { noFiles } = useContext(FormUIStateContext);

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
        <FileUploader
          noFiles={noFiles}
          isDraftRecord={!record.is_published}
          quota={config.quota}
          decimalSizeDisplay={config.decimal_size_display}
          showMetadataOnlyToggle={false} //{permissions?.can_manage_files}
        />
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
              funding.funder?.name ??
              funding.funder?.title ??
              funding.funder?.id ??
              "";
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

const ISBNComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.isbn"
      idString="ImprintISBNField"
      icon="barcode"
      placeholder="e.g. 0-06-251587-X"
      description={""}
      {...extraProps}
    />
  );
};

const JournalTitleComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.title"
      idString="JournalTitleField"
      label="Journal title"
      icon=""
      description=""
      {...extraProps}
    />
  );
};

const JournalISSNComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.issn"
      idString="JournalISSNField"
      label="ISSN"
      icon="barcode"
      description=""
      placeholder="e.g. 1234-5678"
      {...extraProps}
    />
  );
};

const JournalVolumeComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.volume"
      idString="JournalVolumeField"
      label={i18next.t("Volume")}
      description=""
      icon="zip"
      {...extraProps}
    />
  );
};

const JournalIssueComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.issue"
      idString="JournalIssueField"
      label={i18next.t("Issue")}
      description=""
      icon="book"
      {...extraProps}
    />
  );
};

const LanguagesComponent = ({ ...extraProps }) => {
  const record = useStore().getState().deposit.record;
  const initialOptions = _get(record, "ui.languages", []).filter(
    (lang) => lang !== null
  ); // needed because dumped empty record from backend gives [null]

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
        noQueryMessage={" "}
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

const MetadataOnlyComponent = () => {
  return <></>;
};

const MeetingAcronymComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.acronym"
      idString="MeetingAcronymField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingDatesComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.dates"
      idString="MeetingDatesField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingPlaceComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.place"
      idString="MeetingPlaceField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingSessionComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.session"
      idString="MeetingSessionField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingSessionPartComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.session_part"
      idString="MeetingSessionPartField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingTitleComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.title"
      idString="MeetingTitleField"
      description={""}
      {...extraProps}
    />
  );
};

const MeetingURLComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference"
      fieldName="meeting:meeting.url"
      idString="MeetingURLField"
      description={""}
      {...extraProps}
    />
  );
};

const SectionPagesComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.pages"
      idString="JournalPagesField"
      description={""}
      label="Section pages"
      icon="file outline"
      placeholder="e.g. 123-145"
      {...extraProps}
    />
  );
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

const PublicationLocationComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.place"
      idString="ImprintPlaceField"
      label={"Place of Publication"}
      icon={"map marker alternate"}
      description={""}
      placeholder={"e.g. Lagos, Nigeria"}
      {...extraProps}
    />
  );
};

const ReferencesComponent = ({ ...extraProps }) => {
  const { vocabularies } = useContext(FormUIStateContext);

  return (
    <FieldComponentWrapper
      componentName="ReferencesField"
      fieldPath={"metadata.references"}
      vocabularies={vocabularies}
      {...extraProps}
    >
      <ReferencesField showEmptyValue />
    </FieldComponentWrapper>
  );
};

const RelatedWorksComponent = ({ ...extraProps }) => {
  const { vocabularies } = useContext(FormUIStateContext);

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

const ResourceTypeComponent = ({ ...extraProps }) => {
  {
    /* <Overridable
        id="InvenioAppRdm.Deposit.ResourceTypeField.container"
        vocabularies={vocabularies}
        fieldPath="metadata.resource_type"
      >
        <ResourceTypeField
          options={vocabularies.metadata.resource_type}
          fieldPath="metadata.resource_type"
          required
        />
      </Overridable> */
  }
  const { vocabularies } = useContext(FormUIStateContext);
  const fieldPath = "metadata.resource_type";
  return (
    <FieldComponentWrapper
      componentName="ResourceTypeSelectorField"
      fieldPath={fieldPath}
      {...extraProps}
    >
      <ResourceTypeSelectorField
        fieldPath={fieldPath}
        options={vocabularies.metadata.resource_type}
        required={true}
      />
    </FieldComponentWrapper>
  );
};

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
  const { vocabularies } = useContext(FormUIStateContext);
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
      placeholder={i18next.t(
        "Search for a subject by name (press 'enter' to select)"
      )}
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

/**
 * SubmissionComponent is the component that displays the submission buttons
 * and the form feedback.
 *
 * Note: the `clientErrors` variable is an alias for the Formik client-side
 * error state. The `errors` variable comes from the Redux store and represents
 * the error state after the last form submission OR on first render.
 *
 */
const SubmissionComponent = () => {
  const { errors: clientErrors, values, setFieldValue } = useFormikContext();
  const { currentUserprofile, handleFormPageChange } =
    useContext(FormUIStateContext);
  const [_, setConfirmedNoFiles] = useState(undefined);
  const store = useStore();

  const { actionState, actionStateExtra, config, errors, record, permissions } = store.getState().deposit;
  const hasFiles = Object.keys(store.getState().files.entries).length > 0;
  const filesEnabled = !!values.files.enabled;
  const missingFiles = filesEnabled && !hasFiles;

  const filterEmptyIdentifiers = async () => {
    if (values.metadata.identifiers.length) {
      let filteredIdentifiers = values.metadata.identifiers.reduce(
        (newList, item) => {
          if (item.identifier !== "" && item.scheme !== "") newList.push(item);
          return newList;
        },
        []
      );
      setFieldValue("metadata.identifiers", filteredIdentifiers);
    }
    return values.metadata.identifiers;
  };

  const fixEmptyPublisher = async () => {
    if (values.metadata.publisher === "" || !values.metadata.publisher) {
      setFieldValue("metadata.publisher", "Knowledge Commons");
    }
    return values.metadata.publisher;
  };

  const handleConfirmNoFiles = async () => {
    if (!hasFiles) {
      setConfirmedNoFiles(true);
      await setFieldValue("files.enabled", false);
    }
  };

  const handleConfirmNeedsFiles = () => {
    setConfirmedNoFiles(false);
    // FIXME:
    handleFormPageChange(null, { value: "page-5" });
  };

  const sanitizeDataForSaving = async () => {
    // FIXME: This is a cludge to fix invalid data before saving
    // where we don't want to force users to fix it
    await filterEmptyIdentifiers();
    await fixEmptyPublisher();
    if (hasFiles && !filesEnabled) {
      await setFieldValue("files.enabled", true);
    }
  };

  // errors not related to validation, following a different format {status:.., message:..}
  let nonValidationErrors;
  if (!_isEmpty(errors)) {
    nonValidationErrors = Object.fromEntries(
      Object.entries(errors).filter(
        ([key]) =>
          !["metadata", "access", "pids", "custom_fields"].includes(key)
      )
    );
  }
  console.log("SubmissionComponent nonValidationErrors:", nonValidationErrors);

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

            {(actionState || !_isEmpty(clientErrors) || !_isEmpty(nonValidationErrors)) && (
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
              currentUserprofile={currentUserprofile}
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              sanitizeDataForSaving={sanitizeDataForSaving}
              missingFiles={missingFiles}
              // disabled={errors && !_isEmpty(errors)}
            />

            <SubmitButtonModal
              fluid
              actionName="preview"
              aria-describedby="preview-button-description"
              currentUserprofile={currentUserprofile}
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              sanitizeDataForSaving={sanitizeDataForSaving}
              missingFiles={missingFiles}
              // disabled={errors && !_isEmpty(errors)}
            />
            <SubmitButtonModal
              fluid
              actionName="publish"
              currentUserprofile={currentUserprofile}
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              sanitizeDataForSaving={sanitizeDataForSaving}
              missingFiles={missingFiles}
              aria-describedby="publish-button-description"
              id="deposit-form-publish-button"
              positive
              // disabled={errors && !_isEmpty(errors)}
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
              {permissions?.can_delete_draft && ", deleted,"} and the files can
              be added or changed.
            </p>
            <p>
              <b>Published deposits</b> can still be edited, but you will no
              longer be able to{" "}
              {permissions?.can_delete_draft && "delete the deposit or "}change
              the attached files. To add or change files for a published deposit
              you must create a new version of the record.
            </p>
            <p>
              Deposits can only be <b>deleted while they are drafts</b>. Once
              you publish your deposit, you can only restrict access and/or
              create a new version.
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Overridable>
  );
};

const SubmitterEmailComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:submitter_email"
      idString="SubmitterEmailField"
      description={""}
      {...extraProps}
    />
  );
};

const SubmitterUsernameComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:submitter_username"
      idString="SubmitterUsernameField"
      description={""}
      {...extraProps}
    />
  );
};
const SubtitleComponent = () => {
  return <></>;
};

const TitleComponent = ({ ...extraProps }) => {
  const { vocabularies } = useContext(FormUIStateContext);
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

const TotalPagesComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.pages"
      idString="ImprintPagesField"
      description={""}
      label={i18next.t("Total book pages")}
      icon="file outline"
      {...extraProps}
    />
  );
};

const UniversityComponent = ({ ...extraProps }) => {
  return (
    <CustomFieldInjector
      sectionName="KCR Book information"
      fieldName="thesis:university"
      idString="ThesisUniversity"
      {...extraProps}
    />
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
  BookTitleComponent,
  CodeDevelopmentStatusComponent,
  CodeOperatingSystemComponent,
  CodeProgrammingLanguageComponent,
  CodeRepositoryComponent,
  CodeRuntimePlatformComponent,
  CommonsDomainComponent,
  CommunitiesComponent,
  ContributorsComponent,
  CreatorsComponent,
  DateComponent,
  DeleteComponent,
  DoiComponent,
  FilesUploadComponent,
  FundingComponent,
  ISBNComponent,
  JournalISSNComponent,
  JournalIssueComponent,
  JournalTitleComponent,
  JournalVolumeComponent,
  LanguagesComponent,
  LicensesComponent,
  MetadataOnlyComponent,
  MeetingAcronymComponent,
  MeetingDatesComponent,
  MeetingPlaceComponent,
  MeetingSessionComponent,
  MeetingSessionPartComponent,
  MeetingTitleComponent,
  MeetingURLComponent,
  PublisherComponent,
  PublicationLocationComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
  SectionPagesComponent,
  SizesComponent,
  SubjectsComponent,
  SubmissionComponent,
  SubmitterEmailComponent,
  SubmitterUsernameComponent,
  SubtitleComponent,
  TitleComponent,
  TotalPagesComponent,
  UniversityComponent,
  VersionComponent,
};
