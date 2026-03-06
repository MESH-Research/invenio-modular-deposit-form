import { useContext } from "react";
import { useStore } from "react-redux";
import { FormUIStateContext } from "../FormLayoutContainer";

/**
 * Returns field mods for the current resource type from Redux config.
 * Reads config via useStore(); currentResourceType from FormUIStateContext.
 */
export function useCurrentFieldMods() {
  const config = useStore().getState().deposit?.config;
  const { currentResourceType } = useContext(FormUIStateContext);

  const labelModifications = config?.label_modifications ?? {};
  const iconModifications = config?.icon_modifications ?? {};
  const helpTextModifications = config?.help_text_modifications ?? {};
  const placeholderModifications = config?.placeholder_modifications ?? {};
  const descriptionModifications = config?.description_modifications ?? {};
  const defaultFieldValues = config?.default_field_values ?? {};
  const priorityFieldValues = config?.priority_field_values ?? {};
  const extraRequiredFields = config?.extra_required_fields ?? {};

  return {
    labelMods: labelModifications[currentResourceType],
    iconMods: iconModifications[currentResourceType],
    helpTextMods: helpTextModifications[currentResourceType],
    placeholderMods: placeholderModifications[currentResourceType],
    descriptionMods: descriptionModifications[currentResourceType],
    defaultFieldValues: defaultFieldValues[currentResourceType],
    priorityFieldValues: priorityFieldValues[currentResourceType],
    extraRequiredFields: extraRequiredFields[currentResourceType],
  };
}
