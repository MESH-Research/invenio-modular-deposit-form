// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork (intentional deltas from upstream `IdentifiersField.js`; other structure
// matches stock):
// - Row wrapper: bare `<GroupField>` — same as upstream (no `fieldPath` / `optimized` on
//   the group). Baseline for comparing touch/error behavior vs experiments that add those
//   props.
// - `TextField` / `SelectField`: from `replacement_components/` (not `react-invenio-forms`).
// - `emptyIdentifier`: imported from `@js/invenio_rdm_records/.../Identifiers/initialValues`
//   (bundle path; same object as upstream `./initialValues`).
import PropTypes from "prop-types";
import React, { Component } from "react";
import { ArrayField, FieldLabel, GroupField } from "react-invenio-forms";
import { Button, Form } from "semantic-ui-react";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { emptyIdentifier } from "@js/invenio_rdm_records/src/deposit/fields/Identifiers/initialValues";

import { SelectField } from "../SelectField";
import { TextField } from "../TextField";

/** Identifiers array component (modular fork; see file header). */
export class IdentifiersField extends Component {
  render() {
    const {
      fieldPath,
      label,
      labelIcon,
      required,
      schemeOptions,
      showEmptyValue,
    } = this.props;

    return (
      <ArrayField
        addButtonLabel={i18next.t("Add identifier")}
        defaultNewValue={emptyIdentifier}
        fieldPath={fieldPath}
        label={
          <FieldLabel
            htmlFor={fieldPath}
            icon={labelIcon}
            label={label}
          />
        }
        required={required}
        showEmptyValue={showEmptyValue}
      >
        {({ arrayHelpers, indexPath }) => {
          const fieldPathPrefix = `${fieldPath}.${indexPath}`;
          return (
            <GroupField>
              <TextField
                fieldPath={`${fieldPathPrefix}.identifier`}
                label={i18next.t("Identifier")}
                required
                width={11}
              />
              {schemeOptions && (
                <SelectField
                  fieldPath={`${fieldPathPrefix}.scheme`}
                  label={i18next.t("Scheme")}
                  aria-label={i18next.t("Scheme")}
                  options={schemeOptions}
                  optimized
                  required
                  width={5}
                />
              )}
              {!schemeOptions && (
                <TextField
                  fieldPath={`${fieldPathPrefix}.scheme`}
                  label={i18next.t("Scheme")}
                  aria-label={i18next.t("Scheme")}
                  required
                  width={5}
                />
              )}
              <Form.Field>
                <Button
                  aria-label={i18next.t("Remove field")}
                  className="close-btn"
                  icon="close"
                  onClick={() => arrayHelpers.remove(indexPath)}
                />
              </Form.Field>
            </GroupField>
          );
        }}
      </ArrayField>
    );
  }
}

IdentifiersField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  required: PropTypes.bool,
  schemeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  showEmptyValue: PropTypes.bool,
};

IdentifiersField.defaultProps = {
  label: i18next.t("Identifiers"),
  labelIcon: "barcode",
  required: false,
  schemeOptions: undefined,
  showEmptyValue: false,
};
