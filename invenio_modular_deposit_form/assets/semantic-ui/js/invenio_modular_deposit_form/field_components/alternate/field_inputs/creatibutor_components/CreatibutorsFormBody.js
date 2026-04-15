// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Replacement-modal-style form content adapted for inline (non-modal) use
// with prefixed Formik field paths and override-style identifier rows.
//
// Person family-name `RemoteSelectField`: `hideAdditionMenuItem` + `commitSearchOnBlur` so
// semantic-ui-react does not show the synthetic “Add …” menu row (no SUIR knob for that alone);
// typed family name still commits on blur. `focusFieldPathAfterSelect` when given name shows.
// See `replacement_components/RemoteSelectField.js` and `docs/source/replacement_field_components.md`.

import React, { createRef } from "react";
import PropTypes from "prop-types";
import { useStore } from "react-redux";
import { Form } from "semantic-ui-react";
import _get from "lodash/get";
import Overridable from "react-overridable";
import { RadioField } from "react-invenio-forms";
import { RemoteSelectField } from "../../../../replacement_components/input_controls/RemoteSelectField";
import { TextField } from "../../../../replacement_components/input_controls/TextField";
import { SelectField } from "../../../../replacement_components/input_controls/SelectField";
import { AffiliationsField } from "@js/invenio_rdm_records/src/deposit/fields/AffiliationsField/AffiliationsField";
import { CREATIBUTOR_TYPE } from "@js/invenio_rdm_records/src/deposit/fields/CreatibutorsField/type";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { CreatibutorsIdentifiers } from "./CreatibutorsIdentifiers";
import { NamesAutocompleteOptions } from "./CreatibutorsInlineForm";

const CreatibutorsFormBody = ({
  affiliationsRef,
  autocompleteNames,
  familyNameWidgetRef,
  fieldPathPrefix,
  isCreator,
  isNewItem,
  isOrganization,
  onPersonSearchChange,
  onOrganizationSearchChange,
  onPersonOrgToggle,
  roleOptions,
  serializeSuggestions,
  personDetailsExpanded,
  values,
}) => {
  const personOrOrgPath = `${fieldPathPrefix}.person_or_org`;
  const typeFieldPath = `${personOrOrgPath}.type`;
  const familyNameFieldPath = `${personOrOrgPath}.family_name`;
  const givenNameFieldPath = `${personOrOrgPath}.given_name`;
  const organizationNameFieldPath = `${personOrOrgPath}.name`;
  const identifiersFieldPath = `${personOrOrgPath}.identifiers`;
  const affiliationsFieldPath = `${fieldPathPrefix}.affiliations`;
  const roleFieldPath = `${fieldPathPrefix}.role`;

  const store = useStore();
  // RDMDepositForm nests merged vocabs under vocabularies.metadata.* (same as stock payload shape).
  const personorg_schemes =
    store.getState().deposit.config.vocabularies?.metadata?.creators?.identifiers?.scheme ?? [];
  const personorg_scheme_labels = personorg_schemes.map((s) => s.title_l10n);

  const namesAutocompleteOn = autocompleteNames !== NamesAutocompleteOptions.OFF;
  const namesSearchOnly = autocompleteNames === NamesAutocompleteOptions.SEARCH_ONLY;

  const inputRef = createRef();

  return (
    <>
      <Form.Group>
        <RadioField
          fieldPath={typeFieldPath}
          label={i18next.t("Person")}
          checked={_get(values, typeFieldPath) === CREATIBUTOR_TYPE.PERSON}
          value={CREATIBUTOR_TYPE.PERSON}
          onChange={({ formikProps }) => {
            formikProps.form.setFieldValue(typeFieldPath, CREATIBUTOR_TYPE.PERSON);
            onPersonOrgToggle(CREATIBUTOR_TYPE.PERSON);
          }}
          optimized
        />
        <RadioField
          fieldPath={typeFieldPath}
          label={i18next.t("Organization")}
          checked={_get(values, typeFieldPath) === CREATIBUTOR_TYPE.ORGANIZATION}
          value={CREATIBUTOR_TYPE.ORGANIZATION}
          onChange={({ formikProps }) => {
            formikProps.form.setFieldValue(typeFieldPath, CREATIBUTOR_TYPE.ORGANIZATION);
            onPersonOrgToggle(CREATIBUTOR_TYPE.ORGANIZATION);
          }}
          optimized
        />
      </Form.Group>

      {_get(values, typeFieldPath, "") === CREATIBUTOR_TYPE.PERSON ? (
        <>
          {namesAutocompleteOn && (
            <Overridable
              id="InvenioRDMRecords.CreatibutorsFlat.PersonFamilyNameRemoteSelectField.container"
              serializeSuggestions={serializeSuggestions}
              onValueChange={onPersonSearchChange}
              familyNameFieldPath={familyNameFieldPath}
              ref={familyNameWidgetRef}
            >
              <Form.Group widths="equal">
                <RemoteSelectField
                  selectOnBlur={false}
                  selectOnNavigation={false}
                  fieldPath={familyNameFieldPath}
                  label={i18next.t("Family name")}
                  clearable
                  multiple={false}
                  hideAdditionMenuItem
                  commitSearchOnBlur
                  focusFieldPathAfterSelect={
                    !namesSearchOnly || personDetailsExpanded ? givenNameFieldPath : undefined
                  }
                  placeholder={i18next.t("Family name")}
                  noQueryMessage={i18next.t("Family name")}
                  required={!!isCreator}
                  isFocused={isNewItem}
                  search={(options) => options}
                  suggestionAPIUrl="/api/names"
                  serializeSuggestions={serializeSuggestions}
                  onValueChange={onPersonSearchChange}
                  ref={familyNameWidgetRef}
                />
                {(!namesSearchOnly || personDetailsExpanded) && (
                  <TextField
                    label={i18next.t("Given names")}
                    placeholder={i18next.t("Given names")}
                    fieldPath={givenNameFieldPath}
                  />
                )}
              </Form.Group>
            </Overridable>
          )}

          {!namesAutocompleteOn && personDetailsExpanded && (
            <Overridable
              id="InvenioRDMRecords.CreatibutorsFlat.FullNameField.container"
              familyNameFieldPath={familyNameFieldPath}
              givenNameFieldPath={givenNameFieldPath}
              isCreator={isCreator}
            >
              <Form.Group widths="equal">
                <TextField
                  label={i18next.t("Family name")}
                  placeholder={i18next.t("Family name")}
                  fieldPath={familyNameFieldPath}
                  required={isCreator}
                />
                <TextField
                  label={i18next.t("Given names")}
                  placeholder={i18next.t("Given names")}
                  fieldPath={givenNameFieldPath}
                />
              </Form.Group>
            </Overridable>
          )}

          {personDetailsExpanded && (
            <>
              <Overridable
                id="InvenioRDMRecords.CreatibutorsFlat.PersonIdentifiersField.container"
                fieldPath={identifiersFieldPath}
                values={values}
              >
                <CreatibutorsIdentifiers
                  fieldPath={identifiersFieldPath}
                  label={`${i18next.t("Personal identifiers")} (${personorg_scheme_labels.join(", ")})`}
                  idTypes={personorg_schemes}
                />
              </Overridable>
              <Overridable
                id="InvenioRDMRecords.CreatibutorsFlat.PersonAffiliationsField.container"
                ref={affiliationsRef}
                fieldPath={affiliationsFieldPath}
              >
                <AffiliationsField fieldPath={affiliationsFieldPath} selectRef={affiliationsRef} />
              </Overridable>
            </>
          )}
        </>
      ) : (
        <>
          {autocompleteNames !== NamesAutocompleteOptions.OFF && (
            <Overridable
              id="InvenioRDMRecords.CreatibutorsFlat.OrganizationRemoteSelectField.container"
              serializeSuggestions={serializeSuggestions}
              onValueChange={onOrganizationSearchChange}
            >
              <RemoteSelectField
                selectOnBlur={false}
                selectOnNavigation={false}
                fieldPath={`${fieldPathPrefix}.__orgSearch`}
                clearable
                multiple={false}
                allowAdditions={false}
                placeholder={i18next.t(
                  "Search for an organization by name, identifier, or affiliation..."
                )}
                noQueryMessage={i18next.t(
                  "Search for organization by name, identifier, or affiliation..."
                )}
                required={false}
                isFocused={isNewItem}
                search={(options) => options}
                suggestionAPIUrl="/api/affiliations"
                serializeSuggestions={serializeSuggestions}
                onValueChange={onOrganizationSearchChange}
              />
            </Overridable>
          )}
          <Overridable
            id="InvenioRDMRecords.CreatibutorsFlat.OrganizationNameField.container"
            fieldPath={organizationNameFieldPath}
            ref={inputRef}
            isCreator={isCreator}
          >
            <TextField
              label={i18next.t("Name")}
              placeholder={i18next.t("Organization name")}
              fieldPath={organizationNameFieldPath}
              required={isCreator}
              input={{ ref: inputRef }}
            />
          </Overridable>
          <Overridable
            id="InvenioRDMRecords.CreatibutorsFlat.OrganizationIdentifiersField.container"
            fieldPath={identifiersFieldPath}
            values={values}
          >
            <CreatibutorsIdentifiers
              fieldPath={identifiersFieldPath}
              label={`${i18next.t("Organization identifiers")} (${personorg_scheme_labels.join(", ")})`}
              idTypes={personorg_schemes}
            />
          </Overridable>
          <Overridable
            id="InvenioRDMRecords.CreatibutorsFlat.OrganizationAffiliationsField.container"
            ref={affiliationsRef}
            fieldPath={affiliationsFieldPath}
          >
            <AffiliationsField fieldPath={affiliationsFieldPath} selectRef={affiliationsRef} />
          </Overridable>
        </>
      )}

      {(_get(values, typeFieldPath) === CREATIBUTOR_TYPE.ORGANIZATION ||
        (personDetailsExpanded && _get(values, typeFieldPath) === CREATIBUTOR_TYPE.PERSON)) && (
        <Overridable
          id="InvenioRDMRecords.CreatibutorsFlat.RoleSelectField.container"
          fieldPath={roleFieldPath}
          roleOptions={roleOptions}
          isCreator={isCreator}
        >
          <SelectField
            fieldPath={roleFieldPath}
            label={i18next.t("Role")}
            options={roleOptions}
            placeholder={i18next.t("Select role")}
            {...(isCreator && { clearable: true })}
            required={!isCreator}
            optimized
            scrolling
            search
          />
        </Overridable>
      )}
    </>
  );
};

CreatibutorsFormBody.propTypes = {
  affiliationsRef: PropTypes.object,
  autocompleteNames: PropTypes.oneOf(["search", "search_only", "off"]),
  familyNameWidgetRef: PropTypes.object,
  fieldPathPrefix: PropTypes.string.isRequired,
  isCreator: PropTypes.bool,
  isNewItem: PropTypes.bool,
  isOrganization: PropTypes.bool,
  onPersonSearchChange: PropTypes.func.isRequired,
  onOrganizationSearchChange: PropTypes.func.isRequired,
  onPersonOrgToggle: PropTypes.func.isRequired,
  roleOptions: PropTypes.array.isRequired,
  serializeSuggestions: PropTypes.func,
  personDetailsExpanded: PropTypes.bool,
  values: PropTypes.object.isRequired,
};

export { CreatibutorsFormBody };
