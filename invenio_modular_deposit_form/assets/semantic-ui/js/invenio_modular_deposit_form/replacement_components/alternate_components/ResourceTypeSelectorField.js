// This file is part of the Knowledge Commons Repository
// a customized deployment of InvenioRDM
// Copyright (C) 2023 MESH Research.
// InvenioRDM Copyright (C) 2023 CERN.
//
// Invenio App RDM and the Knowledge Commons Repository are free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Form } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { SelectField } from "../SelectField";
import { FieldLabel } from "../FieldLabel";
import { Field, getIn, useFormikContext } from "formik";
import { Icon, Label } from "semantic-ui-react";
import { useStore } from "react-redux";

const RADIO_GROUP_NAV_KEYS = new Set([
  "ArrowDown",
  "ArrowRight",
  "ArrowUp",
  "ArrowLeft",
  "Home",
  "End",
]);

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
  showLabel = true,
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
  const radioRefs = useRef([]);

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

  const safeFieldId = fieldPath.replaceAll(".", "-").replaceAll(":", "-");
  const labelElementId = `${fieldPath}.label`;
  const errorMessageId = `${fieldPath}.error`;
  const descriptionElementId =
    description && description !== " " ? `${fieldPath}.description` : null;
  const helpTextElementId = helpText && helpText !== " " ? `${fieldPath}.helptext` : null;
  const otherListId = `${safeFieldId}-other-select`;

  const radioCount = shortcutButtons.length + 1;

  const focusOtherSelectInput = useCallback(() => {
    const wrapperClass = `${fieldPath.replaceAll(".", "-").replaceAll(":", "-")}-field`;
    setTimeout(() => {
      document
        .querySelector(`.invenio-field-wrapper.${wrapperClass} .invenio-select-field input`)
        ?.focus();
    }, 200);
  }, [fieldPath]);

  const moveRadioSelection = useCallback(
    (nextIndex) => {
      if (radioCount < 1) {
        return;
      }
      const i = ((nextIndex % radioCount) + radioCount) % radioCount;
      if (i < shortcutButtons.length) {
        setFieldValue(fieldPath, shortcutButtons[i].id);
        setOtherToggleActive(false);
        queueMicrotask(() => radioRefs.current[i]?.focus());
      } else {
        if (frontEndOptions.length < 1) {
          return;
        }
        setFieldValue(fieldPath, frontEndOptions[0].value);
        setOtherToggleActive(true);
        queueMicrotask(() => {
          radioRefs.current[shortcutButtons.length]?.focus();
          focusOtherSelectInput();
        });
      }
    },
    [fieldPath, focusOtherSelectInput, frontEndOptions, radioCount, setFieldValue, shortcutButtons]
  );

  const handleRadioGroupKeyDown = useCallback(
    (event) => {
      if (!RADIO_GROUP_NAV_KEYS.has(event.key)) {
        return;
      }
      if (event.target.getAttribute("role") !== "radio") {
        return;
      }
      const radios = radioRefs.current.filter(Boolean);
      if (radios.length === 0) {
        return;
      }
      const idx = radios.indexOf(event.target);
      if (idx < 0) {
        return;
      }
      event.preventDefault();

      if (event.key === "Home") {
        moveRadioSelection(0);
        return;
      }
      if (event.key === "End") {
        moveRadioSelection(radioCount - 1);
        return;
      }
      const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
      const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
      if (forward) {
        moveRadioSelection(idx + 1);
      } else if (backward) {
        moveRadioSelection(idx - 1);
      }
    },
    [moveRadioSelection, radioCount]
  );

  const getRadioTabIndex = (index) => {
    const otherIndex = shortcutButtons.length;
    const isOther = index === otherIndex;

    if (shortcutButtons.length === 0) {
      return 0;
    }
    if (otherToggleActive) {
      return isOther ? 0 : -1;
    }
    if (!isOther) {
      const id = shortcutButtons[index].id;
      if (currentTypeId === id) {
        return 0;
      }
      if (!currentTypeId && index === 0) {
        return 0;
      }
      return -1;
    }
    return -1;
  };

  const assignRadioRef = (index) => (el) => {
    radioRefs.current[index] = el;
  };

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
    focusOtherSelectInput();
  };

  const firstShortcutHtmlFor =
    shortcutButtons.length > 0
      ? `${safeFieldId}-opt-${shortcutButtons[0].id}`
      : `${safeFieldId}-other-toggle`;

  const assistiveGroupName =
    typeof label === "string" && label.trim() !== "" ? label : i18next.t("Resource type");

  return (
    <Field id={fieldPath} name={fieldPath}>
      {({ meta }) => {
        const showError = !!meta.error && !!meta.touched;
        const describedBy = [
          showError ? errorMessageId : null,
          helpTextElementId,
          descriptionElementId,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <Form.Field required={!!required} error={showError}>
            {showLabel && label ? (
              <FieldLabel
                className={labelclassname}
                htmlFor={firstShortcutHtmlFor}
                icon={icon}
                id={labelElementId}
                label={label}
              />
            ) : null}
            {description && description !== " " && (
              <div className="description label top" id={descriptionElementId} htmlFor={undefined}>
                {i18next.t(description)}
              </div>
            )}
            <div
              className="ui compact fluid icon labeled six item menu"
              role="radiogroup"
              aria-invalid={showError || undefined}
              aria-labelledby={showLabel && label ? labelElementId : undefined}
              aria-label={showLabel && label ? undefined : assistiveGroupName}
              aria-describedby={describedBy || undefined}
              onKeyDown={handleRadioGroupKeyDown}
            >
              {shortcutButtons.map((buttonType, index) => {
                const checked = !otherToggleActive && currentTypeId === buttonType.id;
                return (
                  <button
                    key={buttonType.id}
                    ref={assignRadioRef(index)}
                    id={`${safeFieldId}-opt-${buttonType.id}`}
                    name={buttonType.id}
                    type="button"
                    role="radio"
                    tabIndex={getRadioTabIndex(index)}
                    aria-checked={checked}
                    onClick={handleItemClick}
                    className={`ui button item ${checked ? "active" : ""}`}
                    formNoValidate
                  >
                    <Icon aria-hidden="true" name={buttonType.icon} />
                    {buttonType.label}
                  </button>
                );
              })}
              <button
                ref={assignRadioRef(shortcutButtons.length)}
                id={`${safeFieldId}-other-toggle`}
                name="otherToggle"
                type="button"
                role="radio"
                tabIndex={getRadioTabIndex(shortcutButtons.length)}
                aria-checked={otherToggleActive}
                aria-haspopup="listbox"
                aria-expanded={otherToggleActive}
                aria-controls={otherListId}
                onClick={handleOtherToggleClick}
                className={`ui button item pt-25 pb-25 ${otherToggleActive ? "active" : ""}`}
                formNoValidate
              >
                <Icon aria-hidden="true" name="asterisk" />
                Other...
              </button>
            </div>
            {!!otherToggleActive && (
              <SelectField
                {...uiProps}
                fieldPath={fieldPath}
                label=""
                optimized
                options={frontEndOptions}
                selectOnBlur={true}
                selectOnNavigation={true}
                search={true}
                placeholder={i18next.t("choose another resource type...")}
                upward={false}
                id={otherListId}
                aria-labelledby={showLabel && label ? labelElementId : undefined}
                aria-label={showLabel && label ? undefined : assistiveGroupName}
                aria-describedby={describedBy || undefined}
                aria-invalid={showError || undefined}
              />
            )}
            {showError && (
              <Label id={errorMessageId} pointing className="prompt error" role="alert">
                {meta.error}
              </Label>
            )}
            {helpText && helpText !== " " && (
              <div className="helptext" id={helpTextElementId} htmlFor={undefined}>
                {i18next.t(helpText)}
              </div>
            )}
          </Form.Field>
        );
      }}
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
  showLabel: PropTypes.bool,
  shortcutResourceTypeIds: PropTypes.arrayOf(PropTypes.string),
};

export default ResourceTypeSelectorField;
