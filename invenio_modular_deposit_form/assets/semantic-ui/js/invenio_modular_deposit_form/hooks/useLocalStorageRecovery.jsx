// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";

import { areDeeplyEqual, focusFirstElement } from "../utils";

const AUTOSAVE_DEBOUNCE_MS = 500;

// Server-managed/computed fields that are part of the Formik deposit schema but
// are owned by the backend (populated from the API response, not edited by the
// user). They must never be rehydrated from a stale localStorage snapshot:
// stripping them on save keeps the snapshot lean, and overlaying them from the
// live Redux record on restore prevents downstream consumers (e.g. upstream
// ShareDraftButton's `Object.keys(values.expanded)`) from blowing up when a
// restored snapshot would otherwise leave them undefined.
const SERVER_MANAGED_FORMIK_KEYS = ["expanded", "links"];

const stripServerManagedKeys = (values) => {
  if (!values || typeof values !== "object") return values;
  const result = { ...values };
  for (const key of SERVER_MANAGED_FORMIK_KEYS) {
    delete result[key];
  }
  return result;
};

const overlayServerManagedKeys = (snapshot, record) => {
  const overlay = {};
  for (const key of SERVER_MANAGED_FORMIK_KEYS) {
    if (record && record[key] !== undefined) {
      overlay[key] = record[key];
    }
  }
  return { ...snapshot, ...overlay };
};

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
  const store = useStore();

  // handler for recoveryAsked
  // focus first element when modal is closed to allow keyboard navigation
  const handleRecoveryAsked = useCallback(() => {
    setRecoveryAsked(true);
    focusFirstElement(currentFormPage, true, fileUploadPageId);
  }, [currentFormPage, fileUploadPageId]);

  // keep changed form values in local storage (debounced so rapid edits
  // collapse into a single write once the user pauses). Server-managed keys
  // are ignored here so that fresh server-side updates to e.g. `expanded` or
  // `links` don't trigger spurious autosaves with no user content change.
  useEffect(() => {
    if (!recoveryAsked) return;
    if (areDeeplyEqual(initialValues, values, ["ui", ...SERVER_MANAGED_FORMIK_KEYS])) return;

    autosaveTimeoutRef.current = setTimeout(() => {
      window.localStorage.setItem(
        `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`,
        JSON.stringify(stripServerManagedKeys(values))
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
  // of those fields. We ignore `ui` (transient client-only Formik state) and
  // SERVER_MANAGED_FORMIK_KEYS (which we deliberately strip on save and
  // overlay from the live record on restore — see handleStorageData).
  useEffect(() => {
    const storageValues = window.localStorage.getItem(storageValuesKey);
    const storageValuesObj = JSON.parse(storageValues);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, initialValues, [
        "ui",
        ...SERVER_MANAGED_FORMIK_KEYS,
      ])
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
        // Overlay server-managed keys from the live record onto the recovered
        // snapshot. The snapshot intentionally omits these (we strip them on
        // save), and pre-existing snapshots saved by older code may have stale
        // copies; either way, the live Redux record is the source of truth.
        const liveRecord = store.getState().deposit?.record ?? {};
        const merged = overlayServerManagedKeys(recoveredStorageValues, liveRecord);
        async function doSetInitialValues() {
          resetForm({ values: merged });
        }
        doSetInitialValues();
        setRecoveredStorageValues(null);
      }
      window.localStorage.removeItem(`rdmDepositFormValues.${currentUserprofile.id}.${values.id}`);
    },
    [currentUserprofile.id, recoveredStorageValues, resetForm, store, values.id]
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
