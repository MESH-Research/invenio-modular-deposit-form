// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Bridge component: wraps the replacement-modal-style form body in an
// inline expandable panel with autofill state management from the modal
// converted to React hooks.

import React, { createRef, useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Form, Transition } from "semantic-ui-react";
import { getIn, useFormikContext } from "formik";
import _isEmpty from "lodash/isEmpty";
import _get from "lodash/get";
import { AffiliationsSuggestions } from "react-invenio-forms";
import { CREATIBUTOR_TYPE } from "@js/invenio_rdm_records/src/deposit/fields/CreatibutorsField/type";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { CreatibutorsFormBody } from "./CreatibutorsFormBody";
import { CreatibutorsFormActionButtons } from "./CreatibutorsFormActionButtons";

const NamesAutocompleteOptions = {
  SEARCH: "search",
  SEARCH_ONLY: "search_only",
  OFF: "off",
};

const CreatibutorsInlineForm = ({
  addCreatibutor,
  addLabel,
  autocompleteNames = "search",
  currentUserId,
  fieldPath,
  fieldPathPrefix,
  focusAddButtonHandler,
  handleCancel,
  handleCloseForm,
  index,
  isNewItem,
  isSelfRow = false,
  onSelfNameSaved,
  removeCreatibutor,
  roleOptions = [],
  savedSelfNameSplit,
  schema,
  selfNameWasGuessed = false,
  serializeSuggestions: serializeSuggestionsProp,
  values,
}) => {
  const { setFieldValue } = useFormikContext();
  const initialCreatibutor = getIn(values, fieldPathPrefix, {});
  const isCreator = schema === "creators";

  const [saveAndContinueLabel, setSaveAndContinueLabel] = useState(
    i18next.t("Save and add another")
  );
  const [show, setShow] = useState(true);
  const [personDetailsExpanded, setPersonDetailsExpanded] = useState(
    autocompleteNames !== NamesAutocompleteOptions.SEARCH_ONLY ||
      !_isEmpty(initialCreatibutor?.person_or_org?.family_name)
  );
  const [isOrganization, setIsOrganization] = useState(
    !_isEmpty(initialCreatibutor) &&
      initialCreatibutor.person_or_org?.type === CREATIBUTOR_TYPE.ORGANIZATION
  );

  // Cached identifiers/affiliations per type (for toggle restore)
  const [personIdentifiers, setPersonIdentifiers] = useState(
    !isOrganization ? _get(initialCreatibutor, "person_or_org.identifiers", []) : []
  );
  const [personAffiliations, setPersonAffiliations] = useState(
    !isOrganization ? _get(initialCreatibutor, "affiliations", []) : []
  );
  const [organizationIdentifiers, setOrganizationIdentifiers] = useState(
    isOrganization ? _get(initialCreatibutor, "person_or_org.identifiers", []) : []
  );
  const [organizationAffiliations, setOrganizationAffiliations] = useState(
    isOrganization ? _get(initialCreatibutor, "affiliations", []) : []
  );

  const familyNameWidgetRef = createRef();
  const affiliationsRef = createRef();

  const personOrOrgPath = `${fieldPathPrefix}.person_or_org`;
  const identifiersFieldPath = `${personOrOrgPath}.identifiers`;
  const affiliationsFieldPath = `${fieldPathPrefix}.affiliations`;

  // Affiliations RemoteSelectField doesn't update automatically when the
  // formik values change, so we maintain a ref pointer to the widget
  // instance and update it manually here.
  const syncAffiliationsRef = useCallback(
    (affiliations) => {
      if (!affiliationsRef.current) return;
      const affiliationsState = affiliations.map(({ id, name }) => ({
        text: name,
        value: id ?? name,
        key: id ?? name,
        name,
      }));
      affiliationsRef.current.setState({
        suggestions: affiliationsState,
        selectedSuggestions: affiliationsState,
        searchQuery: null,
        error: false,
        open: false,
      });
    },
    [affiliationsRef]
  );

  const applyPersonFromApi = useCallback(
    (selected) => {
      if (!selected) {
        return;
      }
      const newIdentifiers = selected.identifiers ?? [];
      const newAffiliations = selected.affiliations ?? [];

      setPersonDetailsExpanded(true);
      setPersonIdentifiers(newIdentifiers);
      setPersonAffiliations(newAffiliations);

      setFieldValue(`${personOrOrgPath}.family_name`, selected.family_name);
      setFieldValue(`${personOrOrgPath}.given_name`, selected.given_name);
      setFieldValue(identifiersFieldPath, newIdentifiers);
      setFieldValue(affiliationsFieldPath, newAffiliations);

      syncAffiliationsRef(newAffiliations);
    },
    [
      personOrOrgPath,
      identifiersFieldPath,
      affiliationsFieldPath,
      setFieldValue,
      syncAffiliationsRef,
    ]
  );

  const onPersonSearchChange = useCallback(
    (_ctx, selectedSuggestions) => {
      const selectedSuggestion = selectedSuggestions?.[0];
      if (!selectedSuggestion) {
        return;
      }

      if (selectedSuggestion.key === "manual-entry") {
        if (familyNameWidgetRef.current) {
          familyNameWidgetRef.current.setState({
            suggestions: [],
            selectedSuggestions: [],
          });
        }
        setPersonDetailsExpanded(true);
        return;
      }

      if (selectedSuggestion.extra) {
        applyPersonFromApi(selectedSuggestion.extra);
        return;
      }

      const freeText = selectedSuggestion.value ?? selectedSuggestion.text ?? "";
      setPersonDetailsExpanded(true);
      setFieldValue(`${personOrOrgPath}.family_name`, String(freeText));
    },
    [familyNameWidgetRef, applyPersonFromApi, personOrOrgPath, setFieldValue]
  );

  const onOrganizationSearchChange = useCallback(
    (_ctx, selectedSuggestions) => {
      const first = selectedSuggestions?.[0];
      if (!first?.extra) {
        return;
      }
      const selected = first.extra;
      const newIdentifiers = (selected.identifiers ?? []).filter((id) => id.scheme !== "grid");

      setOrganizationIdentifiers(newIdentifiers);
      setOrganizationAffiliations([]);

      setFieldValue(`${personOrOrgPath}.name`, selected.name);
      setFieldValue(identifiersFieldPath, newIdentifiers);
      setFieldValue(affiliationsFieldPath, []);

      syncAffiliationsRef([]);
    },
    [
      personOrOrgPath,
      identifiersFieldPath,
      affiliationsFieldPath,
      setFieldValue,
      syncAffiliationsRef,
    ]
  );

  const onPersonOrgToggle = useCallback(
    (newType) => {
      const switchingToOrg = newType === CREATIBUTOR_TYPE.ORGANIZATION;
      setIsOrganization(switchingToOrg);

      if (switchingToOrg) {
        // Cache current person values, restore org values
        setPersonIdentifiers(getIn(values, identifiersFieldPath, []));
        setPersonAffiliations(getIn(values, affiliationsFieldPath, []));
        setFieldValue(identifiersFieldPath, organizationIdentifiers);
        setFieldValue(affiliationsFieldPath, organizationAffiliations);
      } else {
        // Cache current org values, restore person values
        setOrganizationIdentifiers(getIn(values, identifiersFieldPath, []));
        setOrganizationAffiliations(getIn(values, affiliationsFieldPath, []));
        setFieldValue(identifiersFieldPath, personIdentifiers);
        setFieldValue(affiliationsFieldPath, personAffiliations);
      }
    },
    [
      values,
      identifiersFieldPath,
      affiliationsFieldPath,
      setFieldValue,
      personIdentifiers,
      personAffiliations,
      organizationIdentifiers,
      organizationAffiliations,
    ]
  );

  const defaultSerializeSuggestions = useMemo(
    () => (creatibutors) => AffiliationsSuggestions(creatibutors, isOrganization),
    [isOrganization]
  );

  const changeContent = () => {
    setSaveAndContinueLabel(i18next.t("Added"));
    setTimeout(() => {
      setSaveAndContinueLabel(i18next.t("Save and add another"));
    }, 2000);
  };

  const handleSave = (action) => {
    setShow(false);
    window.setTimeout(() => {
      handleCloseForm(addCreatibutor, index, action);
      if (action === "saveAndContinue") {
        changeContent();
      }
    }, 100);
  };

  return (
    <Transition visible={show} animation="fade" duration={300} transitionOnMount>
      <fieldset className={`${fieldPath}-item-form ui segment invenio-form-section`}>
        {isNewItem && <legend>{addLabel}</legend>}
        <CreatibutorsFormBody
          affiliationsRef={affiliationsRef}
          autocompleteNames={autocompleteNames}
          currentUserId={currentUserId}
          familyNameWidgetRef={familyNameWidgetRef}
          fieldPathPrefix={fieldPathPrefix}
          isCreator={isCreator}
          isNewItem={isNewItem}
          isOrganization={isOrganization}
          isSelfRow={isSelfRow}
          onOrganizationSearchChange={onOrganizationSearchChange}
          onPersonOrgToggle={onPersonOrgToggle}
          onPersonSearchChange={onPersonSearchChange}
          onSelfNameSaved={onSelfNameSaved}
          personDetailsExpanded={personDetailsExpanded}
          roleOptions={roleOptions}
          savedSelfNameSplit={savedSelfNameSplit}
          selfNameWasGuessed={selfNameWasGuessed}
          serializeSuggestions={serializeSuggestionsProp || defaultSerializeSuggestions}
          values={values}
        />
        <Form.Group inline className="creatibutors-item-form-buttons">
          <CreatibutorsFormActionButtons
            autocompleteNames={autocompleteNames}
            handleCancel={handleCancel}
            handleSave={handleSave}
            index={index}
            isNewItem={isNewItem}
            removeCreatibutor={removeCreatibutor}
            saveAndContinueLabel={saveAndContinueLabel}
            setPersonDetailsExpanded={setPersonDetailsExpanded}
          />
        </Form.Group>
      </fieldset>
    </Transition>
  );
};

CreatibutorsInlineForm.propTypes = {
  addCreatibutor: PropTypes.func.isRequired,
  addLabel: PropTypes.string.isRequired,
  autocompleteNames: PropTypes.oneOf(["search", "search_only", "off"]),
  currentUserId: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  fieldPathPrefix: PropTypes.string.isRequired,
  focusAddButtonHandler: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
  handleCloseForm: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isNewItem: PropTypes.bool,
  isSelfRow: PropTypes.bool,
  onSelfNameSaved: PropTypes.func,
  removeCreatibutor: PropTypes.func.isRequired,
  roleOptions: PropTypes.array,
  savedSelfNameSplit: PropTypes.shape({
    family: PropTypes.string,
    given: PropTypes.string,
  }),
  schema: PropTypes.string.isRequired,
  selfNameWasGuessed: PropTypes.bool,
  serializeSuggestions: PropTypes.func,
  values: PropTypes.object.isRequired,
};

export { CreatibutorsInlineForm, NamesAutocompleteOptions };
