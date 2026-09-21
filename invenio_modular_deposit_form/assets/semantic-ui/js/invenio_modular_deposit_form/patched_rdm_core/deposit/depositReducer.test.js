// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026 MESH Research

import { DepositStatus } from "@js/invenio_rdm_records/src/deposit/state/reducers/deposit";
import {
  DRAFT_FETCHED,
  DRAFT_SAVE_SUCCEEDED,
} from "@js/invenio_rdm_records/src/deposit/state/types";
import depositReducer, { applyPostSavePermissionUpdates } from "./depositReducer";

const initialRecord = {
  metadata: { title: "Test" },
  status: DepositStatus.DRAFT,
  files: { enabled: false },
};

const savedRecord = {
  ...initialRecord,
  id: "abc-123",
  parent: { id: "parent-1" },
};

describe("applyPostSavePermissionUpdates", () => {
  it("promotes can_manage on first persist via DRAFT_FETCHED", () => {
    const previous = {
      record: initialRecord,
      permissions: { can_manage: false, can_delete_draft: false },
    };
    const next = {
      record: savedRecord,
      permissions: { can_manage: false, can_delete_draft: false },
    };

    const result = applyPostSavePermissionUpdates(previous, next, {
      type: DRAFT_FETCHED,
      payload: { data: savedRecord },
    });

    expect(result.permissions.can_manage).toBe(true);
    expect(result.permissions.can_delete_draft).toBe(false);
  });

  it("promotes can_manage and can_delete_draft on DRAFT_SAVE_SUCCEEDED", () => {
    const previous = {
      record: initialRecord,
      permissions: { can_manage: false, can_delete_draft: false },
    };
    const next = {
      record: savedRecord,
      permissions: { can_manage: false, can_delete_draft: false },
    };

    const result = applyPostSavePermissionUpdates(previous, next, {
      type: DRAFT_SAVE_SUCCEEDED,
      payload: { data: savedRecord },
    });

    expect(result.permissions.can_manage).toBe(true);
    expect(result.permissions.can_delete_draft).toBe(true);
  });

  it("promotes only can_delete_draft when draft already had an id", () => {
    const previous = {
      record: savedRecord,
      permissions: { can_manage: true, can_delete_draft: false },
    };
    const next = {
      record: { ...savedRecord, metadata: { title: "Updated" } },
      permissions: { can_manage: true, can_delete_draft: false },
    };

    const result = applyPostSavePermissionUpdates(previous, next, {
      type: DRAFT_SAVE_SUCCEEDED,
      payload: { data: next.record },
    });

    expect(result.permissions.can_manage).toBe(true);
    expect(result.permissions.can_delete_draft).toBe(true);
  });

  it("does not promote permissions for published records", () => {
    const published = { ...savedRecord, status: DepositStatus.PUBLISHED };
    const previous = {
      record: savedRecord,
      permissions: { can_manage: false, can_delete_draft: false },
    };
    const next = {
      record: published,
      permissions: { can_manage: false, can_delete_draft: false },
    };

    const result = applyPostSavePermissionUpdates(previous, next, {
      type: DRAFT_SAVE_SUCCEEDED,
      payload: { data: published },
    });

    expect(result).toBe(next);
  });
});

describe("depositReducer integration", () => {
  const baseState = {
    record: initialRecord,
    permissions: { can_manage: false, can_delete_draft: false },
    editorState: { selectedCommunity: undefined, ui: {}, actions: {} },
    config: {},
    errors: {},
    actionState: null,
    actionStateExtra: {},
  };

  it("wraps DRAFT_SAVE_SUCCEEDED with permission promotion", () => {
    const result = depositReducer(baseState, {
      type: DRAFT_SAVE_SUCCEEDED,
      payload: { data: savedRecord },
    });

    expect(result.record.id).toBe("abc-123");
    expect(result.permissions.can_manage).toBe(true);
    expect(result.permissions.can_delete_draft).toBe(true);
  });
});
