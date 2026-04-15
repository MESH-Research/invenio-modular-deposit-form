// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2024 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork (intentional deltas from upstream `DatesField/DatesField.js`):
// - `TextField` / `SelectField` from `replacement_components/` (not `react-invenio-forms`).
// - `emptyDate` from `@js/invenio_rdm_records/.../DatesField/initialValues`.
import React, { Component } from "react";
import PropTypes from "prop-types";
import _filter from "lodash/filter";
import _has from "lodash/has";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _matches from "lodash/matches";
import { ArrayField, GroupField } from "react-invenio-forms";
import { Button, Form, Icon } from "semantic-ui-react";
import Overridable from "react-overridable";
import { emptyDate } from "@js/invenio_rdm_records/src/deposit/fields/DatesField/initialValues";
import { sortOptions } from "@js/invenio_rdm_records/src/deposit/utils";
import { i18next } from "@translations/invenio_rdm_records/i18next";

import { SelectField } from "../../replacement_components/input_controls/SelectField";
import { TextField } from "../../replacement_components/input_controls/TextField";

export class DatesField extends Component {
  getRequiredOption = (currentValue, arrayOfValues) => {
    const { requiredOptions } = this.props;
    for (const requiredOption of requiredOptions) {
      const matchingValue = _filter(arrayOfValues, _matches(requiredOption))[0];
      if (_isEqual(matchingValue, currentValue)) {
        return requiredOption;
      }
    }
    return null;
  };

  render() {
    const {
      fieldPath,
      options,
      label,
      labelIcon,
      placeholderDate,
      required,
      requiredOptions,
      showEmptyValue,
    } = this.props;

    return (
      <Overridable
        id="InvenioRdmRecords.DatesField.AddDateArrayField.Container"
        fieldPath={fieldPath}
      >
        <ArrayField
          addButtonLabel={i18next.t("Add date")}
          defaultNewValue={emptyDate}
          fieldPath={fieldPath}
          helpText={i18next.t(
            "Format: DATE or DATE/DATE where DATE is YYYY or YYYY-MM or YYYY-MM-DD."
          )}
          label={label}
          labelIcon={labelIcon}
          required={required}
          requiredOptions={requiredOptions}
          showEmptyValue={showEmptyValue}
        >
          {({ array, arrayHelpers, indexPath, value }) => {
            const fieldPathPrefix = `${fieldPath}.${indexPath}`;
            const requiredOption = this.getRequiredOption(value, array);
            const hasRequiredDateValue = _has(requiredOption, "date");
            const hasRequiredTypeValue = _has(requiredOption, "type");
            const hasRequiredDescriptionValue = _has(requiredOption, "description");
            return (
              <GroupField fieldPath={fieldPath} optimized>
                <Overridable
                  id="InvenioRdmRecords.DatesField.DateTextField.Container"
                  fieldPath={`${fieldPathPrefix}.date`}
                >
                  <TextField
                    fieldPath={`${fieldPathPrefix}.date`}
                    label={i18next.t("Date")}
                    placeholder={placeholderDate}
                    disabled={hasRequiredDateValue}
                    required
                    width={5}
                  />
                </Overridable>
                <Overridable
                  id="InvenioRdmRecords.DatesField.TypeSelectField.Container"
                  fieldPath={`${fieldPathPrefix}.type`}
                >
                  <SelectField
                    fieldPath={`${fieldPathPrefix}.type`}
                    label={i18next.t("Type")}
                    aria-label={i18next.t("Type")}
                    options={sortOptions(options.type)}
                    disabled={hasRequiredTypeValue}
                    required
                    width={5}
                    optimized
                  />
                </Overridable>
                <Overridable
                  id="InvenioRdmRecords.DatesField.DescriptionTextField.Container"
                  fieldPath={`${fieldPathPrefix}.description`}
                >
                  <TextField
                    fieldPath={`${fieldPathPrefix}.description`}
                    label={i18next.t("Description")}
                    disabled={hasRequiredDescriptionValue}
                    width={5}
                  />
                </Overridable>
                <Overridable id="InvenioRdmRecords.DatesField.RemoveFormField.Container">
                  <Form.Field>
                    <Button
                      aria-label={i18next.t("Remove field")}
                      className="close-btn"
                      disabled={!_isEmpty(requiredOption)}
                      icon
                      onClick={() => arrayHelpers.remove(indexPath)}
                      type="button"
                    >
                      <Icon name="close" />
                    </Button>
                  </Form.Field>
                </Overridable>
              </GroupField>
            );
          }}
        </ArrayField>
      </Overridable>
    );
  }
}

DatesField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  options: PropTypes.shape({
    type: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }).isRequired,
  required: PropTypes.bool,
  placeholderDate: PropTypes.string,
  requiredOptions: PropTypes.array,
  showEmptyValue: PropTypes.bool,
};

DatesField.defaultProps = {
  label: i18next.t("Dates"),
  labelIcon: "calendar",
  placeholderDate: i18next.t("YYYY-MM-DD or YYYY-MM-DD/YYYY-MM-DD"),
  required: false,
  requiredOptions: [],
  showEmptyValue: false,
};
