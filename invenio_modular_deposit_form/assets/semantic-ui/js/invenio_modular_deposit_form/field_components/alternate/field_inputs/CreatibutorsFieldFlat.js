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
import {
  getFamilyName,
  getGivenName,
  guessPersonNamesFromFullName,
} from "../../../helpers/names";

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

/**
 * Parse a profile name-parts blob into a plain object.
 * Accepts either a JSON-string or an already-parsed object; returns null when
 * the value is missing, empty, or not a non-empty object.
 */
function parseNamePartsBlob(raw) {
  if (raw == null || raw === "" || (typeof raw === "string" && raw.trim() === "")) {
    return null;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Object.keys(raw).length ? raw : null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.keys(parsed).length
    ) {
      return parsed;
    }
  } catch {
    /* ignore invalid JSON */
  }
  return null;
}

/**
 * Read the user's local override (`name_parts_local` only) as `{family, given}`.
 * Returns null when the override is absent or empty so callers can decide whether
 * to surface a "Remember change" button.
 */
function readSavedLocalNameSplit(profile) {
  const parts = parseNamePartsBlob(profile?.name_parts_local);
  if (!parts) {
    return null;
  }
  const family = getFamilyName(parts) || "";
  const given = getGivenName(parts) || parts.first || "";
  if (!family && !given) {
    return null;
  }
  return { family, given };
}

/**
 * Initial family / given for "add myself": prefer any structured name parts
 * (`name_parts_local` then `name_parts`); fall back to a single-string guess
 * from `full_name`. Also reports whether the result is a guess (so the UI can
 * prompt the user to confirm and persist the split).
 */
function getInitialSelfPersonNames(profile) {
  const localParts = parseNamePartsBlob(profile?.name_parts_local);
  const remoteParts = parseNamePartsBlob(profile?.name_parts);
  const structured = localParts || remoteParts;
  if (structured) {
    const family = getFamilyName(structured) || "";
    const given = getGivenName(structured) || structured.first || "";
    if (family || given) {
      return {
        family_name: family,
        given_name: given,
        guessed: !localParts,
      };
    }
  }
  const guessed = guessPersonNamesFromFullName(profile?.full_name);
  return { ...guessed, guessed: true };
}

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

const emptyCreatibutorTemplate = {
  person_or_org: {
    family_name: "",
    given_name: "",
    name: "",
    type: "personal",
    identifiers: [],
  },
  affiliations: [],
};

/** Default `role` for a new row: only values from the active role vocabulary. */
const defaultRoleForNewRow = (schema, orderedRoleOptions) => {
  const opts = orderedRoleOptions ?? [];
  if (!opts.length) {
    return "";
  }
  if (schema === "creators") {
    const authorOpt = opts.find((o) => o.value === "author");
    return authorOpt?.value ?? opts[0]?.value ?? "";
  }
  return opts[0]?.value ?? "";
};

const makeSelfCreatibutor = (currentUserprofile, schema, orderedRoleOptions, personNames) => {
  const myAffiliations =
    typeof currentUserprofile.affiliations === "string" && currentUserprofile.affiliations !== ""
      ? [currentUserprofile.affiliations]
      : currentUserprofile?.affiliations;

  const rawIdentifiers = Object.fromEntries(
    Object.entries(currentUserprofile).filter(
      ([key, value]) => key.startsWith("identifier") && value !== "" && value !== null
    )
  );

  let myIdentifiers = [];
  if (rawIdentifiers && Object.keys(rawIdentifiers).length > 0) {
    myIdentifiers = Object.entries(rawIdentifiers).map(([key, value]) => ({
      identifier: value,
      scheme: key.replace("identifier_", ""),
    }));
  }

  const family = personNames?.family_name?.trim() ?? "";
  const given = personNames?.given_name?.trim() ?? "";

  return {
    person_or_org: {
      family_name: family || currentUserprofile?.full_name || "",
      given_name: given,
      name: currentUserprofile?.full_name || "",
      type: "personal",
      identifiers: myIdentifiers,
    },
    role: defaultRoleForNewRow(schema, orderedRoleOptions),
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
  const currentUserId = currentUserprofile?.id ? String(currentUserprofile.id) : "";
  const [newItemIndex, setNewItemIndex] = useState(-1);
  const [showEditForms, setShowEditForms] = useState([]);
  const [selfRowIndex, setSelfRowIndex] = useState(null);
  // Last successfully-persisted local override read from the profile; updated
  // after each successful Remember-change save so the button can re-hide.
  const [savedSelfNameSplit, setSavedSelfNameSplit] = useState(() =>
    readSavedLocalNameSplit(currentUserprofile)
  );
  // True when the initial split rendered for the self row was a guess (no
  // `name_parts_local` was present at the time of "Add myself").
  const [selfNameWasGuessed, setSelfNameWasGuessed] = useState(false);
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
    const filteredEditForms = showEditForms.filter((elem) => elem !== index);

    if (action === "saveAndContinue") {
      handleAddNew(pushFunc, buildEmptyCreatibutor(), filteredEditForms);
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
      adjustSelfRowIndexAfterRemove(index);
      removeFunc(index);
    }
    setNewItemIndex(-1);
  };

  // Keep `selfRowIndex` aligned with row-index shifts caused by removals.
  const adjustSelfRowIndexAfterRemove = (removedIndex) => {
    setSelfRowIndex((prev) => {
      if (prev === null) return null;
      if (prev === removedIndex) return null;
      if (prev > removedIndex) return prev - 1;
      return prev;
    });
  };

  // Keep `selfRowIndex` aligned with row reorders.
  const adjustSelfRowIndexAfterMove = (fromIndex, toIndex) => {
    setSelfRowIndex((prev) => {
      if (prev === null) return null;
      if (prev === fromIndex) return toIndex;
      if (fromIndex < prev && toIndex >= prev) return prev - 1;
      if (fromIndex > prev && toIndex <= prev) return prev + 1;
      return prev;
    });
  };

  const handleRemove = (removeFunc, index) => {
    adjustSelfRowIndexAfterRemove(index);
    removeFunc(index);
    focusAddButtonHandler();
  };

  const wrappedMove = (moveFunc) => (fromIndex, toIndex) => {
    adjustSelfRowIndexAfterMove(fromIndex, toIndex);
    moveFunc(fromIndex, toIndex);
  };

  const wrappedRemove = (removeFunc) => (index) => {
    adjustSelfRowIndexAfterRemove(index);
    removeFunc(index);
  };

  const creatibutorUp = (moveFunc, currentIndex) => {
    if (currentIndex > 0) {
      adjustSelfRowIndexAfterMove(currentIndex, currentIndex - 1);
      moveFunc(currentIndex, currentIndex - 1);
    }
  };

  const creatibutorDown = (moveFunc, currentIndex) => {
    if (currentIndex < getIn(values, fieldPath).length - 1) {
      adjustSelfRowIndexAfterMove(currentIndex, currentIndex + 1);
      moveFunc(currentIndex, currentIndex + 1);
    }
  };

  const handleSelfNameSaved = ({ family, given }) => {
    setSavedSelfNameSplit({ family, given });
    setSelfNameWasGuessed(false);
  };

  const baseRoles = roleOptions ?? [];
  const orderedRoleOptions =
    schema === "creators"
      ? moveCommonRolesToTop(sortOptions([...baseRoles]))
      : orderOptions(baseRoles, config.vocabularies?.metadata?.contributors?.role ?? []);

  const buildEmptyCreatibutor = () => ({
    ...emptyCreatibutorTemplate,
    role: defaultRoleForNewRow(schema, orderedRoleOptions),
  });

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
              <span id={`${fieldPath}-field-description`} className="description rel-mb-2">
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
                    currentUserId={currentUserId}
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
                    isSelfRow={selfRowIndex === index}
                    itemError={creatibutorsError ? error?.[index] : null}
                    key={index}
                    moveCreatibutor={wrappedMove(arrayHelpers.move)}
                    onSelfNameSaved={handleSelfNameSaved}
                    removeCreatibutor={wrappedRemove(arrayHelpers.remove)}
                    replaceCreatibutor={arrayHelpers.replace}
                    roleOptions={orderedRoleOptions}
                    savedSelfNameSplit={savedSelfNameSplit}
                    schema={schema}
                    selfNameWasGuessed={selfNameWasGuessed}
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
                    handleAddNew(arrayHelpers.push, buildEmptyCreatibutor());
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
                    const initial = getInitialSelfPersonNames(currentUserprofile);
                    const newIndex = getIn(values, fieldPath, []).length;
                    setSelfRowIndex(newIndex);
                    setSelfNameWasGuessed(!!initial.guessed);
                    handleAddNew(
                      arrayHelpers.push,
                      makeSelfCreatibutor(currentUserprofile, schema, orderedRoleOptions, {
                        family_name: initial.family_name,
                        given_name: initial.given_name,
                      })
                    );
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
