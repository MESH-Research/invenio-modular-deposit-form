// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

/**
 * Subscribes to Redux `files.entries` and mirrors its length into Formik `values.files.count` so
 * Yup (and anything else reading Formik) stays aligned with upload state before the next draft
 * save/refetch updates the record.
 *
 * This is a **render-null subscription** component: it mounts next to the file UI (not a wrapper
 * or HOC). This allows us to add related behaviour to the file upload field without having to
 * modify the field component.
 * 
 * @returns {null}
 */
function SyncFilesCountFromRedux() {
  const { setFieldValue, values } = useFormikContext();
  const entryCount = useSelector(
    (state) => Object.keys(state.files?.entries ?? {}).length
  );
  useEffect(() => {
    const current = values?.files?.count;
    if (Number(current) !== entryCount) {
      setFieldValue("files.count", entryCount);
    }
  }, [entryCount, setFieldValue, values?.files?.count]);
  return null;
}

export { SyncFilesCountFromRedux };
