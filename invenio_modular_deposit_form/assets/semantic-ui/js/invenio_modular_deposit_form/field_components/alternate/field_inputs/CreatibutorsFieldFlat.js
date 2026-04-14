// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// CreatibutorsFieldFlat: Inline-expandable creatibutors field combining
// the override version's direct Formik wiring, keyboard reordering, and
// a11y focus handling with the replacement version's name-autofill form.

import React, { useState } from "react";
import { useStore } from "react-redux";
import { getIn, FieldArray, useFormikContext } from "formik";
import { Button, Form, Icon, Label, List, TransitionGroup } from "semantic-ui-react";
import _get from "lodash/get";
import { FieldLabel } from "react-invenio-forms";
import PropTypes from "prop-types";

import { CreatibutorsFieldFlatItem } from "./creatibutor_components/CreatibutorsFieldFlatItem";
import { CREATIBUTOR_TYPE } from "@js/invenio_rdm_records/src/deposit/fields/CreatibutorsField/type";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { getFamilyName, getGivenName } from "../../helpers/names";

function sortOptions(options) {
  return options.sort((o1, o2) => o1.text.localeCompare(o2.text));
}

const moveCommonRolesToTop = (roleArray) => {
  let newRoleArray = [...roleArray];
  const commonRoles = [
    "projectOrTeamLeader",
    "projectOrTeamMember",
    "collaborator",
    "translator",
    "editor",
    "author",
  ];
  for (const role of commonRoles) {
    const index = newRoleArray.findIndex(({ value }) => value === role);
    if (index > -1) {
      newRoleArray.unshift(...newRoleArray.splice(index, 1));
    }
  }
  const otherIndex = newRoleArray.findIndex(({ value }) => value === "other");
  if (otherIndex > -1) {
    newRoleArray.push(...newRoleArray.splice(otherIndex, 1));
  }
  return newRoleArray;
};

const orderOptions = (optionList, contribsOptionList) => {
  const newOptionList = optionList.concat(
    contribsOptionList.filter(
      (item) => !optionList.some((item2) => item2.text.toLowerCase() === item.text.toLowerCase())
    )
  );
  return moveCommonRolesToTop(sortOptions(newOptionList));
};

const creatibutorNameDisplay = (value) => {
  const creatibutorType = _get(value, "person_or_org.type", CREATIBUTOR_TYPE.PERSON);
  const isPerson = creatibutorType === CREATIBUTOR_TYPE.PERSON;

  const familyName = _get(value, "person_or_org.family_name", "");
  const givenName = _get(value, "person_or_org.given_name", "");
  const affiliationName = _get(value, "affiliations[0].name", "");
  const name = _get(value, "person_or_org.name");

  const affiliation = affiliationName ? ` (${affiliationName})` : "";

  if (isPerson) {
    const givenNameSuffix = givenName ? `, ${givenName}` : "";
    return `${familyName}${givenNameSuffix}${affiliation}`;
  }

  return `${name}${affiliation}`;
};

const emptyCreatibutor = {
  person_or_org: {
    family_name: "",
    given_name: "",
    name: "",
    type: "personal",
    identifiers: [],
  },
  role: "author",
  affiliations: [],
};

const makeSelfCreatibutor = (currentUserprofile) => {
  const myAffiliations =
    typeof currentUserprofile.affiliations === "string" && currentUserprofile.affiliations !== ""
      ? [currentUserprofile.affiliations]
      : currentUserprofile?.affiliations;
  console.log(currentUserprofile);

  let myNameParts = {};
  if (currentUserprofile?.name_parts_local && currentUserprofile.name_parts_local !== "") {
    myNameParts = JSON.parse(currentUserprofile.name_parts_local);
  } else if (currentUserprofile?.name_parts && currentUserprofile.name_parts !== "") {
    myNameParts = JSON.parse(currentUserprofile.name_parts);
  }
  console.log(myNameParts);

  const rawIdentifiers = Object.fromEntries(
    Object.entries(currentUserprofile).filter(
      ([key, value]) => key.startsWith("identifier") && value !== "" && value !== null
    )
  );
  console.log(rawIdentifiers);

  let myIdentifiers = [];
  if (rawIdentifiers && Object.keys(rawIdentifiers).length > 0) {
    myIdentifiers = Object.entries(rawIdentifiers).map(([key, value]) => ({
      identifier: value,
      scheme: key.replace("identifier_", ""),
    }));
  }

  const return_obj = {
    person_or_org: {
      family_name: getFamilyName(myNameParts) || currentUserprofile?.full_name || "",
      given_name: getGivenName(myNameParts) || myNameParts?.first || "",
      name: currentUserprofile?.full_name || "",
      type: "personal",
      identifiers: myIdentifiers,
    },
    role: "author",
    affiliations:
      myAffiliations?.length > 0
        ? myAffiliations.map((affiliation) => ({
            text: affiliation,
            key: affiliation,
            value: affiliation,
            name: affiliation,
          }))
        : [],
  };
  console.log(return_obj);
  return return_obj;
};

const CreatibutorsFieldFlat = ({
  addButtonLabel = i18next.t("Add creator"),
  autocompleteNames = "search",
  modal = {
    addLabel: i18next.t("Add creator"),
    editLabel: i18next.t("Edit creator"),
  },
  cancelButtonLabel = i18next.t("Cancel"),
  helpText,
  description,
  fieldPath,
  label,
  icon = "users",
  required: requiredProp,
  roleOptions,
  schema = "creators",
  serializeSuggestions: serializeSuggestionsProp,
  ...otherProps
}) => {
  const required = requiredProp ?? schema === "creators";
  const store = useStore();
  const config = store.getState().deposit.config;
  const currentUserprofile = config?.current_user_profile ?? {};
  const [addingSelf, setAddingSelf] = useState(false);
  const [newItemIndex, setNewItemIndex] = useState(-1);
  const [showEditForms, setShowEditForms] = useState([]);
  const { errors, initialErrors, initialValues, setFieldTouched, touched, values } =
    useFormikContext();

  const error = _get(errors, fieldPath, null);
  const initialError = getIn(initialErrors, fieldPath, null);
  const creatibutorsTouched = getIn(touched, fieldPath, null);
  const creatibutorsError =
    (!!error && !!creatibutorsTouched) ||
    (_get(values, fieldPath, []) === _get(initialValues, fieldPath, []) && initialError);

  const focusAddButtonHandler = () => {
    setTimeout(() => {
      const btn = document.getElementById(`${fieldPath}.add-button`);
      btn?.focus();
    }, 100);
  };

  const handleAddNew = (pushFunc, newItem, filteredEditForms = undefined) => {
    pushFunc(newItem);
    const newIndex = getIn(values, fieldPath).length;
    setNewItemIndex(newIndex);
    const newEditForms = filteredEditForms !== undefined ? filteredEditForms : showEditForms;
    setShowEditForms([...newEditForms, newIndex]);
  };

  const handleCloseForm = (pushFunc, index, action) => {
    setAddingSelf(false);
    const filteredEditForms = showEditForms.filter((elem) => elem !== index);

    if (action === "saveAndContinue") {
      handleAddNew(pushFunc, emptyCreatibutor, filteredEditForms);
    } else {
      setShowEditForms(filteredEditForms);
      setNewItemIndex(-1);
      focusAddButtonHandler();
    }
    setFieldTouched(fieldPath, true);
  };

  const handleOpenForm = (index) => {
    setShowEditForms([...showEditForms, index]);
    if (newItemIndex !== index) {
      const list = getIn(values, fieldPath, []);
      for (let i = 0; i < list.length; i++) {
        setFieldTouched(`${fieldPath}.${i}.person_or_org.name`, true);
        setFieldTouched(`${fieldPath}.${i}.person_or_org.family_name`, true);
        setFieldTouched(`${fieldPath}.${i}.person_or_org.given_name`, true);
        setFieldTouched(`${fieldPath}.${i}.role`, true);
        const affiliations = getIn(values, `${fieldPath}.${i}.affiliations`, []);
        for (let j = 0; j < affiliations.length; j++) {
          setFieldTouched(`${fieldPath}.${i}.affiliations.${j}.name`, true);
        }
        const identifiers = getIn(values, `${fieldPath}.${i}.person_or_org.identifiers`, []);
        for (let j = 0; j < identifiers.length; j++) {
          setFieldTouched(`${fieldPath}.${i}.person_or_org.identifiers.${j}.identifier`, true);
          setFieldTouched(`${fieldPath}.${i}.person_or_org.identifiers.${j}.scheme`, true);
        }
      }
    }
  };

  const handleCancel = (removeFunc, index) => {
    handleCloseForm(undefined, index, "cancel");
    if (newItemIndex === index) {
      removeFunc(index);
    }
    setNewItemIndex(-1);
  };

  const handleRemove = (removeFunc, index) => {
    removeFunc(index);
    focusAddButtonHandler();
  };

  const creatibutorUp = (moveFunc, currentIndex) => {
    if (currentIndex > 0) {
      moveFunc(currentIndex, currentIndex - 1);
    }
  };

  const creatibutorDown = (moveFunc, currentIndex) => {
    if (currentIndex < getIn(values, fieldPath).length - 1) {
      moveFunc(currentIndex, currentIndex + 1);
    }
  };

  const orderedRoleOptions = orderOptions(
    roleOptions ?? [],
    config.vocabularies?.metadata?.contributors?.role ?? []
  );

  return (
    <Form.Field id={fieldPath} required={required} error={creatibutorsError}>
      <FieldArray
        name={fieldPath}
        className={schema}
        required={!!required}
        render={(arrayHelpers) => (
          <>
            {label && (
              <FieldLabel htmlFor={fieldPath} icon={icon} label={label} className="mb-15" />
            )}
            {description && (
              <span id={`${fieldPath}-field-description`} className="description mt-0 rel-mb-2">
                {description}
              </span>
            )}

            <TransitionGroup as={List} className="creators-list" duration={500} animation="fade">
              {getIn(arrayHelpers.form.values, fieldPath, []).map((value, index) => {
                const fieldPathPrefix = `${fieldPath}.${index}`;
                const displayName = creatibutorNameDisplay(value);
                return (
                  <CreatibutorsFieldFlatItem
                    {...otherProps}
                    addCreatibutor={arrayHelpers.push}
                    addLabel={addButtonLabel}
                    autocompleteNames={autocompleteNames}
                    cancelLabel={cancelButtonLabel}
                    creatibutorsLength={getIn(values, fieldPath, []).length}
                    creatibutorDown={creatibutorDown}
                    creatibutorUp={creatibutorUp}
                    displayName={displayName}
                    editLabel={modal.editLabel}
                    fieldPath={fieldPath}
                    fieldPathPrefix={fieldPathPrefix}
                    focusAddButtonHandler={focusAddButtonHandler}
                    handleRemove={handleRemove}
                    handleCancel={handleCancel}
                    handleCloseForm={handleCloseForm}
                    handleOpenForm={handleOpenForm}
                    index={index}
                    isNewItem={newItemIndex === index}
                    itemError={creatibutorsError ? error?.[index] : null}
                    key={index}
                    moveCreatibutor={arrayHelpers.move}
                    removeCreatibutor={arrayHelpers.remove}
                    replaceCreatibutor={arrayHelpers.replace}
                    roleOptions={orderedRoleOptions}
                    schema={schema}
                    serializeSuggestions={serializeSuggestionsProp}
                    showEditForms={showEditForms}
                    values={values}
                  />
                );
              })}
            </TransitionGroup>

            {!(newItemIndex > -1 && showEditForms.includes(newItemIndex)) && (
              <div>
                <Button
                  type="button"
                  icon
                  labelPosition="left"
                  id={`${fieldPath}.add-button`}
                  className="add-button"
                  aria-labelledby={`${fieldPath}-field-description`}
                  onClick={() => {
                    setAddingSelf(false);
                    handleAddNew(arrayHelpers.push, emptyCreatibutor);
                  }}
                >
                  <Icon name="add" />
                  {addButtonLabel}
                </Button>
                <Button
                  type="button"
                  icon
                  labelPosition="left"
                  id={`${fieldPath}.add-self-button`}
                  className="add-button"
                  aria-labelledby={`${fieldPath}-field-description`}
                  onClick={() => {
                    setAddingSelf(true);
                    handleAddNew(arrayHelpers.push, makeSelfCreatibutor(currentUserprofile));
                  }}
                >
                  <Icon name="add" />
                  {i18next.t("Add myself")}
                </Button>
              </div>
            )}

            {creatibutorsError && typeof error === "string" && (
              <Label pointing="above" prompt>
                {error}
              </Label>
            )}

            {helpText && (
              <div id={`${fieldPath}-field-helptext`} className="helptext">
                {helpText}
              </div>
            )}
          </>
        )}
      />
    </Form.Field>
  );
};

CreatibutorsFieldFlat.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  addButtonLabel: PropTypes.string,
  autocompleteNames: PropTypes.oneOf(["search", "search_only", "off"]),
  cancelButtonLabel: PropTypes.string,
  description: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.string,
  modal: PropTypes.shape({
    addLabel: PropTypes.string.isRequired,
    editLabel: PropTypes.string.isRequired,
  }),
  required: PropTypes.bool,
  roleOptions: PropTypes.array,
  schema: PropTypes.oneOf(["creators", "contributors"]).isRequired,
  serializeSuggestions: PropTypes.func,
};

export { CreatibutorsFieldFlat };
