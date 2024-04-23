// This file is part of the Knowledge Commons Repository
// a customized deployment of InvenioRDM
// Copyright (C) 2023 MESH Research.
// InvenioRDM Copyright (C) 2023 CERN.
//
// Invenio App RDM and the Knowledge Commons Repository are free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import { Form } from "semantic-ui-react";
import { FieldLabel, SelectField } from "react-invenio-forms";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { Field, useFormikContext } from "formik";
import { Icon, Label } from "semantic-ui-react";
import { set } from "lodash";

const ResourceTypeSelectorField = ({
  classnames = undefined,
  description = undefined,
  fieldPath,
  helpText = undefined,
  label = i18next.t("Resource type"),
  icon = "tag",
  options,
  labelclassname = "field-label-class",
  required,
  ...uiProps
}) => {
  const { values, errors, setFieldValue, initialValues } = useFormikContext();
  const [otherToggleActive, setOtherToggleActive] = useState(false);

  const buttonTypes = [
    {
      id: "textDocument-journalArticle",
      label: "Journal Article",
      icon: "file text",
    },
    { id: "textDocument-review", label: "Review", icon: "thumbs up" },
    { id: "textDocument-book", label: "Book", icon: "book" },
    { id: "textDocument-bookSection", label: "Book Section", icon: "book" },
    {
      id: "instructionalResource-syllabus",
      label: "Syllabus",
      icon: "graduation",
    },
  ];
  console.log("required", required);

  useEffect(() => {
    if (
      values.metadata.resource_type &&
      !buttonTypes.map((b) => b.id).includes(values.metadata.resource_type)
    ) {
      setOtherToggleActive(true);
      // FIXME: this is a hack to get the formik validation not to complain
      setFieldValue("metadata.resource_type", values.metadata.resource_type);
    }
  }, [values.metadata.resource_type]);

  /**
   * Generate label value
   *
   * @param {object} option - back-end option
   * @returns {string} label
   */
  const _label = (option) => {
    return (
      option.type_name +
      (option.subtype_name ? " / " + option.subtype_name : "")
    );
  };

  /**
   * Convert back-end options to front-end options.
   *
   * @param {array} propsOptions - back-end options
   * @returns {array} front-end options
   */
  const createOptions = (propsOptions) => {
    return propsOptions
      .map((o) => ({ ...o, label: _label(o) }))
      .sort((o1, o2) => o1.label.localeCompare(o2.label))
      .map((o) => {
        return {
          value: o.id,
          icon: o.icon,
          text: o.label,
        };
      });
  };
  const frontEndOptions = createOptions(options);

  const handleItemClick = (event) => {
    setFieldValue(
      "metadata.resource_type",
      event.target.closest("button").name
    );
    setOtherToggleActive(false);
  };

  const handleOtherToggleClick = () => {
    setFieldValue("metadata.resource_type", frontEndOptions[0].value);
    setOtherToggleActive(true);

    setTimeout(() => {
      document
        .querySelectorAll(
          "#InvenioAppRdm\\.Deposit\\.resource_type\\.container .invenio-select-field input"
        )[0]
        .focus();
    }, 200);
  };

  return (
    <Field id={fieldPath} name={fieldPath}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors, setFieldValue }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => (
        <Form.Field
          required={!!required}
          error={!!meta.error && !!meta.touched}
        >
          <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
          {description && description !== " " && (
            <label className="helptext label top">{i18next.t(description)}</label>
          )}
          <div className="ui compact fluid icon labeled six item menu">
            {buttonTypes.map((buttonType, index) => (
              <button
                key={index}
                id={buttonType.id}
                name={buttonType.id}
                onClick={handleItemClick}
                className={`ui button item ${
                  values.metadata.resource_type === buttonType.id
                    ? "active"
                    : ""
                }`}
                formNoValidate
                type="button"
              >
                <Icon name={buttonType.icon} />
                {buttonType.label}
              </button>
            ))}
            <button
              id={"otherToggle"}
              name={"otherToggle"}
              onClick={handleOtherToggleClick}
              className={`ui button item ${
                otherToggleActive === true ? "active" : ""
              }`}
              formNoValidate
              type="button"
            >
              <Icon name="asterisk" />
              Other...
            </button>
          </div>
          {!!otherToggleActive && (
            <SelectField
              fieldPath={fieldPath}
              label={""}
              optimized
              options={frontEndOptions}
              selectOnBlur={true}
              selectOnNavigation={true}
              search={true}
              placeholder={"choose another resource type..."}
              {...uiProps}
            />
          )}
          {meta.error && meta.touched && (
            <Label pointing className="prompt error">
              {meta.error}
            </Label>
          )}
          {helpText && helpText !== " " && (
            <label className="helptext">{i18next.t(helpText)}</label>
          )}
        </Form.Field>
      )}
    </Field>
  );
};

ResourceTypeSelectorField.propTypes = {
  description: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.string,
  labelclassname: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      type_name: PropTypes.string,
      subtype_name: PropTypes.string,
      id: PropTypes.string,
    })
  ).isRequired,
  required: PropTypes.bool,
};

export default ResourceTypeSelectorField;
