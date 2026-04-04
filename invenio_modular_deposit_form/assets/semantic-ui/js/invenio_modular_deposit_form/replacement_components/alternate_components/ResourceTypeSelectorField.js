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
import { Form } from "semantic-ui-react";
import { FieldLabel, SelectField } from "react-invenio-forms";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { Field, getIn, useFormikContext } from "formik";
import { Icon, Label } from "semantic-ui-react";
import { useStore } from "react-redux";

const ResourceTypeSelectorField = ({
  classnames = undefined,
  description = undefined,
  fieldPath,
  helpText = undefined,
  label = i18next.t("Resource type"),
  icon = "tag",
  options: optionsProp,
  labelclassname = "field-label-class",
  required,
  ...uiProps
}) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? {};
  const options = optionsProp ?? vocabularies?.metadata?.resource_type ?? [];
  const { values, setFieldValue } = useFormikContext();
  const currentTypeId = getIn(values, fieldPath);
  const [otherToggleActive, setOtherToggleActive] = useState(false);

  const buttonTypes = [
    {
      id: "publication-article",
      label: "Journal Article",
      icon: "file text",
    },
    { id: "publication-peerreview", label: "Review", icon: "thumbs up" },
    { id: "publication-book", label: "Book", icon: "book" },
    { id: "publication-section", label: "Book Section", icon: "book" },
    {
      id: "lesson",
      label: "Lesson",
      icon: "graduation",
    },
  ];

  useEffect(() => {
    if (currentTypeId && !buttonTypes.map((b) => b.id).includes(currentTypeId)) {
      setOtherToggleActive(true);
      // FIXME: this is a hack to get the formik validation not to complain
      setFieldValue(fieldPath, currentTypeId);
    }
  }, [currentTypeId, fieldPath, setFieldValue]);

  /**
   * Generate label value
   *
   * @param {object} option - back-end option
   * @returns {string} label
   */
  const _label = (option) => {
    return option.type_name + (option.subtype_name ? " / " + option.subtype_name : "");
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
    const btn = event.target.closest("button");
    if (!btn?.name) {
      return;
    }
    setFieldValue(fieldPath, btn.name);
    setOtherToggleActive(false);
  };

  const handleOtherToggleClick = () => {
    if (frontEndOptions.length < 1) {
      return;
    }
    setFieldValue(fieldPath, frontEndOptions[0].value);
    setOtherToggleActive(true);

    const wrapperClass = `${fieldPath.replaceAll(".", "-").replaceAll(":", "-")}-field`;
    setTimeout(() => {
      document
        .querySelector(`.invenio-field-wrapper.${wrapperClass} .invenio-select-field input`)
        ?.focus();
    }, 200);
  };

  return (
    <Field id={fieldPath} name={fieldPath}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors },
        meta,
      }) => (
        <Form.Field required={!!required} error={!!meta.error && !!meta.touched}>
          {label && <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />}
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
                className={`ui button item ${currentTypeId === buttonType.id ? "active" : ""}`}
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
              className={`ui button item ${otherToggleActive === true ? "active" : ""}`}
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
              upward={false}
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
  ),
  required: PropTypes.bool,
};

export default ResourceTypeSelectorField;
