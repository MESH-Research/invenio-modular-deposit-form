import React from "react";
import Overridable from "react-overridable";
import { pickBy } from "lodash";

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
  const moddedIcon =
    iconMods && iconMods.hasOwnProperty(fieldPath) ? iconMods[fieldPath] : icon;
  const moddedLabel =
    labelMods && labelMods.hasOwnProperty(fieldPath)
      ? labelMods[fieldPath]
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
  // Remove undefined values from extraProps
  const cleanedExtraProps = pickBy(extraProps, (v) => v !== undefined);
  return (
    <>
      <Overridable
        id={`InvenioAppRdm.Deposit.${componentName}.container`}
        fieldPath={fieldPath}
      >
        {children &&
          React.cloneElement(
            children,
            {
              defaultFieldValue: defaultFieldValue,
              description: "",
              fieldPath: fieldPath,
              helptext: moddedHelpText ? moddedHelpText : moddedDescription,
              label: moddedLabel,
              labelIcon: moddedIcon,
              placeholder: moddedPlaceholder,
              priorityFieldValues: priorityFieldValueSet,
              required: moddedRequired,
              ...cleanedExtraProps,
            },
            null
          )}
      </Overridable>
      {(moddedHelpText || moddedDescription) && (
        <label id={`${fieldPath}.helptext`} className="helptext">
          {moddedHelpText || moddedDescription}
        </label>
      )}
    </>
  );
};

export { FieldComponentWrapper };
