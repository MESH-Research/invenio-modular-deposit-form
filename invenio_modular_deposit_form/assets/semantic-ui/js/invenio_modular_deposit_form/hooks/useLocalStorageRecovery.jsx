// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useFormikContext } from "formik";

import { areDeeplyEqual, focusFirstElement } from "../utils";

const AUTOSAVE_DEBOUNCE_MS = 500;

/** Custom hook for recovering form values from local storage
 *
 * @param {Object} currentUserprofile
 * @param {string} currentFormPage - Current form page id
 * @param {string|null} fileUploadPageId - Page id containing FileUploadComponent (for focus workaround)
 * @returns {Object} recoveryAsked, confirmModalRef, recoveredStorageValues, storageDataPresent
 */
function useLocalStorageRecovery(currentUserprofile, currentFormPage, fileUploadPageId) {
  const user = currentUserprofile.id;
  const [recoveryAsked, setRecoveryAsked] = useState(false);
  const confirmModalRef = useRef();
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);
  const [storageDataPresent, setStorageDataPresent] = useState(false);
  const { values, initialValues, isSubmitting, setValues, setInitialValues, resetForm } =
    useFormikContext();
  const storageValuesKey = `rdmDepositFormValues.${user}.${initialValues?.id}`;
  const autosaveTimeoutRef = useRef(null);

  // handler for recoveryAsked
  // focus first element when modal is closed to allow keyboard navigation
  const handleRecoveryAsked = useCallback(() => {
    setRecoveryAsked(true);
    focusFirstElement(currentFormPage, true, fileUploadPageId);
  }, [currentFormPage, fileUploadPageId]);

  // keep changed form values in local storage (debounced so rapid edits
  // collapse into a single write once the user pauses)
  useEffect(() => {
    if (!recoveryAsked) return;
    if (areDeeplyEqual(initialValues, values, ["ui"])) return;

    autosaveTimeoutRef.current = setTimeout(() => {
      window.localStorage.setItem(
        `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`,
        JSON.stringify(values)
      );
      setStorageDataPresent(true);
      autosaveTimeoutRef.current = null;
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [values, recoveryAsked]);

  // Recover form values from local storage.
  //
  // The right question for "is there something worth offering to restore?" is
  // "does the autosaved snapshot differ from what the server currently has?",
  // not "does it differ from the live Formik values". Comparing against
  // initialValues (the server snapshot Formik was initialised with) avoids
  // false positives from client-side auto-defaulting effects that mutate
  // `values` after mount (e.g. resource type / publication date / DOI), and
  // also avoids false negatives where a user's only edit happens to be in one
  // of those fields. We only need to ignore `ui`, which is transient
  // client-only Formik state and not user content.
  useEffect(() => {
    const storageValues = window.localStorage.getItem(storageValuesKey);
    const storageValuesObj = JSON.parse(storageValues);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, initialValues, ["ui"])
    ) {
      setRecoveredStorageValues(storageValuesObj);
      setStorageDataPresent(true);
    } else {
      setRecoveryAsked(true);
    }
  }, []);

  // clear local storage (and any pending debounced autosave) when form submits
  useEffect(() => {
    if (!isSubmitting) return;
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    if (storageDataPresent) {
      window.localStorage.removeItem(storageValuesKey);
    }
  }, [isSubmitting]);

  const handleStorageData = useCallback(
    (recover) => {
      if (recover) {
        async function doSetInitialValues() {
          resetForm({ values: recoveredStorageValues });
        }
        doSetInitialValues();
        setRecoveredStorageValues(null);
      }
      window.localStorage.removeItem(`rdmDepositFormValues.${currentUserprofile.id}.${values.id}`);
    },
    [currentUserprofile.id, recoveredStorageValues, resetForm, values.id]
  );

  return useMemo(
    () => ({
      handleStorageData,
      storageDataPresent,
      recoveryAsked,
      confirmModalRef,
      handleRecoveryAsked,
    }),
    [handleStorageData, storageDataPresent, recoveryAsked, confirmModalRef, handleRecoveryAsked]
  );
}

export { useLocalStorageRecovery };
