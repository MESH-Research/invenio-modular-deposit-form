// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Fork of `@js/invenio_rdm_records/src/deposit/store.js` (Invenio-RDM-Records).
// Used by `replacement_components/patched_rdm/deposit/DepositFormApp.js` instead of
// the upstream module so the modular deposit form can customize Redux wiring.
//
// Changes from upstream:
// - `rootReducer` is defined here (not imported from upstream) so the deposit slice
//   uses `./depositReducer.js`, which wraps the stock deposit reducer and promotes
//   UI permissions after save when the page was loaded without a persisted record.
// - `preloadFiles`, `configureStore`, and initial state shape are otherwise the same
//   as upstream.
//
// See `depositReducer.js` for permission promotion details (`can_manage` on first
// persist, `can_delete_draft` on every successful `DRAFT_SAVE_SUCCEEDED`).

import _cloneDeep from "lodash/cloneDeep";
import _get from "lodash/get";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { computeDepositState } from "@js/invenio_rdm_records/src/deposit/state/reducers/deposit";
import fileReducer from "@js/invenio_rdm_records/src/deposit/state/reducers/files";
import { UploadState } from "@js/invenio_rdm_records/src/deposit/state/reducers/files";
import { DRAFT_LOADED_WITH_VALIDATION_ERRORS } from "@js/invenio_rdm_records/src/deposit/state/types";
import depositReducer from "./depositReducer";

const rootReducer = combineReducers({
  deposit: depositReducer,
  files: fileReducer,
});

const preloadFiles = (files) => {
  const _files = _cloneDeep(files);
  return {
    links: files.links || {},
    entries: _get(_files, "entries", [])
      .map((file) => {
        const fileState = {
          file_id: file.file_id,
          name: file.key,
          size: file.size || 0,
          checksum: file.checksum || "",
          links: file.links || {},
          mimetype: file.mimetype || "application/octet-stream",
          status: UploadState[file.status],
        };

        return {
          progressPercentage: fileState.status === UploadState.completed ? 100 : 0,
          ...fileState,
        };
      })
      .reduce((acc, current) => {
        acc[current.name] = { ...current };
        return acc;
      }, {}),
  };
};

export function configureStore(appConfig) {
  const { record, errors, preselectedCommunity, files, config, permissions, ...extra } =
    appConfig;

  const _preselectedCommunity = preselectedCommunity || undefined;
  const initialDepositState = {
    record,
    errors: errors || {},
    editorState: computeDepositState(record, _preselectedCommunity),
    config,
    permissions,
    actionState: errors ? DRAFT_LOADED_WITH_VALIDATION_ERRORS : null,
    actionStateExtra: {},
  };

  const preloadedState = {
    deposit: initialDepositState,
    files: preloadFiles(files || {}),
  };

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(thunk.withExtraArgument({ config, ...extra })))
  );
}
