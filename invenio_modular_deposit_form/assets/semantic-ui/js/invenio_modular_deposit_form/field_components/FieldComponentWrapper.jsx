import React, { useContext } from "react";
import Overridable from "react-overridable";
import { pickBy } from "lodash";
import { FormUIStateContext } from "../InnerDepositForm";

const FieldComponentWrapper = ({
  children,
  componentName,
  fieldPath,
  icon,
  label,
  description,
  helpText,
  placeholder,
  required,
  ...extraProps
}) => {
  const { currentFieldMods } = useContext(FormUIStateContext);
  const {
    defaultFieldValues,
    descriptionMods,
    helpTextMods,
    iconMods,
    labelMods,
    placeholderMods,
    priorityFieldValues,
    extraRequiredFields,
  } = currentFieldMods;
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
  // const {
  //   ...filteredExtraProps
  // } = cleanedExtraProps

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
              description: moddedDescription,
              fieldPath: fieldPath,
              helpText: moddedHelpText,
              label: moddedLabel,
              icon: moddedIcon,
              placeholder: moddedPlaceholder,
              priorityFieldValues: priorityFieldValueSet,
              required: moddedRequired,
              ...cleanedExtraProps,
            },
            null
          )}
      </Overridable>
    </>
  );
};

export { FieldComponentWrapper };
