import React from "react";
import Overridable from "react-overridable";
import { pickBy } from "lodash";
import { useCurrentFieldMods } from "../hooks/useCurrentFieldMods";

const FieldComponentWrapper = ({
  children,
  componentName,
  fieldPath,
  labelIcon,
  icon,
  label,
  description,
  helpText,
  placeholder,
  required,
  isRowField,
  ...extraProps
}) => {
  const {
    defaultFieldValues,
    descriptionMods,
    helpTextMods,
    iconMods,
    labelMods,
    placeholderMods,
    priorityFieldValues,
    extraRequiredFields,
  } = useCurrentFieldMods();

  const { icon: extraIcon, labelIcon: extraLabelIcon, ...restExtraProps } = extraProps;

  const moddedLabelIcon =
    iconMods && Object.prototype.hasOwnProperty.call(iconMods, fieldPath)
      ? iconMods[fieldPath]
      : labelIcon ?? icon;
  const effectiveLabelIcon =
    (moddedLabelIcon ?? labelIcon ?? icon) ?? extraLabelIcon ?? extraIcon;
  const moddedLabel =
    labelMods && labelMods.hasOwnProperty(fieldPath) ? labelMods[fieldPath] : label;
  const moddedDescription =
    descriptionMods && descriptionMods.hasOwnProperty(fieldPath)
      ? descriptionMods[fieldPath]
      : description;
  const moddedPlaceholder =
    placeholderMods && placeholderMods.hasOwnProperty(fieldPath)
      ? placeholderMods[fieldPath]
      : placeholder;
  const moddedHelpText =
    helpTextMods && helpTextMods.hasOwnProperty(fieldPath) ? helpTextMods[fieldPath] : helpText;
  const moddedRequired =
    extraRequiredFields && extraRequiredFields.hasOwnProperty(fieldPath)
      ? extraRequiredFields[fieldPath]
      : required;
  const defaultFieldValue =
    defaultFieldValues && defaultFieldValues.hasOwnProperty[fieldPath]
      ? defaultFieldValues[fieldPath]
      : null;
  const priorityFieldValueSet =
    priorityFieldValues && priorityFieldValues.hasOwnProperty(fieldPath)
      ? priorityFieldValues[fieldPath]
      : null;
  const cleanedExtraProps = pickBy(restExtraProps, (v) => v !== undefined);

  return (
    <Overridable id={`InvenioAppRdm.Deposit.${componentName}.container`} fieldPath={fieldPath}>
      <div
        className={`invenio-field-wrapper ${fieldPath
          .replaceAll(".", "-")
          .replaceAll(":", "-")}-field rel-mb-2 ${isRowField ? "field" : ""}`}
      >
        {children &&
          React.cloneElement(children, {
            defaultFieldValue: defaultFieldValue,
            description: moddedDescription,
            fieldPath: fieldPath,
            helpText: moddedHelpText,
            label: moddedLabel,
            labelIcon: effectiveLabelIcon,
            placeholder: moddedPlaceholder,
            priorityFieldValues: priorityFieldValueSet,
            required: moddedRequired,
            ...cleanedExtraProps,
          })}
      </div>
    </Overridable>
  );
};

export { FieldComponentWrapper };
