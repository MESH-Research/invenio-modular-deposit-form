// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import defaultDepositReducer, {
  DepositStatus,
} from "@js/invenio_rdm_records/src/deposit/state/reducers/deposit";
import {
  DRAFT_FETCHED,
  DRAFT_SAVE_SUCCEEDED,
} from "@js/invenio_rdm_records/src/deposit/state/types";

const PUBLISHED_STATUSES = new Set([
  DepositStatus.PUBLISHED,
  DepositStatus.NEW_VERSION_DRAFT,
]);

/**
 * Promote deposit UI permissions after a successful save when the initial page
 * payload was computed without a persisted record (new upload).
 *
 * - `can_manage`: first time the draft gains an `id` (including mid-save
 *   `DRAFT_FETCHED` when a community review is created).
 * - `can_delete_draft`: any successful `DRAFT_SAVE_SUCCEEDED` while still a draft.
 *
 * @param {object} previousDepositState - deposit slice before the action
 * @param {object} nextDepositState - deposit slice after the stock reducer
 * @param {object} action - Redux action
 * @returns {object} deposit slice, possibly with updated permissions
 */
function applyPostSavePermissionUpdates(previousDepositState, nextDepositState, action) {
  const { record } = nextDepositState;

  if (!record?.id || PUBLISHED_STATUSES.has(record.status)) {
    return nextDepositState;
  }

  const isFirstPersist =
    !previousDepositState.record?.id &&
    (action.type === DRAFT_FETCHED || action.type === DRAFT_SAVE_SUCCEEDED);

  if (action.type === DRAFT_FETCHED && isFirstPersist) {
    return {
      ...nextDepositState,
      permissions: {
        ...(nextDepositState.permissions ?? {}),
        can_manage: true,
      },
    };
  }

  if (action.type === DRAFT_SAVE_SUCCEEDED) {
    return {
      ...nextDepositState,
      permissions: {
        ...(nextDepositState.permissions ?? {}),
        ...(isFirstPersist ? { can_manage: true } : {}),
        can_delete_draft: true,
      },
    };
  }

  return nextDepositState;
}

/**
 * Stock deposit reducer with post-save permission promotion for the modular form.
 */
function depositReducer(state = {}, action) {
  const nextState = defaultDepositReducer(state, action);
  return applyPostSavePermissionUpdates(state, nextState, action);
}

export { applyPostSavePermissionUpdates };
export default depositReducer;
