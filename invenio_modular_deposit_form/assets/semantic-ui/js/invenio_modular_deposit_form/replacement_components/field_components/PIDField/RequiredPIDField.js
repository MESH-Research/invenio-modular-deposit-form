// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Upstream: `.../Identifiers/PIDField/RequiredPIDField.js`
//
// Why not only `@js/invenio_rdm_records`? Stock imports `ManagedIdentifierCmp`,
// `ManagedUnmanagedSwitch`, and `UnmanagedIdentifierCmp` from `./components` and uses
// `getFieldErrors` from `./components/helpers`. From inside this package, `./components`
// does not exist on disk at the same relative path, and we need local identifier
// components that gate visible errors on touched state (see `pid_components/`).
//
// Differences vs stock (behavioral):
// - `ManagedUnmanagedSwitch`: import the stock implementation via deep path
//   `@js/invenio_rdm_records/.../ManagedUnmanagedSwitch` (unchanged component).
// - `ManagedIdentifierCmp` / `UnmanagedIdentifierCmp`: imported from `./pid_components/*`
//   (local copies; see those files).
// - Label row error: stock uses `getFieldErrors(form, fieldPath)` so errors can show
//   before touch. Here `getFieldErrorsForDisplay(form, fieldPath, field)` matches the
//   visibility rules used by `replacement_components/TextField.js`.
// - Pass `field` into both identifier components so they can apply the same rule.
// - When the managed/unmanaged radio changes, call `setFieldTouched(fieldPath, false, false)` so
//   the PID is not touched and validation is not run for that call (`getFieldErrorsForDisplay` stays
//   quiet until blur / identifier change).
// - **PID defaults (mount):** `applyRequiredPidDefaultsOnMount` runs `getFreshManagedSelection`
//   (persist / infer `ui.<fieldPath>.managed_selection`), then `handleEmptyPid(branch)` (empty-id
//   `pids.<scheme>` shape **gated by branch**: external placeholder only when **unmanaged**;
//   managed stale clear only when **managed**), then `ensureDraftPidBackups(branch, pidValue)`.
//   See `replacement_field_components.md` (PIDField).
// - **Radio vs remount:** same storage shape as `OptionalPIDField` for DOI: `managed_selection`
//   lives under `values.ui.<fieldPath>` (`managed` / `unmanaged`). Toggles and mount seeding
//   keep it set; `render` reads only that key for the switch (not local React state).
// - **Reinit after reserve:** `ui` is not on the server payload, so `managed_selection` can
//   become `undefined` after Formik `enableReinitialize`. When unset, infer from `pids.<scheme>`:
//   non-empty identifier + `provider !== "external"` → `managed`; identifier + `external` →
//   `unmanaged`; empty identifier → `doiDefaultSelection` as before.
// - **Backups:** `draft_unmanaged_pid_backup` / `draft_managed_pid_backup` under
//   `values.ui.<fieldPath>`. On mount, the **active** branch’s backup is set from current
//   `pids.<scheme>` when that backup key is still `undefined`. Unmanaged typing updates both
//   `pids` and the unmanaged backup (debounced). While managed is selected, `backUpReservedPid`
//   in `componentDidUpdate` updates `draft_managed_pid_backup` when the PID object **reference**
//   changes (reserve/discard).
// - **Switch `disabled` (parity with stock):** `hasDoi` from `record.pids.doi.identifier`;
//   `isDoiCreated` from draft `field.value.identifier` (see render).

import { getIn } from "formik";
import _debounce from "lodash/debounce";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { FieldLabel } from "react-invenio-forms";
import { Form } from "semantic-ui-react";
import { ManagedUnmanagedSwitch } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/PIDField/components/ManagedUnmanagedSwitch";
import { ManagedIdentifierCmp } from "./pid_components/ManagedIdentifierCmp";
import { UnmanagedIdentifierCmp } from "./pid_components/UnmanagedIdentifierCmp";
import { getFieldErrorsForDisplay } from "./pid_components/fieldErrorsForDisplay";

const PROVIDER_EXTERNAL = "external";
const UPDATE_PID_DEBOUNCE_MS = 200;

/** Same string values as `OptionalPIDField` (`managed` / `unmanaged`). */
const RADIO_CHOICE_ENUM = {
  UNMANAGED: "unmanaged",
  MANAGED: "managed",
};

/**
 * Required PID (e.g. DOI) field: managed vs unmanaged UI from stock, with
 * `getFieldErrorsForDisplay` on the label row and identifier components.
 * Persists radio branch in `values.ui.<fieldPath>.managed_selection` and restores from
 * `draft_*_pid_backup` under the same `ui` path when toggling (see file header).
 * Calls `setFieldTouched(fieldPath, false, false)` on managed/unmanaged radio change.
 */
export class RequiredPIDField extends Component {
  constructor(props) {
    super(props);

    const { canBeManaged, canBeUnmanaged } = props;
    this.canBeManagedAndUnmanaged = canBeManaged && canBeUnmanaged;
  }

  componentDidMount() {
    this.applyRequiredPidDefaultsOnMount();
  }

  componentDidUpdate(prevProps) {
    const branch = this.getFreshManagedSelection();
    const pidValue = this.handleEmptyPid(branch);
    this.ensureDraftPidBackups(branch, pidValue);
    this.backUpReservedPid(prevProps);
  }

  onUnmanagedIdentifierChanged = (newIdentifier) => {
    const { form, fieldPath } = this.props;
    const ui = `ui.${fieldPath}`;

    const pid = {
      identifier: newIdentifier,
      provider: PROVIDER_EXTERNAL,
    };

    this.debounced && this.debounced.cancel();
    this.debounced = _debounce(() => {
      form.setFieldValue(fieldPath, pid);
      form.setFieldValue(`${ui}.draft_unmanaged_pid_backup`, pid);
    }, UPDATE_PID_DEBOUNCE_MS);
    this.debounced();
  };

  /**
   * Ensure that on radio change the previous value is restored or default set.
   */
  restoreFromBackup = (userSelectedManaged) => {
    const { form, fieldPath } = this.props;
    const ui = `ui.${fieldPath}`;

    const backupField = !userSelectedManaged
      ? "draft_unmanaged_pid_backup"
      : "draft_managed_pid_backup";
    const backup = getIn(form.values, `${ui}.${backupField}`);
    const fallback = !userSelectedManaged ? { identifier: "", provider: PROVIDER_EXTERNAL } : {};
    const updateValue = backup ? backup : fallback;

    form.setFieldValue(fieldPath, { ...updateValue });
  };

  /**
   * Returns `managed` / `unmanaged` (and persists when `managed_selection` was unset).
   * Pre-existing `managed_selection` is returned as-is.
   */
  getFreshManagedSelection = () => {
    const { doiDefaultSelection, form, fieldPath } = this.props;
    const ui = `ui.${fieldPath}`;
    const existing = getIn(form.values, `${ui}.managed_selection`);
    if (existing !== undefined) {
      return existing;
    }

    const currentValue = getIn(form.values, fieldPath) || {};
    const currentId = String(currentValue.identifier ?? "").trim();
    const currentProvider = currentValue.provider;

    let branch;
    if (currentId !== "") {
      branch =
        currentProvider === PROVIDER_EXTERNAL
          ? RADIO_CHOICE_ENUM.UNMANAGED
          : RADIO_CHOICE_ENUM.MANAGED;
    } else if (doiDefaultSelection === "yes") {
      branch = RADIO_CHOICE_ENUM.UNMANAGED;
    } else if (doiDefaultSelection === "no") {
      branch = RADIO_CHOICE_ENUM.MANAGED;
    } else {
      return undefined;
    }

    form.setFieldValue(`${ui}.managed_selection`, branch);
    return branch;
  };

  /**
   * Empty-id `pids.<scheme>` defaults, **gated by** `branch` from `getFreshManagedSelection`.
   * Returns canonical PID value after any writes (or current value if non-empty id).
   */
  handleEmptyPid = (branch) => {
    const { doiDefaultSelection, form, fieldPath } = this.props;
    let value = getIn(form.values, fieldPath) || {};
    const id = String(value?.identifier ?? "").trim();

    if (id !== "") {
      return { ...value };
    }

    if (branch === RADIO_CHOICE_ENUM.UNMANAGED && doiDefaultSelection === "yes") {
      if (!value?.provider || value.provider !== PROVIDER_EXTERNAL) {
        form.setFieldValue(fieldPath, { provider: PROVIDER_EXTERNAL, identifier: "" });
      }
    } else if (
      branch === RADIO_CHOICE_ENUM.MANAGED &&
      doiDefaultSelection === "no" &&
      value &&
      Object.keys(value).length > 0 &&
      value.provider !== PROVIDER_EXTERNAL
    ) {
      form.setFieldValue(fieldPath, {});
    }

    return { ...(getIn(form.values, fieldPath) || {}) };
  };

  /**
   * Initializes the active branch draft backup when still undefined (uses canonical `pidValue`).
   */
  ensureDraftPidBackups = (branch, pidValue) => {
    const { form, fieldPath } = this.props;
    const ui = `ui.${fieldPath}`;
    if (branch !== RADIO_CHOICE_ENUM.MANAGED && branch !== RADIO_CHOICE_ENUM.UNMANAGED) {
      return;
    }

    const backupField =
      branch === RADIO_CHOICE_ENUM.MANAGED
        ? "draft_managed_pid_backup"
        : "draft_unmanaged_pid_backup";
    if (getIn(form.values, `${ui}.${backupField}`) === undefined) {
      form.setFieldValue(`${ui}.${backupField}`, { ...pidValue });
    }
  };

  /**
   * When managed is selected and `pids.<scheme>` reference changes (reserve/discard), copy the
   * current PID into `draft_managed_pid_backup` even if backup was already set.
   */
  backUpReservedPid = (prevProps) => {
    const { form, fieldPath } = this.props;
    const ui = `ui.${fieldPath}`;
    if (getIn(form.values, `${ui}.managed_selection`) !== RADIO_CHOICE_ENUM.MANAGED) {
      return;
    }
    const value = getIn(form.values, fieldPath);
    if (value === getIn(prevProps.form.values, fieldPath)) {
      return;
    }
    form.setFieldValue(`${ui}.draft_managed_pid_backup`, { ...(value || {}) });
  };

  /**
   * Mount only: selection → empty PID shape (branch-aware) → draft backups.
   */
  applyRequiredPidDefaultsOnMount = () => {
    const branch = this.getFreshManagedSelection();
    const pidValue = this.handleEmptyPid(branch);
    this.ensureDraftPidBackups(branch, pidValue);
  };

  onManagedUnmanagedChange = (userSelectedManaged) => {
    const { fieldPath, form } = this.props;
    const ui = `ui.${fieldPath}`;
    this.debounced && this.debounced.cancel();

    this.restoreFromBackup(userSelectedManaged);

    const updateValue = userSelectedManaged
      ? RADIO_CHOICE_ENUM.MANAGED
      : RADIO_CHOICE_ENUM.UNMANAGED;
    form.setFieldValue(`${ui}.managed_selection`, updateValue);

    // FIXME: Is this still right?
    form.setFieldError(fieldPath, false);
    form.setFieldTouched(fieldPath, false, false);
  };

  render() {
    const {
      btnLabelDiscardPID,
      btnLabelGetPID,
      canBeManaged,
      canBeUnmanaged,
      form,
      fieldPath,
      fieldLabel,
      isEditingPublishedRecord,
      managedHelpText,
      reservedHelpText,
      pidLabel,
      pidIcon,
      pidPlaceholder,
      required,
      unmanagedHelpText,
      pidType,
      field,
      record,
    } = this.props;

    const value = field.value || {};
    const currentIdentifier = value.identifier || "";

    const parentDoi = record?.parent?.pids?.doi?.identifier || "";

    // hasDoi === pre-existing backend PID, isDoiCreated === frontend
    const hasDoi = !!record?.pids?.doi?.identifier;
    const isDoiCreated = currentIdentifier !== "";
    const hasParentDoi = parentDoi !== "";

    const _isManagedSelected =
      getIn(form.values, `ui.${fieldPath}.managed_selection`) === RADIO_CHOICE_ENUM.MANAGED;

    const managedIdentifier = _isManagedSelected ? currentIdentifier : "";
    const hasManagedIdentifier = managedIdentifier !== "";
    const managedHelptextForDisplay =
      hasManagedIdentifier && reservedHelpText != null
        ? reservedHelpText
        : managedHelpText;
    const unmanagedIdentifier = !_isManagedSelected ? currentIdentifier : "";

    const fieldError = getFieldErrorsForDisplay(form, fieldPath, field);

    return (
      <>
        <Form.Field required={required || hasParentDoi} error={fieldError ? true : false}>
          <FieldLabel htmlFor={fieldPath} icon={pidIcon} label={fieldLabel} />
        </Form.Field>

        {this.canBeManagedAndUnmanaged && (
          <ManagedUnmanagedSwitch
            disabled={
              (isEditingPublishedRecord || hasManagedIdentifier) && (hasDoi || isDoiCreated)
            }
            isManagedSelected={_isManagedSelected}
            onManagedUnmanagedChange={this.onManagedUnmanagedChange}
            pidLabel={pidLabel}
          />
        )}

        {canBeManaged && _isManagedSelected && (
          <ManagedIdentifierCmp
            disabled={hasDoi && isEditingPublishedRecord}
            btnLabelDiscardPID={btnLabelDiscardPID}
            btnLabelGetPID={btnLabelGetPID}
            field={field}
            form={form}
            fieldPath={fieldPath}
            identifier={managedIdentifier}
            helpText={managedHelptextForDisplay}
            pidPlaceholder={pidPlaceholder}
            pidType={pidType}
            pidLabel={pidLabel}
          />
        )}

        {canBeUnmanaged && !_isManagedSelected && (
          <UnmanagedIdentifierCmp
            field={field}
            form={form}
            fieldPath={fieldPath}
            identifier={unmanagedIdentifier}
            onIdentifierChanged={this.onUnmanagedIdentifierChanged}
            pidPlaceholder={pidPlaceholder}
            helpText={unmanagedHelpText}
          />
        )}
      </>
    );
  }
}

RequiredPIDField.propTypes = {
  field: PropTypes.object,
  form: PropTypes.object.isRequired,
  btnLabelDiscardPID: PropTypes.string.isRequired,
  btnLabelGetPID: PropTypes.string.isRequired,
  canBeManaged: PropTypes.bool.isRequired,
  canBeUnmanaged: PropTypes.bool.isRequired,
  fieldPath: PropTypes.string.isRequired,
  fieldLabel: PropTypes.string.isRequired,
  isEditingPublishedRecord: PropTypes.bool.isRequired,
  managedHelpText: PropTypes.string,
  reservedHelpText: PropTypes.string,
  pidIcon: PropTypes.string.isRequired,
  pidLabel: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  pidType: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  unmanagedHelpText: PropTypes.string,
  record: PropTypes.object.isRequired,
  doiDefaultSelection: PropTypes.string.isRequired,
};

RequiredPIDField.defaultProps = {
  managedHelpText: null,
  reservedHelpText: null,
  unmanagedHelpText: null,
  field: undefined,
};
