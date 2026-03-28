// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useFormikContext } from "formik";

import { areDeeplyEqual, focusFirstElement } from "../utils";

/** Custom hook for recovering form values from local storage
 *
 * @param {Object} currentUserprofile
 * @param {string} currentFormPage - Current form page id
 * @param {string|null} fileUploadPageId - Page id containing FileUploadComponent (for focus workaround)
 * @returns {Object} recoveryAsked, confirmModalRef, recoveredStorageValues, storageDataPresent
 */
function useLocalStorageRecovery(currentUserprofile, currentFormPage, fileUploadPageId) {
  const [recoveryAsked, setRecoveryAsked] = useState(false);
  const confirmModalRef = useRef();
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);
  const [storageDataPresent, setStorageDataPresent] = useState(false);
  const { values, initialValues, setValues, setInitialValues, resetForm } = useFormikContext();

  // handler for recoveryAsked
  // focus first element when modal is closed to allow keyboard navigation
  const handleRecoveryAsked = useCallback(() => {
    setRecoveryAsked(true);
    focusFirstElement(currentFormPage, true, fileUploadPageId);
  }, [currentFormPage, fileUploadPageId]);

  //keep changed form values in local storage
  useEffect(() => {
    if (!!recoveryAsked && !areDeeplyEqual(initialValues, values, ["ui"])) {
      window.localStorage.setItem(
        `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`,
        JSON.stringify(values)
      );
      setStorageDataPresent(true);
    }
  }, [values]);

  //recover form values from local storage
  useEffect(() => {
    const user = currentUserprofile.id;
    const storageValuesKey = `rdmDepositFormValues.${user}.${initialValues?.id}`;
    const storageValues = window.localStorage.getItem(storageValuesKey);
    const storageValuesObj = JSON.parse(storageValues);
    console.log("Checking if storageValuesObj is equal to values");
    console.log("storageValuesObj:", storageValuesObj);
    console.log("values:", values);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, values, [
        "ui",
        "metadata.resource_type",
        "metadata.publication_date",
        "pids.doi",
      ])
    ) {
      console.log("setting recoveredStorageValues");
      setRecoveredStorageValues(storageValuesObj);
      setStorageDataPresent(true);
    } else {
      console.log("setting recoveryAsked to true");
      setRecoveryAsked(true);
    }
  }, []);

  const handleStorageData = useCallback(
    (recover) => {
      if (recover) {
        console.log("recovering storage data");
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
