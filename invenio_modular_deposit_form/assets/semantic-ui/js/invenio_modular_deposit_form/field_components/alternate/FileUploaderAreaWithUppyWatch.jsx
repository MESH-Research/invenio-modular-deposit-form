// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Grid } from "semantic-ui-react";

import { useUppyFileIntegrityCheck } from "./file_uploader_components/uppyTransferIntegrity";

import { FORM_UI_ACTION } from "../../helpers/formUIStateReducer";
import { useFormUIState } from "../../FormUIStateManager.jsx";

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

function useUppyConfirmModal(uppy) {
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
}

/**
 * Whether Uppy has files added to the Dashboard that have not started uploading.
 *
 * With `autoProceed: false`, users must click the Dashboard upload button; until then
 * files sit in Uppy's queue with `progress.uploadStarted` falsy and never reach Redux/Formik.
 *
 * @param {import("@uppy/core").Uppy | null | undefined} uppy
 * @returns {boolean}
 */
function hasUnconfirmedUppyFiles(uppy) {
  if (!uppy || typeof uppy.getFiles !== "function") {
    return false;
  }
  return uppy.getFiles().some((file) => !file?.progress?.uploadStarted);
}

/**
 * Overridable for `ReactInvenioDeposit.FileUploader.FileUploaderArea.container`.
 *
 * Re-renders the default `Grid.Row` children and, when Uppy is present:
 * - keeps `formUIState.hasUnconfirmedUppyUploads` in sync with staged files
 * - disables part `Content-MD5` (AWS SigV4 / pre-signed URL compatibility)
 * - hashes each local file and compares to the post-commit `md5:` checksum
 *
 * Stock (non-Uppy) FileUploader does not pass `uppy`; the flag stays false.
 *
 * @param {Object} props
 * @param {Object} [props.uppy] - Uppy instance from UppyUploader (absent for stock FileUploader)
 * @param {Function} [props.deleteFile] - Redux delete action bound for Uppy files
 * @param {React.ReactNode} [props.children] - Default area content (list + Dashboard)
 * @param {string} [props.className] - From the overridden `Grid.Row`
 * @param {boolean} [props.stretched] - From the overridden `Grid.Row` (Uppy area)
 */
function FileUploaderAreaWithUppyWatch({ uppy, deleteFile, children, className, stretched }) {
  useUppyFileIntegrityCheck(uppy, deleteFile);
  useUppyConfirmModal(uppy);

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
  deleteFile: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  stretched: PropTypes.bool,
};

export { FileUploaderAreaWithUppyWatch, hasUnconfirmedUppyFiles, useUppyConfirmModal };
