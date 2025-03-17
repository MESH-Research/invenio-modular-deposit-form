import { pickBy } from "lodash";

const findFieldProps = (fieldPath, currentFieldMods, icon, label, description, placeholder, helpText, required, defaultFieldValue ) => {
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
  const moddedDefaultFieldValue =
    defaultFieldValues && defaultFieldValues.hasOwnProperty[fieldPath]
      ? defaultFieldValues[fieldPath]
      : null;
  const priorityFieldValueSet =
    priorityFieldValues && priorityFieldValues.hasOwnProperty(fieldPath)
      ? priorityFieldValues[fieldPath]
      : null;
  return {
    moddedDefaultFieldValue,
    moddedDescription,
    moddedHelpText,
    moddedIcon,
    moddedLabel,
    moddedPlaceholder,
    moddedRequired,
  };
};

const fieldWrapperHOC = (Component) => {
  return (props) => {
    const { currentFieldMods } = useContext(FormUIStateContext);
    const { fieldPath, icon, label, description, placeholder, helpText, required, defaultFieldValue, ...extraProps } = props;
    const {
      moddedIcon,
      moddedLabel,
      moddedDescription,
      moddedPlaceholder,
      moddedHelpText,
      moddedRequired,
      moddedDefaultFieldValue,
    } = findFieldProps(fieldPath, currentFieldMods, icon, label, description, placeholder, helpText, required, defaultFieldValue);

    // Remove undefined values from extraProps
    const cleanedExtraProps = pickBy(extraProps, (v) => v !== undefined);

    return (
      <>
        <Overridable
          id={`InvenioAppRdm.Deposit.${componentName}.container`}
          fieldPath={fieldPath}
        >
          <Component
            defaultFieldValue={moddedDefaultFieldValue}
            description={moddedDescription}
            fieldPath={fieldPath}
            helpText={moddedHelpText}
            label={moddedLabel}
            icon={moddedIcon}
            placeholder={moddedPlaceholder}
            priorityFieldValues={priorityFieldValueSet}
            required={moddedRequired}
            {...cleanedExtraProps}
            data-testid={`${fieldPath}-field`}
          />
        </Overridable>
      </>
    );
  };
};

export { fieldWrapperHOC };