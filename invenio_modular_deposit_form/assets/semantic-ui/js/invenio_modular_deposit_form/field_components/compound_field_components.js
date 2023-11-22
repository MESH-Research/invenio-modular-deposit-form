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

import React, { Component, createContext, createRef, forwardRef, Fragment,
                useContext,
                useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { AccordionField, CustomFields, FieldLabel, loadWidgetsFromConfig } from "react-invenio-forms";
import {
  AccessRightField,
  DescriptionsField,
  CreatibutorsField,
  DeleteButton,
  DepositFormApp,
  DepositStatusBox,
  FileUploader,
  FormFeedback,
  IdentifiersField,
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
  CommunityHeader,
} from "@js/invenio_rdm_records";
import { FundingField } from "@js/invenio_vocabularies";
import {
  Card,
  Form,
  Grid,
  Segment,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { SubmitButtonModal } from "../replacement_components/PublishButton/SubmitButton";
import ResourceTypeSelectorField from "../replacement_components/ResourceTypeSelectorField";
import { PIDField } from "../replacement_components/PIDField";
import { DatesField } from "../replacement_components/DatesField";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { CustomFieldInjector,
         CustomFieldSectionInjector,
         AbstractComponent,
         AdditionalDatesComponent,
         AdditionalDescriptionComponent,
         AdditionalTitlesComponent,
         AIComponent,
         AlternateIdentifiersComponent,
         BookTitleComponent,
         CommunitiesComponent,
         ContentWarningComponent,
         ContributorsComponent,
         CreatorsComponent,
         DateComponent,
         DoiComponent,
         FilesUploadComponent,
         FundingComponent,
         JournalTitleComponent,
         JournalISSNComponent,
         KeywordsComponent,
         LanguagesComponent,
         LicensesComponent,
         MetadataOnlyComponent,
         PreviouslyPublishedComponent,
         PublisherDoiComponent,
         PublisherComponent,
         PublicationLocationComponent,
         ReferencesComponent,
         RelatedWorksComponent,
         ResourceTypeComponent,
         SubjectsComponent,
         SubtitleComponent,
         TitleComponent,
         TotalPagesComponent,
         SeriesComponent,
         VolumeComponent,
         VersionComponent,
         SponsoringInstitutionComponent,
         EditionComponent,
         ChapterLabelComponent,
         PagesComponent,
         UniversityComponent,
          } from "./field_components";
import { useFormikContext } from "formik";
import { FormValuesContext } from "../RDMDepositForm";


const AdminMetadataComponent = ({customFieldsUI}) => {
  return(
    <Segment as="fieldset">
        <CustomFieldInjector
          sectionName="Commons admin info"
          idString="AdminMetadataFields"
          customFieldsUI={customFieldsUI}
        />
    </Segment>
)}

const PublicationDetailsComponent = ({customFieldsUI}) => {
  return(
    <Segment as="fieldset">
        {/* <FieldLabel htmlFor={"imprint:imprint"}
          icon={"book"}
          label={"Publication Details"}
        /> */}
        {/* <Divider fitted /> */}
        <Form.Group widths="equal">
            <CustomFieldInjector
              sectionName="Book / Report / Chapter"
              fieldName="imprint:imprint.isbn"
              idString="ImprintISBNField"
              description="e.g. 0-06-251587-X"
              placeholder=""
              customFieldsUI={customFieldsUI}
            />
            <EditionComponent customFieldsUI={customFieldsUI}
              label="Edition or Version"
              icon="copy outline"
            />
            {/* <VersionComponent description="" */}
            {/* /> */}
        </Form.Group>
        <Form.Group widths="equal">
            <PublisherComponent />
            <PublicationLocationComponent customFieldsUI={customFieldsUI} />
        </Form.Group>
    </Segment>
  )
}

const BookDetailComponent = ({customFieldsUI}) => {
  return(
    <Segment as="fieldset">
      {/* <FieldLabel htmlFor={"imprint:imprint"}
        icon={"book"}
        label={"Book details"}
      />
      <Divider fitted /> */}
      <Form.Group>
          <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.title"
          idString="ImprintTitleField"
          description=""
          customFieldsUI={customFieldsUI}
          />
          <VersionComponent description=""
          label="Book title"
          icon=""
          />
      </Form.Group>
      <Form.Group>
          <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.isbn"
          idString="ImprintISBNField"
          description=""
          customFieldsUI={customFieldsUI}
          />
          <VersionComponent description=""
          label="Edition or Version"
          icon=""
          />
      </Form.Group>
      <Form.Group>
            <PublisherComponent />
            <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
      <Form.Group>
          <VolumeComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
      <Form.Group>
            <CustomFieldInjector
              sectionName="Book / Report / Chapter"
              fieldName="imprint:imprint.pages"
              idString="ImprintPagesField"
              customFieldsUI={customFieldsUI}
              description={""}
              label="Number of Pages"
              icon="file outline"
            />
      </Form.Group>
      <Form.Group>
          <CustomFieldInjector
          sectionName="Series"
          fieldName="kcr:book_series"
          idString="KcrBookSeries"
          customFieldsUI={customFieldsUI}
          />
      </Form.Group>
    </Segment>
)}

const BookSectionDetailComponent = ({customFieldsUI}) => {
  return(
    <Segment as="fieldset">
      {/* <FieldLabel htmlFor={"imprint:imprint"}
        icon={"book"}
        label={"Book details"}
      />
      <Divider fitted /> */}
      <Form.Group widths="equal">
          <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.title"
          idString="ImprintTitleField"
          description=""
          label="Book title"
          icon="book"
          customFieldsUI={customFieldsUI}
          />
      </Form.Group>
      <Form.Group widths="equal">
          <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.isbn"
          idString="ImprintISBNField"
          description=""
          customFieldsUI={customFieldsUI}
          />
          <VersionComponent description=""
          label="Edition or Version"
          icon=""
          />
      </Form.Group>
      <Form.Group widths="equal">
            <PublisherComponent />
            <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
    </Segment>
)}
const BookVolumePagesComponent = ({customFieldsUI}) => {
    return(
      <Segment as="fieldset">
        <Form.Group widths="equal">
          <VolumeComponent customFieldsUI={customFieldsUI} />
          <CustomFieldInjector
          sectionName="Book / Report / Chapter"
          fieldName="imprint:imprint.pages"
          idString="ImprintPagesField"
          customFieldsUI={customFieldsUI}
          description={""}
          label="Total pages"
          icon="file outline"
          />
        </Form.Group>
      </Segment>
    )
}

const BookSectionVolumePagesComponent = ({customFieldsUI, labelMods}) => {
    return(
      <Segment as="fieldset">
        <Form.Group widths="equal">
          <PagesComponent
            customFieldsUI={customFieldsUI}
            labelMods={labelMods}
          />
          <TotalPagesComponent
            customFieldsUI={customFieldsUI}
            description={""}
            labelMods={labelMods}
          />
          <ChapterLabelComponent
            customFieldsUI={customFieldsUI}
            labelMods={labelMods}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <VolumeComponent customFieldsUI={customFieldsUI} />
        </Form.Group>
      </Segment>
    )
}

const CombinedTitlesComponent = ({vocabularies, record, labelMods}) => {
  return(
    <Segment
      id={'InvenioAppRdm.Deposit.CombinedTitlesComponent.container'}
      as="fieldset"
    >
      <TitleComponent vocabularies={vocabularies} record={record} labelMods={labelMods} />
    </Segment>
  )
}

const EditionSectionComponent = ({customFieldsUI, labelMods}) => {
  return(
    <Segment as="fieldset">
      <EditionComponent
        customFieldsUI={customFieldsUI}
        labelMods={labelMods}
      />
      <ChapterLabelComponent
        customFieldsUI={customFieldsUI}
        labelMods={labelMods}
      />
    </Segment>
  )
}

const JournalDetailComponent = ({customFieldsUI, labelMods}) => {
  return(
    <Segment as="fieldset">
      {/* <FieldLabel htmlFor={"imprint:imprint"}
        icon={"book"}
        label={"Book details"}
      /> */}
      <Form.Group widths="equal">
        <JournalTitleComponent
          customFieldsUI={customFieldsUI}
          labelMods={labelMods}
        />
        <JournalISSNComponent
          customFieldsUI={customFieldsUI}
        />
      </Form.Group>
      <Form.Group widths="equal">
          <CustomFieldInjector
          sectionName="Journal"
          fieldName="journal:journal.volume"
          idString="JournalVolumeField"
          label="Volume"
          description=""
          icon="zip"
          customFieldsUI={customFieldsUI}
          />
          <CustomFieldInjector
          sectionName="Journal"
          fieldName="journal:journal.issue"
          idString="JournalIssueField"
          label="Issue"
          description=""
          customFieldsUI={customFieldsUI}
          />
          <CustomFieldInjector
            sectionName="Journal"
            fieldName="journal:journal.pages"
            idString="JournalPagesField"
            customFieldsUI={customFieldsUI}
            description={""}
            label="Pages"
            icon="file outline"
          />
      </Form.Group>
      <Form.Group widths="equal">
            <PublisherComponent />
            <PublicationLocationComponent customFieldsUI={customFieldsUI} />
      </Form.Group>
    </Segment>
)}
const OrganizationDetailsComponent = ({customFieldsUI}) => {
  return(
    <Segment as="fieldset" className="organization-details-fields">
      <SponsoringInstitutionComponent customFieldsUI={customFieldsUI} />
      <PublicationLocationComponent customFieldsUI={customFieldsUI} />
    </Segment>
  )
}

const SubjectKeywordsComponent = ({ record, vocabularies, customFieldsUI }) => {
  return(
    <Segment as="fieldset" className="subject-keywords-fields">
      <SubjectsComponent record={record} vocabularies={vocabularies} />
      <KeywordsComponent customFieldsUI={customFieldsUI} />
    </Segment>
  )
}

const SubmissionComponent = ({record, permissions}) => {
  const { values, setFieldValue } = useFormikContext();
  const { handleFormPageChange } = useContext(FormValuesContext);
  const [ confirmedNoFiles, setConfirmedNoFiles ] = useState(undefined);
  const store = useStore();

  const hasFiles = Object.keys(store.getState().files.entries).length > 0;
  const filesEnabled = !!(values.files.enabled);
  const missingFiles = ( filesEnabled && !hasFiles );

  const filterEmptyIdentifiers = async () => {
    if ( values.metadata.identifiers.length ) {
      let filteredIdentifiers = values.metadata.identifiers.reduce((newList, item) => {
        if (item.identifier!=="" && item.scheme!=="") newList.push(item);
        return newList;
      }, []);
      setFieldValue("metadata.identifiers", filteredIdentifiers);
    }
    return(values.metadata.identifiers);
  }

  const handleConfirmNoFiles = async () => {
    if (!hasFiles) {
      setConfirmedNoFiles(true);
      await setFieldValue("files.enabled", false);
    }
  }

  const handleConfirmNeedsFiles = () => {
    setConfirmedNoFiles(false);
    handleFormPageChange(null, {value: '5'});
  }

  const sanitizeDataForSaving = async () => {
    // FIXME: This is a cludge to handle the automatic assignment of
    // the "url" scheme to the default empty URL identifier field
    await filterEmptyIdentifiers();
    if ( hasFiles && !filesEnabled ) {
      await setFieldValue("files.enabled", true);
    }
  }

  return(
    <Overridable id="InvenioAppRdm.Deposit.CardDepositStatusBox.container">
        <Grid relaxed className="save-submit-buttons">

          <Grid.Row>
            <Grid.Column
              computer="8" tablet="6"
            >
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
            <Grid.Column tablet="10" computer="8" id="save-button-description" className="helptext">
              <p><b>Draft deposits</b> can be edited{permissions?.can_delete_draft && ", deleted,"} and the files can be added or changed.</p>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column
              computer={8}
              tablet={6}
            >
              <SubmitButtonModal fluid
                actionName="preview"
                aria-describedby="preview-button-description"
                handleConfirmNeedsFiles={handleConfirmNeedsFiles}
                handleConfirmNoFiles={handleConfirmNoFiles}
                sanitizeDataForSaving={sanitizeDataForSaving}
                missingFiles={missingFiles}
              />
            </Grid.Column>
            <Grid.Column tablet="10" computer="8" id="preview-button-description" className="helptext">

            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column computer={8} tablet={6} className="">
              <SubmitButtonModal fluid
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
            <Grid.Column tablet="10" computer="8" id="publish-button-description" className="helptext">
                <p><b>Published deposits</b> can still be edited, but you will no longer be able to {permissions?.can_delete_draft && "delete the deposit or "}change the attached files. To add or change files for a published deposit you must create a new version of the record.</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column computer={8} tablet={6}>
              <DeleteComponent permissions={permissions} record={record}
                aria-describedby="delete-button-description"
                icon="trash alternate outline"
              />
            </Grid.Column>
            <Grid.Column tablet="10" computer="8" id="delete-button-description" className="helptext">
              <p>Deposits can only be <b>deleted while they are drafts</b>. Once you
                 publish your deposit, you can only restrict access and/or
                 create a new version.
              </p>
            </Grid.Column>
          </Grid.Row>
          </Grid>
    </Overridable>
  )
}

const ThesisDetailsComponent = ({customFieldsUI, labelMods}) => {
  return(
    <Segment as="fieldset">
      <UniversityComponent
        customFieldsUI={customFieldsUI}
        labelMods={labelMods}
      />
    </Segment>
  )
}

const TypeTitleComponent = ({vocabularies, record, labelMods}) => {
  return(
    <Segment
      id={'InvenioAppRdm.Deposit.TypeTitleComponent.container'}
      as="fieldset"
    >
      <TitleComponent vocabularies={vocabularies} record={record} labelMods={labelMods} />
      <ResourceTypeComponent vocabularies={vocabularies} labelMods={labelMods} />
    </Segment>
  )
};

const AccessRightsComponent = ({ permissions }) => {
  return(
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
  )
}

const CombinedDatesComponent = ({ vocabularies }) => {
  return(
    <Segment
      id={'InvenioAppRdm.Deposit.CombinedDatesComponent.container'}
      as="fieldset"
      className="combined-dates-field"
    >
      <DateComponent />
      <AdditionalDatesComponent vocabularies={vocabularies} />
    </Segment>
  )
}

const DeleteComponent = ({ permissions, record, icon }) => {
  return(
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
  )
}

const SubmitActionsComponent = ({permissions, record}) => {
  return(
    <Grid className="submit-actions">
      <Grid.Row>
        <Grid.Column width="16">
          <AccessRightsComponent permissions={permissions} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className="submit-buttons-row">
          <SubmissionComponent record={record} permissions={permissions} />
      </Grid.Row>
    </Grid>
  )
}

export {AccessRightsComponent,
        AdminMetadataComponent,
        BookDetailComponent,
        BookVolumePagesComponent,
        BookSectionVolumePagesComponent,
        BookSectionDetailComponent,
        CombinedDatesComponent,
        CombinedTitlesComponent,
        DeleteComponent,
        EditionSectionComponent,
        JournalDetailComponent,
        OrganizationDetailsComponent,
        PublicationDetailsComponent,
        SubjectKeywordsComponent,
        SubmissionComponent,
        SubmitActionsComponent,
        ThesisDetailsComponent,
        TypeTitleComponent,
};