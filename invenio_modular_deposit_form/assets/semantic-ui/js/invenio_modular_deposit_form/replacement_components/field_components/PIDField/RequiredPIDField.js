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

export class RequiredPIDField extends Component {
  constructor(props) {
    super(props);

    const { canBeManaged, canBeUnmanaged, record, field } = this.props;
    this.canBeManagedAndUnmanaged = canBeManaged && canBeUnmanaged;
    const value = field?.value;
    const isInternalProvider = value?.provider !== PROVIDER_EXTERNAL;
    const isDraft = record?.is_draft === true;
    const hasIdentifier = value?.identifier;
    const isManagedSelected =
      isDraft && hasIdentifier && isInternalProvider ? true : undefined;

    this.state = {
      isManagedSelected: isManagedSelected,
    };
  }

  onExternalIdentifierChanged = (identifier) => {
    const { form, fieldPath } = this.props;

    const pid = {
      identifier: identifier,
      provider: PROVIDER_EXTERNAL,
    };

    this.debounced && this.debounced.cancel();
    this.debounced = _debounce(() => {
      form.setFieldValue(fieldPath, pid);
    }, UPDATE_PID_DEBOUNCE_MS);
    this.debounced();
  };

  render() {
    const { isManagedSelected } = this.state;
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
      pidLabel,
      pidIcon,
      pidPlaceholder,
      required,
      unmanagedHelpText,
      pidType,
      field,
      record,
    } = this.props;

    let { doiDefaultSelection } = this.props;

    const value = field.value || {};
    const currentIdentifier = value.identifier || "";
    const currentProvider = value.provider || "";

    let managedIdentifier = "",
      unmanagedIdentifier = "";
    if (currentIdentifier !== "") {
      const isProviderExternal = currentProvider === PROVIDER_EXTERNAL;
      managedIdentifier = !isProviderExternal ? currentIdentifier : "";
      unmanagedIdentifier = isProviderExternal ? currentIdentifier : "";
    }

    const hasManagedIdentifier = managedIdentifier !== "";
    const doi = record?.pids?.doi?.identifier || "";
    const parentDoi = record.parent?.pids?.doi?.identifier || "";

    const hasDoi = doi !== "";
    const hasParentDoi = parentDoi !== "";
    const isDoiCreated = currentIdentifier !== "";

    const _isManagedSelected =
      isManagedSelected === undefined
        ? hasManagedIdentifier ||
          (currentIdentifier === "" && doiDefaultSelection === "no")
        : isManagedSelected;

    const fieldError = getFieldErrorsForDisplay(form, fieldPath, field);

    return (
      <>
        <Form.Field
          required={required || hasParentDoi}
          error={fieldError ? true : false}
        >
          <FieldLabel htmlFor={fieldPath} icon={pidIcon} label={fieldLabel} />
        </Form.Field>

        {this.canBeManagedAndUnmanaged && (
          <ManagedUnmanagedSwitch
            disabled={
              (isEditingPublishedRecord || hasManagedIdentifier) &&
              (hasDoi || isDoiCreated)
            }
            isManagedSelected={_isManagedSelected}
            onManagedUnmanagedChange={(userSelectedManaged) => {
              if (userSelectedManaged) {
                form.setFieldValue("pids", {});
              } else {
                this.onExternalIdentifierChanged("");
              }
              form.setFieldError(fieldPath, false);
              this.setState({
                isManagedSelected: userSelectedManaged,
              });
            }}
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
            helpText={managedHelpText}
            pidPlaceholder={pidPlaceholder}
            pidType={pidType}
            pidLabel={pidLabel}
          />
        )}

        {canBeUnmanaged && !_isManagedSelected && (
          <UnmanagedIdentifierCmp
            identifier={unmanagedIdentifier}
            onIdentifierChanged={(identifier) => {
              this.onExternalIdentifierChanged(identifier);
            }}
            field={field}
            form={form}
            fieldPath={fieldPath}
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
  pidIcon: PropTypes.string.isRequired,
  pidLabel: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  pidType: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  unmanagedHelpText: PropTypes.string,
  record: PropTypes.object.isRequired,
  doiDefaultSelection: PropTypes.object.isRequired,
};

RequiredPIDField.defaultProps = {
  managedHelpText: null,
  unmanagedHelpText: null,
  field: undefined,
};
