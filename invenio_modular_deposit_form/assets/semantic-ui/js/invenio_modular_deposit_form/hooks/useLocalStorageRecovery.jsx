// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";

import { areDeeplyEqual, focusFirstElement } from "../helpers/utils";

const AUTOSAVE_DEBOUNCE_MS = 500;

// Server-managed/computed fields that are part of the Formik deposit schema but
// are owned by the backend or Redux (populated from the API / files store, not
// edited by the user). They must never be rehydrated from a stale localStorage
// snapshot: stripping them on save keeps the snapshot lean, and overlaying
// them from live state on restore prevents downstream consumers (e.g. upstream
// ShareDraftButton's `Object.keys(values.expanded)`) from blowing up when a
// restored snapshot would otherwise leave them undefined.
// `files.count` is mirrored from Redux `files.entries` by SyncFilesCountFromRedux.
const SERVER_MANAGED_FORMIK_KEYS = ["expanded", "links"];
const COMPARE_IGNORE_KEYS = ["ui", ...SERVER_MANAGED_FORMIK_KEYS, "files.count"];

const stripServerManagedKeys = (values) => {
  if (!values || typeof values !== "object") return values;
  const result = { ...values };
  for (const key of SERVER_MANAGED_FORMIK_KEYS) {
    delete result[key];
  }
  if (result.files && typeof result.files === "object") {
    result.files = { ...result.files };
    delete result.files.count;
  }
  return result;
};

const overlayServerManagedKeys = (snapshot, record, fileEntryCount) => {
  const overlay = {};
  for (const key of SERVER_MANAGED_FORMIK_KEYS) {
    if (record && record[key] !== undefined) {
      overlay[key] = record[key];
    }
  }
  const merged = { ...snapshot, ...overlay };
  if (fileEntryCount !== undefined) {
    merged.files = { ...(merged.files ?? {}), count: fileEntryCount };
  }
  return merged;
};

/** Custom hook for recovering form values from local storage
 *
 * @param {Object} currentUserprofile
 * @param {string} currentFormPage - Current form page id
 * @returns {Object} recoveryAsked, confirmModalRef, recoveredStorageValues, storageDataPresent
 */
function useLocalStorageRecovery(currentUserprofile, currentFormPage) {
  const user = currentUserprofile.id;
  const [recoveryAsked, setRecoveryAsked] = useState(false);
  const confirmModalRef = useRef();
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);
  const [storageDataPresent, setStorageDataPresent] = useState(false);
  const { values, initialValues, isSubmitting, resetForm } = useFormikContext();
  const storageValuesKey = `rdmDepositFormValues.${user}.${initialValues?.id}`;
  const storageValuesDefaultKey = `rdmDepositFormValues.${user}.undefined`;
  const autosaveTimeoutRef = useRef(null);
  const store = useStore();

  // handler for recoveryAsked
  // focus first element when modal is closed to allow keyboard navigation
  const handleRecoveryAsked = useCallback(() => {
    setRecoveryAsked(true);
    focusFirstElement(currentFormPage, true);
  }, [currentFormPage]);

  // keep changed form values in local storage (debounced so rapid edits
  // collapse into a single write once the user pauses). Server-managed keys
  // are ignored here so that fresh server-side updates to e.g. `expanded` or
  // `links` don't trigger spurious autosaves with no user content change.
  useEffect(() => {
    if (!recoveryAsked) return;
    if (areDeeplyEqual(initialValues, values, COMPARE_IGNORE_KEYS)) return;

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
  // COMPARE_IGNORE_KEYS (server-managed paths we strip on save and overlay
  // from live state on restore — see handleStorageData).
  useEffect(() => {
    const storageValues = window.localStorage.getItem(storageValuesKey);
    const storageValuesObj = JSON.parse(storageValues);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, initialValues, COMPARE_IGNORE_KEYS)
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
    // Clear any values stored before the record had a recid;
    // This will wipe 1st drafts of previous records, but otherwise
    // we will end up with counterintuitive offers to restore after
    // saving or publishing.
    window.localStorage.removeItem(storageValuesDefaultKey);
  }, [isSubmitting]);

  const handleStorageData = useCallback(
    (recover) => {
      if (recover) {
        // Overlay server-managed keys from the live record onto the recovered
        // snapshot. The snapshot intentionally omits these (we strip them on
        // save), and pre-existing snapshots saved by older code may have stale
        // copies; either way, the live Redux record is the source of truth.
        // Keep the snapshot in localStorage on accept so a reload without
        // further edits can still offer recovery; submit clears it.
        const reduxState = store.getState();
        const liveRecord = reduxState.deposit?.record ?? {};
        const fileEntryCount = Object.keys(reduxState.files?.entries ?? {}).length;
        const merged = overlayServerManagedKeys(
          recoveredStorageValues,
          liveRecord,
          fileEntryCount
        );
        async function doSetInitialValues() {
          resetForm({ values: merged });
        }
        doSetInitialValues();
        setRecoveredStorageValues(null);
        focusFirstElement(currentFormPage, true);
      } else {
        // Decline: drop the snapshot so we don't re-prompt on the next visit.
        window.localStorage.removeItem(
          `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`
        );
      }
    },
    [currentFormPage, currentUserprofile.id, recoveredStorageValues, resetForm, store, values.id]
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
