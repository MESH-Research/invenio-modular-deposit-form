import React from "react";
import Overridable from "react-overridable";
import { useCurrentFieldMods } from "../hooks/useCurrentFieldMods";

/** Semantic UI 1–16 column words (matches semantic-ui-react numberToWordMap). */
const NUMBER_TO_WORD = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
  13: "thirteen",
  14: "fourteen",
  15: "fifteen",
  16: "sixteen",
};

/**
 * Build a Semantic UI width class segment (e.g. `"nine wide"`, `"nine wide computer"`).
 *
 * Mirrors semantic-ui-react `useWidthProp` naming used by `Form.Field` / `Grid.Column`.
 *
 * @param {string|number|undefined|null|false} val Width value from layout config.
 * @param {string} [widthClass="wide"] Suffix after the number word.
 * @returns {string}
 */
function toWidthClass(val, widthClass = "wide") {
  if (val === undefined || val === null || val === false || val === "") {
    return "";
  }
  const word = NUMBER_TO_WORD[val] ?? val;
  return `${word} ${widthClass}`;
}

/**
 * Layout width props that belong on the field wrapper (Form.Group / row participant),
 * not on the inner field widget.
 */
function buildWrapperWidthClasses({
  width,
  computer,
  largeScreen,
  mobile,
  tablet,
  widescreen,
}) {
  return [
    toWidthClass(width, "wide"),
    toWidthClass(computer, "wide computer"),
    toWidthClass(largeScreen, "wide large screen"),
    toWidthClass(mobile, "wide mobile"),
    toWidthClass(tablet, "wide tablet"),
    toWidthClass(widescreen, "wide widescreen"),
  ].filter(Boolean);
}

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
  // SUI layout widths — applied on this wrapper, not forwarded to the field widget.
  width,
  computer,
  largeScreen,
  widescreen,
  tablet,
  mobile,
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
  const widthClasses = buildWrapperWidthClasses({
    width,
    computer,
    largeScreen,
    mobile,
    tablet,
    widescreen,
  });
  // Form width CSS targets `.N.wide.field`; keep `field` when widths are set.
  const needsFieldClass = isRowField || widthClasses.length > 0;

  return (
    <div
      className={[
        "invenio-field-wrapper",
        `${fieldPath.replaceAll(".", "-").replaceAll(":", "-")}-field`,
        needsFieldClass ? "field" : "",
        ...widthClasses,
        wrapperClasses,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Overridable id={`InvenioAppRdm.Deposit.${componentName}.container`} fieldPath={fieldPath}>
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
      </Overridable>
    </div>
  );
};

export { FieldComponentWrapper };
