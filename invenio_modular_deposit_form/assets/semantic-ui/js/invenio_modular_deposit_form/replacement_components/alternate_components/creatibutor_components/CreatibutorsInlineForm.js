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
  fieldPath,
  fieldPathPrefix,
  focusAddButtonHandler,
  handleCancel,
  handleCloseForm,
  index,
  isNewItem,
  removeCreatibutor,
  roleOptions = [],
  schema,
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
  const [showPersonForm, setShowPersonForm] = useState(
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

  const namesAutocompleteRef = createRef();
  const affiliationsRef = createRef();

  const personOrOrgPath = `${fieldPathPrefix}.person_or_org`;
  const identifiersFieldPath = `${personOrOrgPath}.identifiers`;
  const affiliationsFieldPath = `${fieldPathPrefix}.affiliations`;

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

  const onPersonSearchChange = useCallback(
    (selectedSuggestions) => {
      if (selectedSuggestions[0].key === "manual-entry") {
        if (namesAutocompleteRef.current) {
          namesAutocompleteRef.current.setState({
            suggestions: [],
            selectedSuggestions: [],
          });
        }
        setShowPersonForm(true);
        return;
      }

      const selected = selectedSuggestions[0].extra;
      const newIdentifiers = selected.identifiers ?? [];
      const newAffiliations = selected.affiliations ?? [];

      setShowPersonForm(true);
      setPersonIdentifiers(newIdentifiers);
      setPersonAffiliations(newAffiliations);

      setFieldValue(`${personOrOrgPath}.family_name`, selected.family_name);
      setFieldValue(`${personOrOrgPath}.given_name`, selected.given_name);
      setFieldValue(identifiersFieldPath, newIdentifiers);
      setFieldValue(affiliationsFieldPath, newAffiliations);

      syncAffiliationsRef(newAffiliations);
    },
    [
      namesAutocompleteRef,
      personOrOrgPath,
      identifiersFieldPath,
      affiliationsFieldPath,
      setFieldValue,
      syncAffiliationsRef,
    ]
  );

  const onOrganizationSearchChange = useCallback(
    ({ formikProps }, selectedSuggestions) => {
      const selected = selectedSuggestions[0].extra;
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
          fieldPathPrefix={fieldPathPrefix}
          isCreator={isCreator}
          isNewItem={isNewItem}
          isOrganization={isOrganization}
          namesAutocompleteRef={namesAutocompleteRef}
          onOrganizationSearchChange={onOrganizationSearchChange}
          onPersonOrgToggle={onPersonOrgToggle}
          onPersonSearchChange={onPersonSearchChange}
          roleOptions={roleOptions}
          serializeSuggestions={serializeSuggestionsProp || defaultSerializeSuggestions}
          showPersonForm={showPersonForm}
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
            setShowPersonForm={setShowPersonForm}
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
  fieldPath: PropTypes.string.isRequired,
  fieldPathPrefix: PropTypes.string.isRequired,
  focusAddButtonHandler: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
  handleCloseForm: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isNewItem: PropTypes.bool,
  removeCreatibutor: PropTypes.func.isRequired,
  roleOptions: PropTypes.array,
  schema: PropTypes.string.isRequired,
  serializeSuggestions: PropTypes.func,
  values: PropTypes.object.isRequired,
};

export { CreatibutorsInlineForm, NamesAutocompleteOptions };
