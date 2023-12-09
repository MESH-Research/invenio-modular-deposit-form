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
import { useStore } from "react-redux";
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
  LanguagesField,
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
import { Grid } from "semantic-ui-react";
// import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { CommunityField } from "../replacement_components/CommunityField";
import ResourceTypeSelectorField from "../replacement_components/ResourceTypeSelectorField";
import { PIDField } from "../replacement_components/PIDField";
import { DatesField } from "../replacement_components/DatesField";
import { moveToArrayStart } from "../utils";
import { CustomFieldInjector } from "./CustomFieldInjector";
import { SubmitButtonModal } from "../replacement_components/PublishButton/SubmitButton";
import { FormValuesContext } from "../RDMDepositForm";

const AbstractComponent = ({ record, vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.DescriptionsField.container"
      record={record}
      vocabularies={vocabularies}
      fieldPath="metadata.description"
    >
      <DescriptionsField
        fieldPath="metadata.description"
        options={vocabularies.metadata.descriptions}
        recordUI={_get(record, "ui", null)}
        label="Description"
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
    </Overridable>
  );
};

const AccessRightsComponent = ({ permissions }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.AccessRightField.container"
      fieldPath="access"
    >
      <AccessRightField
        label={i18next.t("Public access")}
        labelIcon="shield"
        fieldPath="access"
        showMetadataAccess={permissions?.can_manage_record_access}
        fluid
      />
    </Overridable>
  );
};

const AdditionalDatesComponent = ({ vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.DateField.container"
      vocabularies={vocabularies}
      fieldPath="metadata.dates"
    >
      <DatesField
        fieldPath="metadata.dates"
        options={vocabularies.metadata.dates}
        showEmptyValue={false}
      />
    </Overridable>
  );
};

const AdditionalDescriptionComponent = ({ record, vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.DescriptionsField.container"
      record={record}
      vocabularies={vocabularies}
      fieldPath="metadata.description"
    >
      <DescriptionsField
        fieldPath="metadata.description"
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
    </Overridable>
  );
};

const AdditionalTitlesComponent = () => {
  return <></>;
};

const AlternateIdentifiersComponent = ({ vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.IdentifiersField.container"
      vocabularies={vocabularies}
      fieldPath="metadata.identifiers"
    >
      <IdentifiersField
        fieldPath="metadata.identifiers"
        label={i18next.t("URLs and Other Identifiers")}
        labelIcon="barcode"
        schemeOptions={vocabularies.metadata.identifiers.scheme}
        showEmptyValue
      />
    </Overridable>
  );
};

const BookTitleComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.title"
      idString="ImprintTitleField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const CommonsDomainComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:commons_domain"
      idString="CommonsDomainField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const CommunitiesComponent = () => {
  {
    /* <Overridable id="InvenioAppRdm.Deposit.CommunityHeader.container">
    <CommunityHeader imagePlaceholderLink="/static/images/square-placeholder.png" />
  </Overridable> */
  }
  return (
    <CommunityField imagePlaceholderLink="/static/images/square-placeholder.png" />
  );
};

const ContributorsComponent = ({ config, vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.ContributorsField.container"
      fieldPath="metadata.contributors"
      vocabularies={vocabularies}
      config={config}
    >
      <CreatibutorsField
        addButtonLabel={i18next.t("Add contributor")}
        label={i18next.t("Contributors")}
        labelIcon="user plus"
        fieldPath="metadata.contributors"
        roleOptions={vocabularies.metadata.contributors.role}
        schema="contributors"
        autocompleteNames={config.autocomplete_names}
        modal={{
          addLabel: "Add contributor",
          editLabel: "Edit contributor",
        }}
        id="InvenioAppRdm.Deposit.ContributorsField.card"
        description="Contributors play a secondary role in the production of this material (e.g., illustrators, research assistants, and in some cases editors or translators)."
      />
    </Overridable>
  );
};

const CreatorsComponent = ({ config, vocabularies, label, ...props }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.CreatorsField.container"
      vocabularies={vocabularies}
      config={config}
      fieldPath="metadata.creators"
    >
      <CreatibutorsField
        label={i18next.t(label) || i18next.t("Creators")}
        labelIcon="user"
        fieldPath="metadata.creators"
        roleOptions={vocabularies.metadata.creators.role}
        schema="creators"
        autocompleteNames={config.autocomplete_names}
        required
        description=""
        {...props}
      />
    </Overridable>
  );
};

const DateComponent = () => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.PublicationDateField.container"
      fieldPath="metadata.publication_date"
    >
      <PublicationDateField required fieldPath="metadata.publication_date" />
    </Overridable>
  );
};

const DeleteComponent = ({ permissions, record, icon }) => {
  return (
    <>
      {permissions?.can_delete_draft && (
        <Overridable
          id="InvenioAppRdm.Deposit.CardDeleteButton.container"
          record={record}
        >
          <DeleteButton fluid icon={icon} />
        </Overridable>
      )}
    </>
  );
};

const DoiComponent = ({ config, record }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.PIDField.container"
      config={config}
      record={record}
    >
      <Fragment>
        {config.pids.map((pid) => (
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
            />
          </Fragment>
        ))}
      </Fragment>
    </Overridable>
  );
};

const FilesUploadComponent = ({ config, noFiles, record, permissions }) => {
  return (
    <>
      {/* <Overridable
      id="InvenioAppRdm.Deposit.AccordionFieldFiles.container"
      record={record}
      config={config}
      noFiles={noFiles}
    >*/}
      {noFiles && record.is_published && (
        <div className="text-align-center pb-10">
          <em>{i18next.t("The record has no files.")}</em>
        </div>
      )}
      <Overridable
        id="InvenioAppRdm.Deposit.FileUploader.container"
        record={record}
        config={config}
      >
        <FileUploader
          isDraftRecord={!record.is_published}
          quota={config.quota}
          decimalSizeDisplay={config.decimal_size_display}
          showMetadataOnlyToggle={false} //{permissions?.can_manage_files}
        />
      </Overridable>
      {/*</Overridable> */}
    </>
  );
};

const FundingComponent = ({}) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.FundingField.container"
      fieldPath="metadata.funding"
    >
      <FundingField
        fieldPath="metadata.funding"
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
    </Overridable>
  );
};

const ISBNComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.isbn"
      idString="ImprintISBNField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const JournalTitleComponent = ({ customFieldsUI, labelMods }) => {
  const moddedLabel =
    labelMods && labelMods["custom_fields.journal:journal.title"]
      ? labelMods["custom_fields.journal:journal.title"]
      : "Journal title";
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.title"
      idString="JournalTitleField"
      label={moddedLabel}
      icon="book"
      description=""
      customFieldsUI={customFieldsUI}
    />
  );
};

const JournalISSNComponent = ({ customFieldsUI, labelMods }) => {
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.issn"
      idString="JournalISSNField"
      label="ISSN"
      icon="barcode"
      description=""
      customFieldsUI={customFieldsUI}
    />
  );
};

const LanguagesComponent = ({ record }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.LanguagesField.container"
      fieldPath="metadata.languages"
      record={record}
    >
      <LanguagesField
        fieldPath="metadata.languages"
        initialOptions={_get(record, "ui.languages", []).filter(
          (lang) => lang !== null
        )} // needed because dumped empty record from backend gives [null]
        serializeSuggestions={(suggestions) =>
          suggestions.map((item) => ({
            text: item.title_l10n,
            value: item.id,
            key: item.id,
          }))
        }
      />
    </Overridable>
  );
};

const LicensesComponent = () => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.LicenseField.container"
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
    </Overridable>
  );
};

const MetadataOnlyComponent = () => {
  return <></>;
};

const MeetingTitleComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference / Workshop"
      fieldName="meeting:meeting.title"
      idString="MeetingTitleField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const MeetingPlaceComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference / Workshop"
      fieldName="meeting:meeting.place"
      idString="MeetingPlaceField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const MeetingDatesComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Conference / Workshop"
      fieldName="meeting:meeting.dates"
      idString="MeetingDatesField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const SectionPagesComponent = ({ customFieldsUI, labelMods }) => {
  const moddedLabel =
    labelMods && labelMods["custom_fields.journal:journal.pages"]
      ? labelMods["custom_fields.journal:journal.pages"]
      : "Section pages";
  return (
    <CustomFieldInjector
      sectionName="Journal"
      fieldName="journal:journal.pages"
      idString="JournalPagesField"
      customFieldsUI={customFieldsUI}
      description={""}
      label={moddedLabel}
      icon="file outline"
    />
  );
};

const PublisherComponent = ({}) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.PublisherField.container"
      fieldPath="metadata.publisher"
    >
      <PublisherField
        fieldPath="metadata.publisher"
        description=""
        helpText=""
        required={true}
      />
    </Overridable>
  );
};

const PublicationLocationComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.place"
      idString="ImprintPlaceField"
      customFieldsUI={customFieldsUI}
      label={"Place of Publication"}
      icon={"map marker alternate"}
      description={""}
    />
  );
};

const ReferencesComponent = ({ vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.AccordionFieldReferences.container"
      vocabularies={vocabularies}
    >
      <AccordionField
        includesPaths={["metadata.references"]}
        active
        label={i18next.t("References")}
      >
        <Overridable
          id="InvenioAppRdm.Deposit.ReferencesField.container"
          fieldPath="metadata.references"
          vocabularies={vocabularies}
        >
          <ReferencesField fieldPath="metadata.references" showEmptyValue />
        </Overridable>
      </AccordionField>
    </Overridable>
  );
};

const RelatedWorksComponent = ({ vocabularies }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.RelatedWorksField.container"
      fieldPath="metadata.related_identifiers"
      vocabularies={vocabularies}
    >
      <RelatedWorksField
        fieldPath="metadata.related_identifiers"
        options={vocabularies.metadata.identifiers}
        showEmptyValue={false}
      />
    </Overridable>
  );
};

const ResourceTypeComponent = ({ vocabularies }) => {
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
  return (
    <ResourceTypeSelectorField
      options={vocabularies.metadata.resource_type}
      fieldPath="metadata.resource_type"
      required
    />
  );
};

const SubjectsComponent = ({ record, vocabularies }) => {
  let myLimitToOptions = [...vocabularies.metadata.subjects.limit_to];
  myLimitToOptions.reverse();
  myLimitToOptions = moveToArrayStart(
    myLimitToOptions,
    ["FOS", "FAST-topical", "all"],
    "value"
  );
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.SubjectsField.container"
      vocabularies={vocabularies}
      fieldPath="metadata.subjects"
      record={record}
    >
      <SubjectsField
        fieldPath="metadata.subjects"
        label="Subjects"
        initialOptions={_get(record, "ui.subjects", null)}
        limitToOptions={myLimitToOptions}
        placeholder={i18next.t(
          "Search for a subject by name (press 'enter' to select)"
        )}
        description={i18next.t(
          "These standardized subject headings help people to find your materials!"
        )}
      />
    </Overridable>
  );
};

const SubmissionComponent = ({ record, permissions }) => {
  const { values, setFieldValue } = useFormikContext();
  const { handleFormPageChange } = useContext(FormValuesContext);
  const [confirmedNoFiles, setConfirmedNoFiles] = useState(undefined);
  const store = useStore();

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

  const handleConfirmNoFiles = async () => {
    if (!hasFiles) {
      setConfirmedNoFiles(true);
      await setFieldValue("files.enabled", false);
    }
  };

  const handleConfirmNeedsFiles = () => {
    setConfirmedNoFiles(false);
    handleFormPageChange(null, { value: "5" });
  };

  const sanitizeDataForSaving = async () => {
    // FIXME: This is a cludge to handle the automatic assignment of
    // the "url" scheme to the default empty URL identifier field
    await filterEmptyIdentifiers();
    if (hasFiles && !filesEnabled) {
      await setFieldValue("files.enabled", true);
    }
  };

  return (
    <Overridable id="InvenioAppRdm.Deposit.CardDepositStatusBox.container">
      <Grid relaxed className="save-submit-buttons">
        <Grid.Row>
          <Grid.Column computer="8" tablet="6">
            <SubmitButtonModal
              fluid
              actionName="saveDraft"
              aria-describedby="save-button-description"
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              sanitizeDataForSaving={sanitizeDataForSaving}
              missingFiles={missingFiles}
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
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column computer={8} tablet={6}>
            <SubmitButtonModal
              fluid
              actionName="preview"
              aria-describedby="preview-button-description"
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              sanitizeDataForSaving={sanitizeDataForSaving}
              missingFiles={missingFiles}
            />
          </Grid.Column>
          <Grid.Column
            tablet="10"
            computer="8"
            id="preview-button-description"
            className="helptext"
          ></Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column computer={8} tablet={6} className="">
            <SubmitButtonModal
              fluid
              actionName="publish"
              handleConfirmNeedsFiles={handleConfirmNeedsFiles}
              handleConfirmNoFiles={handleConfirmNoFiles}
              sanitizeDataForSaving={sanitizeDataForSaving}
              missingFiles={missingFiles}
              aria-describedby="publish-button-description"
              size="massive"
              id="deposit-form-publish-button"
              positive
            />
          </Grid.Column>
          <Grid.Column
            tablet="10"
            computer="8"
            id="publish-button-description"
            className="helptext"
          >
            <p>
              <b>Published deposits</b> can still be edited, but you will no
              longer be able to{" "}
              {permissions?.can_delete_draft && "delete the deposit or "}change
              the attached files. To add or change files for a published deposit
              you must create a new version of the record.
            </p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column computer={8} tablet={6}>
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
            id="delete-button-description"
            className="helptext"
          >
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

const SubmitterEmailComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:submitter_email"
      idString="SubmitterEmailField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};

const SubmitterUsernameComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="Commons admin info"
      fieldName="kcr:submitter_username"
      idString="SubmitterUsernameField"
      customFieldsUI={customFieldsUI}
      description={""}
    />
  );
};
const SubtitleComponent = () => {
  return <></>;
};

const TitleComponent = ({ vocabularies, record, labelMods }) => {
  const required = true;
  const moddedLabel =
    labelMods && labelMods["metadata.title"]
      ? labelMods["metadata.title"]
      : "Title";
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.TitlesField.container"
      vocabularies={vocabularies}
      fieldPath="metadata.title"
      record={record}
    >
      <TitlesField
        options={vocabularies.metadata.titles}
        fieldPath="metadata.title"
        recordUI={record.ui}
        label={moddedLabel}
        required={required}
      />
    </Overridable>
  );
};

const TotalPagesComponent = ({ customFieldsUI, labelMods }) => {
  const moddedLabel =
    labelMods && labelMods["custom_fields.imprint:imprint.pages"]
      ? labelMods["custom_fields.imprint:imprint.pages"]
      : "Total book pages";
  return (
    <CustomFieldInjector
      sectionName="Book / Report / Chapter"
      fieldName="imprint:imprint.pages"
      idString="ImprintPagesField"
      customFieldsUI={customFieldsUI}
      description={""}
      label={moddedLabel}
      icon="file outline"
    />
  );
};

const UniversityComponent = ({ customFieldsUI }) => {
  return (
    <CustomFieldInjector
      sectionName="KCR Book information"
      fieldName="thesis:university"
      idString="ThesisUniversity"
      customFieldsUI={customFieldsUI}
    />
  );
};

const VersionComponent = ({ description, label, icon }) => {
  return (
    <Overridable
      id="InvenioAppRdm.Deposit.VersionField.container"
      fieldPath="metadata.version"
    >
      <VersionField
        fieldPath="metadata.version"
        description={description}
        label={label}
        labelIcon={icon}
        helpText=""
      />
    </Overridable>
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
  SectionPagesComponent,
  JournalTitleComponent,
  JournalISSNComponent,
  LanguagesComponent,
  LicensesComponent,
  MetadataOnlyComponent,
  MeetingDatesComponent,
  MeetingPlaceComponent,
  MeetingTitleComponent,
  PublisherComponent,
  PublicationLocationComponent,
  ReferencesComponent,
  RelatedWorksComponent,
  ResourceTypeComponent,
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
