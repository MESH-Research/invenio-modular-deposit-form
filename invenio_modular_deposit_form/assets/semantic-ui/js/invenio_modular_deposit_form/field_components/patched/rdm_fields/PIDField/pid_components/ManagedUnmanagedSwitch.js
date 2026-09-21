// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_rdm_records/i18next";

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Form, Radio } from "semantic-ui-react";

/**
 * Manage radio buttons choices between managed
 * and unmanaged PID.
 */
export class ManagedUnmanagedSwitch extends Component {
  handleChange = (_, { value }) => {
    const { onManagedUnmanagedChange } = this.props;
    const isManagedSelected = value === "managed";
    onManagedUnmanagedChange(isManagedSelected);
  };

  render() {
    const { id, ariaControls, disabled, isManagedSelected, pidLabel } = this.props;

    return (
      <Form.Group
        id={id}
        className="stackable-tablet"
        role="radiogroup"
        aria-controls={ariaControls}
        aria-labelledby="managed-unmanaged-switch"
      >
        <label id="managed-unmanaged-switch" className="pl-10 mr-25 mb-0 description">
          {i18next.t("Do you already have a {{pidLabel}} for this upload?", {
            pidLabel: pidLabel,
          })}
        </label>
        <Form.Group inline className="equal widths" aria-disabled={disabled ? "true" : "false"}>
          <Form.Field className="pl-10">
            <Radio
              label={i18next.t("Yes, I have one")}
              name="radioGroup"
              value="unmanaged"
              disabled={disabled}
              checked={!isManagedSelected}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field className="pl-10">
            <Radio
              label={i18next.t("No, I need one")}
              name="radioGroup"
              value="managed"
              disabled={disabled}
              checked={isManagedSelected}
              onChange={this.handleChange}
            />
          </Form.Field>
        </Form.Group>
      </Form.Group>
    );
  }
}

ManagedUnmanagedSwitch.propTypes = {
  disabled: PropTypes.bool,
  isManagedSelected: PropTypes.bool.isRequired,
  onManagedUnmanagedChange: PropTypes.func.isRequired,
  pidLabel: PropTypes.string,
};

ManagedUnmanagedSwitch.defaultProps = {
  disabled: false,
  pidLabel: undefined,
};
