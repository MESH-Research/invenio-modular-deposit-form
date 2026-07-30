// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork (intentional deltas from upstream `RelatedWorksField/RelatedWorksField.js`):
// - `ArrayField`: local fork (`replacement_components/input_controls/ArrayField`) so we get
//   `onAfterAdd` / `onAfterRemove` for keyboard focus management on add and remove.
// - `TextField` / `SelectField` from `replacement_components/`; `ResourceTypeField` from
//   this folder (already uses replacement `SelectField`).
// - `emptyRelatedWork` from `@js/invenio_rdm_records/.../RelatedWorksField/initialValues`.
// - Item layout: SUI `Grid` columns with explicit widths (not Form.Group `N wide` classes).
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Form, Grid, Icon } from "semantic-ui-react";
import { emptyRelatedWork } from "@js/invenio_rdm_records/src/deposit/fields/RelatedWorksField/initialValues";
import { i18next } from "@translations/invenio_rdm_records/i18next";

import { ArrayField } from "../../replacement_components/input_controls/ArrayField";
import {
  focusAddButton,
  focusFieldByPath,
} from "../../replacement_components/input_controls/arrayFieldFocus";
import { SelectField } from "../../replacement_components/input_controls/SelectField";
import { TextField } from "../../replacement_components/input_controls/TextField";
import { ResourceTypeField } from "./ResourceTypeField";

export class RelatedWorksField extends Component {
  render() {
    const { fieldPath, label, labelIcon, required, options, showEmptyValue } = this.props;

    return (
      <ArrayField
        addButtonLabel={i18next.t("Add related work")}
        defaultNewValue={emptyRelatedWork}
        fieldPath={fieldPath}
        helpText={i18next.t(
          "Specify identifiers of related works. Supported identifiers include DOI, Handle, ARK, PURL, ISSN, ISBN, PubMed ID, PubMed Central ID, ADS Bibliographic Code, arXiv, Life Science Identifiers (LSID), EAN-13, ISTC, URNs, and URLs."
        )}
        label={label}
        labelIcon={labelIcon}
        onAfterAdd={({ index }) => focusFieldByPath(`${fieldPath}.${index}.identifier`)}
        onAfterRemove={({ isNowEmpty, removedIndex }) => {
          if (isNowEmpty) {
            focusAddButton(fieldPath);
            return;
          }
          const target = removedIndex > 0 ? removedIndex - 1 : 0;
          focusFieldByPath(`${fieldPath}.${target}.identifier`);
        }}
        required={required}
        showEmptyValue={showEmptyValue}
      >
        {({ arrayHelpers, indexPath }) => {
          const fieldPathPrefix = `${fieldPath}.${indexPath}`;
          const renderRemoveButton = () => (
            <Form.Field>
              <Button
                aria-label={i18next.t("Remove field")}
                className="close-btn"
                floated="right"
                icon
                onClick={() => arrayHelpers.remove(indexPath)}
                type="button"
              >
                <Icon name="close" />
              </Button>
            </Form.Field>
          );

          return (
            <Grid className="related-work">
              <Grid.Row>
                <Grid.Column computer={10} tablet={10} mobile={14}>
                  <TextField
                    fieldPath={`${fieldPathPrefix}.identifier`}
                    label={i18next.t("Identifier")}
                    required
                  />
                </Grid.Column>
                <Grid.Column only="mobile" mobile={2}>
                  {renderRemoveButton()}
                </Grid.Column>
                <Grid.Column computer={4} tablet={4} mobile={16}>
                  <SelectField
                    clearable
                    compact
                    fieldPath={`${fieldPathPrefix}.scheme`}
                    label={i18next.t("Scheme")}
                    aria-label={i18next.t("Scheme")}
                    optimized
                    options={options.scheme}
                    required
                  />
                </Grid.Column>
                <Grid.Column only="computer tablet" computer={2} tablet={2}>
                  {renderRemoveButton()}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column computer={8} tablet={8} mobile={14}>
                  <SelectField
                    clearable
                    compact
                    fieldPath={`${fieldPathPrefix}.relation_type`}
                    label={i18next.t("Relation")}
                    aria-label={i18next.t("Relation")}
                    optimized
                    options={options.relations}
                    placeholder={{
                      role: "option",
                      content: "Select relation...",
                    }}
                    required
                  />
                </Grid.Column>
                <Grid.Column computer={6} tablet={6} mobile={14}>
                  <ResourceTypeField
                    clearable
                    compact
                    fieldPath={`${fieldPathPrefix}.resource_type`}
                    labelIcon=""
                    options={options.resource_type}
                    labelclassname="small field-label-class"
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          );
        }}
      </ArrayField>
    );
  }
}

RelatedWorksField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.object.isRequired,
  showEmptyValue: PropTypes.bool,
};

RelatedWorksField.defaultProps = {
  label: i18next.t("Related works"),
  labelIcon: "barcode",
  required: undefined,
  showEmptyValue: false,
};
