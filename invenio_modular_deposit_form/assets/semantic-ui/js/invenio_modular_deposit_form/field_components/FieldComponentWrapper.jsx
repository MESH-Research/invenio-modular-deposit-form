import React from "react";
import Overridable from "react-overridable";

const FieldComponentWrapper = ({
  children,
  componentName,
  fieldPath,
  icon,
  iconMods,
  label,
  labelMods,
  defaultFieldValues,
  description,
  descriptionMods,
  extraRequiredFields,
  helpText,
  helpTextMods,
  placeholder,
  placeholderMods,
  priorityFieldValues,
  required,
  ...extraProps
}) => {
  console.log(
    "FieldComponentWrapper resource type",
    componentName,
    fieldPath,
    icon,
    iconMods,
    label,
    labelMods,
    defaultFieldValues,
    description,
    descriptionMods,
    extraRequiredFields,
    helpText,
    helpTextMods,
    placeholder,
    placeholderMods,
    priorityFieldValues,
    required,
    extraProps
  );
  const moddedIcon =
    iconMods && iconMods[fieldPath] ? iconMods.hasOwnProperty(fieldPath) : icon;
  const moddedLabel =
    labelMods && labelMods[fieldPath]
      ? labelMods.hasOwnProperty(fieldPath)
      : label;
  const moddedDescription =
    descriptionMods && descriptionMods.hasOwnProperty(fieldPath)
      ? descriptionMods[fieldPath]
      : description;
  const moddedPlaceholder =
    placeholderMods && placeholderMods.hasOwnProperty(fieldPath)
      ? placeholderMods[fieldPath]
      : placeholder;
  const moddedHelpText =
    helpTextMods && helpTextMods.hasOwnProperty(fieldPath)
      ? helpTextMods[fieldPath]
      : helpText;
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
  console.log("FieldComponentWrapper children", children);
  return (
    <Overridable
      id={`InvenioAppRdm.Deposit.${componentName}.container`}
      fieldPath={fieldPath}
    >
      {children &&
        React.cloneElement(
          children,
          {
            defaultFieldValue: defaultFieldValue,
            description: moddedDescription,
            fieldPath: fieldPath,
            helpText: moddedHelpText,
            label: moddedLabel,
            labelIcon: moddedIcon,
            placeholder: moddedPlaceholder,
            priorityFieldValues: priorityFieldValueSet,
            required: moddedRequired,
            ...extraProps,
          },
          null
        )}
    </Overridable>
  );
};

export { FieldComponentWrapper };
