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

import React, { createRef, useMemo, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useStore } from "react-redux";
import { Button, Form, Icon, Label } from "semantic-ui-react";
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

// Posts the typed family/given to the modular-deposit-form API so the
// authenticated user's `name_parts_local` profile override is persisted.
// CSRF: reads the `csrftoken` cookie and sends it as `X-CSRFToken`, which
// satisfies invenio-rest's global CSRF middleware.
const userNameApiClient = axios.create({
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: { "Content-Type": "application/json" },
});

const CreatibutorsFormBody = ({
  affiliationsRef,
  autocompleteNames,
  currentUserId,
  familyNameWidgetRef,
  fieldPathPrefix,
  isCreator,
  isNewItem,
  isOrganization,
  isSelfRow = false,
  onOrganizationSearchChange,
  onPersonOrgToggle,
  onPersonSearchChange,
  onSelfNameSaved,
  personDetailsExpanded,
  roleOptions,
  savedSelfNameSplit,
  selfNameWasGuessed = false,
  serializeSuggestions,
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

  const isPerson = _get(values, typeFieldPath) === CREATIBUTOR_TYPE.PERSON;
  const currentFamily = String(_get(values, familyNameFieldPath, "") || "").trim();
  const currentGiven = String(_get(values, givenNameFieldPath, "") || "").trim();
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  // Show "Remember change" when this is the self row + a Person with a non-empty
  // family name, *and* the typed split either differs from the stored override
  // or no firm override exists yet (initial split was a guess).
  const showRememberButton = useMemo(() => {
    if (!isSelfRow || !isPerson || !currentUserId) return false;
    if (!currentFamily) return false;
    if (savedSelfNameSplit) {
      return (
        savedSelfNameSplit.family !== currentFamily ||
        (savedSelfNameSplit.given || "") !== currentGiven
      );
    }
    return selfNameWasGuessed;
  }, [
    isSelfRow,
    isPerson,
    currentUserId,
    currentFamily,
    currentGiven,
    savedSelfNameSplit,
    selfNameWasGuessed,
  ]);

  const handleRememberClick = async () => {
    if (!currentUserId || !currentFamily) return;
    setSaveStatus("saving");
    setSaveError("");
    try {
      await userNameApiClient.post(
        `/api/modular-deposit-form/users/${currentUserId}/name`,
        { family_name: currentFamily, given_name: currentGiven }
      );
      setSaveStatus("saved");
      onSelfNameSaved?.({ family: currentFamily, given: currentGiven });
      window.setTimeout(() => {
        setSaveStatus((s) => (s === "saved" ? "idle" : s));
      }, 3000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        i18next.t("Could not save your name. Please try again.");
      setSaveError(msg);
      setSaveStatus("error");
    }
  };

  const rememberChangeRow = showRememberButton ? (
    <Form.Group className="rel-mb-1">
      <Form.Field>
        <Button
          type="button"
          size="small"
          basic
          primary
          icon
          labelPosition="left"
          loading={saveStatus === "saving"}
          disabled={saveStatus === "saving"}
          onClick={handleRememberClick}
          aria-label={i18next.t(
            "Remember this name split on your profile for future deposits"
          )}
        >
          <Icon name="save" />
          {i18next.t("Remember this name on my profile")}
        </Button>
        {saveStatus === "saved" && (
          <Label basic color="green" pointing="left" className="rel-ml-1">
            <Icon name="check" />
            {i18next.t("Saved")}
          </Label>
        )}
        {saveStatus === "error" && (
          <Label basic color="red" pointing="left" className="rel-ml-1">
            <Icon name="warning sign" />
            {saveError}
          </Label>
        )}
      </Form.Field>
    </Form.Group>
  ) : null;

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
              {rememberChangeRow}
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
              {rememberChangeRow}
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
        (personDetailsExpanded && _get(values, typeFieldPath) === CREATIBUTOR_TYPE.PERSON)) &&
        Array.isArray(roleOptions) &&
        roleOptions.length > 0 && (
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
  currentUserId: PropTypes.string,
  familyNameWidgetRef: PropTypes.object,
  fieldPathPrefix: PropTypes.string.isRequired,
  isCreator: PropTypes.bool,
  isNewItem: PropTypes.bool,
  isOrganization: PropTypes.bool,
  isSelfRow: PropTypes.bool,
  onOrganizationSearchChange: PropTypes.func.isRequired,
  onPersonOrgToggle: PropTypes.func.isRequired,
  onPersonSearchChange: PropTypes.func.isRequired,
  onSelfNameSaved: PropTypes.func,
  personDetailsExpanded: PropTypes.bool,
  roleOptions: PropTypes.array,
  savedSelfNameSplit: PropTypes.shape({
    family: PropTypes.string,
    given: PropTypes.string,
  }),
  selfNameWasGuessed: PropTypes.bool,
  serializeSuggestions: PropTypes.func,
  values: PropTypes.object.isRequired,
};

export { CreatibutorsFormBody };
