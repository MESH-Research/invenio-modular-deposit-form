import React from "react";
import Overridable from "react-overridable";
import { pickBy } from "lodash";
import { useCurrentFieldMods } from "../hooks/useCurrentFieldMods";

const FieldComponentWrapper = ({
  children,
  componentName,
  fieldPath,
  icon,
  labelIcon,
  label,
  description,
  helpText,
  placeholder,
  required,
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
  const moddedIcon =
    iconMods && iconMods.hasOwnProperty(fieldPath) ? iconMods[fieldPath] : icon;
  // Upstream invenio-rdm-records contrib uses labelIcon; custom field widgets expect icon
  const effectiveIcon = moddedIcon ?? labelIcon;
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
    <Overridable
      id={`InvenioAppRdm.Deposit.${componentName}.container`}
      fieldPath={fieldPath}
    >
      <div className={ `invenio-field-wrapper ${fieldPath.replaceAll(".", "-").replaceAll(":", "-")
      }-field` }>
      {children &&
        React.cloneElement(children, {
          defaultFieldValue: defaultFieldValue,
          description: moddedDescription,
          fieldPath: fieldPath,
          helpText: moddedHelpText,
          label: moddedLabel,
          icon: effectiveIcon,
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
