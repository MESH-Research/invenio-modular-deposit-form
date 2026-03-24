// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Upstream: `.../Identifiers/PIDField/OptionalPIDField.js`
//
// Same structural reasons as `RequiredPIDField.js`: stock uses `./components` and
// `../../../state/types` paths that do not resolve from this package; identifier UIs
// and error visibility are supplied locally under `pid_components/`.
//
// Differences vs stock:
// - `OptionalDOIoptions`: deep-import from `@js/invenio_rdm_records/.../OptionalDOIoptions`
//   (same component as upstream).
// - `SET_DOI_NEEDED`: import from `@js/invenio_rdm_records/.../deposit/state/types`
//   instead of a relative path into `invenio_rdm_records` source.
// - `ManagedIdentifierCmp` / `UnmanagedIdentifierCmp`: `./pid_components/*` (see there).
// - `getFieldErrorsForDisplay` instead of `getFieldErrors` for the label row + FeedbackLabel
//   column visibility; pass `field` through to identifier components.
// - `field` added to `render()` destructure so `getFieldErrorsForDisplay` receives Formik’s
//   `field` from the FastField render props.

import _debounce from "lodash/debounce";
import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { FieldLabel, FeedbackLabel } from "react-invenio-forms";
import { Form, Grid } from "semantic-ui-react";
import { OptionalDOIoptions } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/PIDField/components/OptionalDOIoptions";
import { SET_DOI_NEEDED } from "@js/invenio_rdm_records/src/deposit/state/types";
import { ManagedIdentifierCmp } from "./pid_components/ManagedIdentifierCmp";
import { UnmanagedIdentifierCmp } from "./pid_components/UnmanagedIdentifierCmp";
import { getFieldErrorsForDisplay } from "./pid_components/fieldErrorsForDisplay";

const PROVIDER_EXTERNAL = "external";
const UPDATE_PID_DEBOUNCE_MS = 200;

class OptionalPIDFieldCmp extends Component {
  constructor(props) {
    super(props);

    const { canBeManaged, canBeUnmanaged, record, field } = this.props;
    this.canBeManagedAndUnmanaged = canBeManaged && canBeUnmanaged;
    const value = field?.value;
    const isDraft = record?.is_draft === true;
    const hasIdentifier = value?.identifier;
    const hasInternalProvider = hasIdentifier && value?.provider !== PROVIDER_EXTERNAL;
    const isManagedSelected = isDraft && hasInternalProvider ? true : undefined;

    this.state = {
      isManagedSelected: isManagedSelected,
      isNoNeedSelected: undefined,
    };
  }

  componentDidMount() {
    const { required, setNoINeedDOI } = this.props;
    const { _isManagedSelected } = this.computeManagedUnmanaged();
    if (_isManagedSelected) {
      if (!required) {
        setNoINeedDOI(true);
      }
    } else {
      setNoINeedDOI(false);
    }
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

  computeManagedUnmanaged = () => {
    const { isManagedSelected, isNoNeedSelected } = this.state;
    const { field, record, doiDefaultSelection } = this.props;

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
    const hasUnmanagedIdentifier = unmanagedIdentifier !== "";
    const doi = record?.pids?.doi?.identifier || "";
    const parentDoi = record.parent?.pids?.doi?.identifier || "";

    const hasDoi = doi !== "";
    const hasParentDoi = parentDoi !== "";
    const isDraft = record.is_draft;

    const _isUnmanagedSelected =
      isManagedSelected === undefined
        ? hasUnmanagedIdentifier ||
          (currentIdentifier === "" && doiDefaultSelection === "yes")
        : !isManagedSelected;

    const _isManagedSelected =
      isManagedSelected === undefined
        ? hasManagedIdentifier ||
          (currentIdentifier === "" && doiDefaultSelection === "no")
        : isManagedSelected;

    const _isNoNeedSelected =
      isNoNeedSelected === undefined
        ? (!_isManagedSelected && !_isUnmanagedSelected) ||
          (isDraft !== true &&
            currentIdentifier === "" &&
            doiDefaultSelection === "not_needed")
        : isNoNeedSelected;

    return {
      managedIdentifier,
      unmanagedIdentifier,
      hasDoi,
      hasParentDoi,
      _isManagedSelected,
      _isUnmanagedSelected,
      _isNoNeedSelected,
    };
  };

  handleManagedUnmanagedChange = (userSelectedManaged, userSelectedNoNeed) => {
    const { form, fieldPath, required, setNoINeedDOI } = this.props;
    if (userSelectedManaged) {
      form.setFieldValue("pids", {});
      if (!required) {
        setNoINeedDOI(true);
      }
    } else if (userSelectedNoNeed) {
      form.setFieldValue("pids", {});
      setNoINeedDOI(false);
    } else {
      this.onExternalIdentifierChanged("");
      setNoINeedDOI(false);
    }
    form.setFieldError(fieldPath, false);
    this.setState({
      isManagedSelected: userSelectedManaged,
      isNoNeedSelected: userSelectedNoNeed,
    });
  };

  render() {
    const {
      btnLabelDiscardPID,
      btnLabelGetPID,
      canBeManaged,
      canBeUnmanaged,
      field,
      form,
      fieldPath,
      fieldLabel,
      managedHelpText,
      pidLabel,
      pidIcon,
      pidPlaceholder,
      required,
      unmanagedHelpText,
      pidType,
      optionalDOItransitions,
      publishedDOI,
    } = this.props;

    const {
      managedIdentifier,
      unmanagedIdentifier,
      hasParentDoi,
      _isManagedSelected,
      _isNoNeedSelected,
    } = this.computeManagedUnmanaged();

    const fieldError = getFieldErrorsForDisplay(form, fieldPath, field);
    const hasPublishedManagedDOI =
      publishedDOI?.identifier && publishedDOI?.provider !== PROVIDER_EXTERNAL;
    const isManagedProviderAllowed = _isEmpty(optionalDOItransitions)
      ? true
      : optionalDOItransitions?.allowed_providers?.some(
          (val) => !["external", "not_needed"].includes(val)
        );

    return (
      <>
        <Form.Field
          required={required || hasParentDoi}
          error={fieldError ? true : false}
        >
          <Grid>
            <Grid.Column width={5}>
              <FieldLabel htmlFor={fieldPath} icon={pidIcon} label={fieldLabel} />
            </Grid.Column>
            {fieldError && (
              <Grid.Column width={11}>
                <FeedbackLabel fieldPath={fieldPath} />
              </Grid.Column>
            )}
          </Grid>
        </Form.Field>

        {this.canBeManagedAndUnmanaged && (
          <OptionalDOIoptions
            optionalDOItransitions={optionalDOItransitions}
            isManagedSelected={_isManagedSelected}
            isNoNeedSelected={_isNoNeedSelected}
            onManagedUnmanagedChange={this.handleManagedUnmanagedChange}
            pidLabel={pidLabel}
            required={required}
          />
        )}

        {canBeManaged && _isManagedSelected && (
          <ManagedIdentifierCmp
            disabled={hasPublishedManagedDOI || !isManagedProviderAllowed}
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

        {canBeUnmanaged && (!_isManagedSelected || _isNoNeedSelected) && (
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
            disabled={_isNoNeedSelected}
          />
        )}
      </>
    );
  }
}

OptionalPIDFieldCmp.propTypes = {
  field: PropTypes.object,
  form: PropTypes.object.isRequired,
  btnLabelDiscardPID: PropTypes.string.isRequired,
  btnLabelGetPID: PropTypes.string.isRequired,
  canBeManaged: PropTypes.bool.isRequired,
  canBeUnmanaged: PropTypes.bool.isRequired,
  fieldPath: PropTypes.string.isRequired,
  fieldLabel: PropTypes.string.isRequired,
  managedHelpText: PropTypes.string,
  pidIcon: PropTypes.string.isRequired,
  pidLabel: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string.isRequired,
  pidType: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  unmanagedHelpText: PropTypes.string,
  record: PropTypes.object.isRequired,
  doiDefaultSelection: PropTypes.object.isRequired,
  optionalDOItransitions: PropTypes.object.isRequired,
  publishedDOI: PropTypes.object,
  setNoINeedDOI: PropTypes.func.isRequired,
};

OptionalPIDFieldCmp.defaultProps = {
  managedHelpText: null,
  unmanagedHelpText: null,
  field: undefined,
  publishedDOI: {},
};

const mapStateToProps = (state) => ({
  publishedDOI: state.deposit.config?.published_record?.pids?.doi,
});

export const OptionalPIDField = connect(mapStateToProps, (dispatch) => {
  return {
    setNoINeedDOI: (value) =>
      dispatch({
        type: SET_DOI_NEEDED,
        payload: { noINeedDOI: value },
      }),
  };
})(OptionalPIDFieldCmp);
