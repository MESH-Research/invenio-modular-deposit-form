// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Grid } from "semantic-ui-react";

import { useFormUIState } from "../../FormUIStateManager.jsx";
import { FORM_UI_ACTION } from "../../helpers/formUIStateReducer";

/** Uppy events that may change the unconfirmed-queue flag. */
const UPPY_UNCONFIRMED_UPLOAD_EVENTS = [
  "file-added",
  "files-added",
  "file-removed",
  "upload",
  "complete",
  "cancel-all",
  "reset-all",
];

/**
 * Whether Uppy has files added to the Dashboard that have not started uploading.
 *
 * With `autoProceed: false`, users must click the Dashboard upload button; until then
 * files sit in Uppy's queue with `progress.uploadStarted` falsy and never reach Redux/Formik.
 *
 * @param {import("@uppy/core").Uppy | null | undefined} uppy
 * @returns {boolean}
 */
export function hasUnconfirmedUppyFiles(uppy) {
  if (!uppy || typeof uppy.getFiles !== "function") {
    return false;
  }
  return uppy.getFiles().some((file) => !file?.progress?.uploadStarted);
}

/**
 * Overridable for `ReactInvenioDeposit.FileUploader.FileUploaderArea.container`.
 *
 * Re-renders the default `Grid.Row` children and, when Uppy is present, keeps
 * `formUIState.hasUnconfirmedUppyUploads` in sync with staged (not-yet-started) files.
 * Stock (non-Uppy) FileUploader does not pass `uppy`; the flag stays false.
 *
 * @param {Object} props
 * @param {Object} [props.uppy] - Uppy instance from UppyUploader (absent for stock FileUploader)
 * @param {React.ReactNode} [props.children] - Default area content (list + Dashboard)
 * @param {string} [props.className] - From the overridden `Grid.Row`
 * @param {boolean} [props.stretched] - From the overridden `Grid.Row` (Uppy area)
 */
export function FileUploaderAreaWithUppyWatch({ uppy, children, className, stretched }) {
  const { formUIDispatch } = useFormUIState();

  useEffect(() => {
    const setFlag = (value) => {
      formUIDispatch({
        type: FORM_UI_ACTION.SET_HAS_UNCONFIRMED_UPPY_UPLOADS,
        payload: value,
      });
    };

    if (!uppy) {
      setFlag(false);
      return undefined;
    }

    const sync = () => setFlag(hasUnconfirmedUppyFiles(uppy));

    UPPY_UNCONFIRMED_UPLOAD_EVENTS.forEach((eventName) => {
      uppy.on(eventName, sync);
    });
    sync();

    return () => {
      UPPY_UNCONFIRMED_UPLOAD_EVENTS.forEach((eventName) => {
        uppy.off(eventName, sync);
      });
      setFlag(false);
    };
  }, [uppy, formUIDispatch]);

  // files.enabled false → Overridable children are falsy; mirror stock (render nothing).
  if (children == null && className == null && stretched == null) {
    return null;
  }

  return (
    <Grid.Row stretched={stretched} className={className}>
      {children}
    </Grid.Row>
  );
}

FileUploaderAreaWithUppyWatch.propTypes = {
  uppy: PropTypes.object,
  children: PropTypes.node,
  className: PropTypes.string,
  stretched: PropTypes.bool,
};
