import { useStore } from "react-redux";
import { useFormUIState } from "../FormUIStateManager.jsx";

/**
 * Returns field mods for the current resource type from Redux config.
 * Reads config via useStore(); currentResourceType from useFormUIState.
 */
export function useCurrentFieldMods() {
  const config = useStore().getState().deposit?.config;
  const { formUIState } = useFormUIState();
  const currentResourceType = formUIState?.currentResourceType;

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
