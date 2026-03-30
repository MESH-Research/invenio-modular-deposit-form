// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Explicit text+select row identifiers (override-style).

import React from "react";
import { Button, Form, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";
import { FieldLabel } from "react-invenio-forms";
import _get from "lodash/get";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { TextField } from "../../TextField";
import { SelectField } from "../../SelectField";
import { FieldArray } from "formik";

const newIdentifier = { scheme: "", identifier: "" };

const idTypeData = {
  orcid: { text: "ORCID", value: "orcid", key: "orcid" },
  isni: { text: "ISNI", value: "isni", key: "isni" },
  gnd: { text: "GND", value: "gnd", key: "gnd" },
  ror: { text: "ROR", value: "ror", key: "ror" },
  kc_username: { text: "KC username", value: "kc_username", key: "kc_username" },
  email: { text: "email", value: "email", key: "email" },
};

const CreatibutorsIdentifiers = ({
  fieldPath,
  label = i18next.t("Name identifiers"),
  placeholder = "",
  idTypes = ["orcid", "isni", "gnd", "ror", "kc_username", "email"],
}) => {
  return (
    <Form.Field className="creator-identifiers">
      <FieldLabel htmlFor={fieldPath} label={label} />
      <FieldArray
        name={fieldPath}
        render={(arrayHelpers) => (
          <>
            {_get(arrayHelpers.form.values, fieldPath, [])?.map((option, index) => {
              const fieldPathPrefix = `${fieldPath}.${index}`;

              return (
                <Form.Group
                  key={index}
                  className="creatibutors-identifiers-item-row invenio-group-field invenio-form-row"
                >
                  <TextField
                    fieldPath={`${fieldPathPrefix}.identifier`}
                    label=""
                    width={10}
                    required
                  />
                  <SelectField
                    fieldPath={`${fieldPathPrefix}.scheme`}
                    label={i18next.t("Scheme")}
                    options={idTypes.map((opt) => idTypeData[opt])}
                    required
                    selection
                    selectOnBlur
                    optimized
                    fluid
                    width={5}
                  />
                  <Form.Field className="no-label">
                    <Button
                      aria-label={i18next.t("Remove identifier")}
                      className="close-btn"
                      icon
                      type="button"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      <Icon name="close" />
                    </Button>
                  </Form.Field>
                </Form.Group>
              );
            })}

            <Button
              type="button"
              onClick={() => arrayHelpers.push(newIdentifier)}
              icon
              className="align-self-end add-btn creatibutors-identifiers-add-button"
              labelPosition="left"
              id={`${fieldPath}.add-identifier-button`}
            >
              <Icon name="add" />
              {i18next.t("Add identifier")}
            </Button>
          </>
        )}
      />
    </Form.Field>
  );
};

CreatibutorsIdentifiers.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  idTypes: PropTypes.arrayOf(PropTypes.string),
};

export { CreatibutorsIdentifiers };
