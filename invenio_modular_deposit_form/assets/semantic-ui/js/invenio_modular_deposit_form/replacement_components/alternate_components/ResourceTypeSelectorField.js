// This file is part of the Knowledge Commons Repository
// a customized deployment of InvenioRDM
// Copyright (C) 2023 MESH Research.
// InvenioRDM Copyright (C) 2023 CERN.
//
// Invenio App RDM and the Knowledge Commons Repository are free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect, useMemo, useState } from "react";
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
  shortcutResourceTypeIds: shortcutResourceTypeIdsProp,
  ...uiProps
}) => {
  const shortcutResourceTypeIds = Array.isArray(shortcutResourceTypeIdsProp)
    ? shortcutResourceTypeIdsProp
    : [];
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? {};
  const options = optionsProp ?? vocabularies?.metadata?.resource_type ?? [];
  const { values, setFieldValue } = useFormikContext();
  const currentTypeId = getIn(values, fieldPath);
  const [otherToggleActive, setOtherToggleActive] = useState(false);

  const optionById = useMemo(() => {
    const map = {};
    for (const o of options) {
      map[o.id] = o;
    }
    return map;
  }, [options]);

  const shortcutButtons = useMemo(() => {
    return shortcutResourceTypeIds.map((id) => {
      const opt = optionById[id];
      return {
        id,
        label: i18next.t(
          opt.subtype_name != null && String(opt.subtype_name).trim() !== ""
            ? opt.subtype_name
            : opt.type_name
        ),
        icon: opt.icon,
      };
    });
  }, [optionById, shortcutResourceTypeIds, i18next.language]);

  useEffect(() => {
    if (!currentTypeId) {
      return;
    }
    if (shortcutResourceTypeIds.includes(currentTypeId)) {
      setOtherToggleActive(false);
    } else {
      setOtherToggleActive(true);
      // FIXME: this is a hack to get the formik validation not to complain
      setFieldValue(fieldPath, currentTypeId);
    }
  }, [currentTypeId, fieldPath, setFieldValue, shortcutResourceTypeIds]);

  /**
   * Convert back-end options to front-end options.
   *
   * @param {array} propsOptions - back-end options
   * @returns {array} front-end options
   */
  const createOptions = (propsOptions) => {
    return propsOptions
      .map((o) => ({
        value: o.id,
        icon: o.icon,
        text: i18next.t(
          o.subtype_name != null && String(o.subtype_name).trim() !== ""
            ? o.subtype_name
            : o.type_name
        ),
      }))
      .sort((a, b) => a.text.localeCompare(b.text));
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
      {({ meta }) => (
        <Form.Field required={!!required} error={!!meta.error && !!meta.touched}>
          {label && <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />}
          {description && description !== " " && (
            <label className="helptext label top">{i18next.t(description)}</label>
          )}
          <div className="ui compact fluid icon labeled six item menu">
            {shortcutButtons.map((buttonType) => (
              <button
                key={buttonType.id}
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
              className={`ui button item pt-25 pb-25 ${otherToggleActive === true ? "active" : ""}`}
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
      icon: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      subtype_name: PropTypes.string,
      type_name: PropTypes.string.isRequired,
    }).isRequired
  ),
  required: PropTypes.bool,
  shortcutResourceTypeIds: PropTypes.arrayOf(PropTypes.string),
};

export default ResourceTypeSelectorField;
