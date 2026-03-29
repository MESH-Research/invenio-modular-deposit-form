// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Invenio Modular Deposit Form — notes
// -----------------------------
// Upstream: `.../Identifiers/PIDField/PIDFieldCmp.js`
//
// Purpose of this copy: the component body is unchanged from stock (FastField + required ?
// RequiredPIDField : OptionalPIDField). It must live in this package so `RequiredPIDField`
// and `OptionalPIDField` resolve to the local siblings next to this file, not to
// `invenio_rdm_records`’s `./RequiredPIDField` (those siblings import `pid_components/*`
// for touched-sensitive errors and `@js/...` paths that only work from the modular bundle).
//
// What differs from stock: only the import targets (`./RequiredPIDField`, `./OptionalPIDField`)
// refer to this repo’s implementations; see those files for behavioral deltas.

import { FastField } from "formik";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { RequiredPIDField } from "./RequiredPIDField";
import { OptionalPIDField } from "./OptionalPIDField";

export class PIDField extends Component {
  constructor(props) {
    super(props);

    this.validatePropValues();
  }

  validatePropValues = () => {
    const { canBeManaged, canBeUnmanaged, fieldPath } = this.props;

    if (!canBeManaged && !canBeUnmanaged) {
      throw Error(`${fieldPath} must be managed, unmanaged or both.`);
    }
  };

  render() {
    const { fieldPath, required } = this.props;
    const cmp = required ? RequiredPIDField : OptionalPIDField;

    return <FastField name={fieldPath} component={cmp} {...this.props} />;
  }
}

PIDField.propTypes = {
  btnLabelDiscardPID: PropTypes.string,
  btnLabelGetPID: PropTypes.string,
  canBeManaged: PropTypes.bool,
  canBeUnmanaged: PropTypes.bool,
  fieldPath: PropTypes.string.isRequired,
  fieldLabel: PropTypes.string.isRequired,
  isEditingPublishedRecord: PropTypes.bool.isRequired,
  managedHelpText: PropTypes.string,
  pidIcon: PropTypes.string,
  pidLabel: PropTypes.string.isRequired,
  pidPlaceholder: PropTypes.string,
  pidType: PropTypes.string.isRequired,
  required: PropTypes.bool,
  unmanagedHelpText: PropTypes.string,
  record: PropTypes.object.isRequired,
  doiDefaultSelection: PropTypes.string.isRequired,
  optionalDOItransitions: PropTypes.object.isRequired,
};

PIDField.defaultProps = {
  btnLabelDiscardPID: "Discard",
  btnLabelGetPID: "Reserve",
  canBeManaged: true,
  canBeUnmanaged: true,
  managedHelpText: null,
  pidIcon: "barcode",
  pidPlaceholder: "",
  required: false,
  unmanagedHelpText: null,
};
