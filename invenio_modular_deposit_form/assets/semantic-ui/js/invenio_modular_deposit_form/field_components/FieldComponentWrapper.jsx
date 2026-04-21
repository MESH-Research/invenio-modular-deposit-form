import React from "react";
import Overridable from "react-overridable";
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
  section,
  index,
  wrapped,
  show_heading,
  component,
  wrapperClasses,
  ...restExtraProps
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

  const moddedLabelIcon =
    iconMods && Object.hasOwn(iconMods, fieldPath) ? iconMods[fieldPath] : (labelIcon ?? icon);
  const effectiveLabelIcon = moddedLabelIcon ?? labelIcon ?? icon;
  const moddedLabel =
    labelMods && Object.hasOwn(labelMods, fieldPath) ? labelMods[fieldPath] : label;
  const moddedDescription =
    descriptionMods && Object.hasOwn(descriptionMods, fieldPath)
      ? descriptionMods[fieldPath]
      : description;
  const moddedPlaceholder =
    placeholderMods && Object.hasOwn(placeholderMods, fieldPath)
      ? placeholderMods[fieldPath]
      : placeholder;
  const moddedHelpText =
    helpTextMods && Object.hasOwn(helpTextMods, fieldPath) ? helpTextMods[fieldPath] : helpText;
  const moddedRequired =
    extraRequiredFields && Object.hasOwn(extraRequiredFields, fieldPath)
      ? extraRequiredFields[fieldPath]
      : required;
  const defaultFieldValue =
    defaultFieldValues && Object.hasOwn(defaultFieldValues, fieldPath)
      ? defaultFieldValues[fieldPath]
      : null;
  const priorityFieldValueSet =
    priorityFieldValues && Object.hasOwn(priorityFieldValues, fieldPath)
      ? priorityFieldValues[fieldPath]
      : null;
  const cleanedExtraProps = Object.fromEntries(
    Object.entries(restExtraProps).filter(([, value]) => value !== undefined)
  );

  return (
    <Overridable id={`InvenioAppRdm.Deposit.${componentName}.container`} fieldPath={fieldPath}>
      <div
        className={[
          "invenio-field-wrapper",
          `${fieldPath.replaceAll(".", "-").replaceAll(":", "-")}-field`,
          isRowField ? "field" : "",
          wrapperClasses,
        ]
          .filter(Boolean)
          .join(" ")}
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
