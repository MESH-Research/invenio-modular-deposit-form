// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock LanguagesField with replacement + state normalization.

import React, { useEffect } from "react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { useFormikContext } from "formik";
import { LanguagesField } from "../../replacement_components/LanguagesField";

/**
 * Languages (metadata.languages). Uses replacement LanguagesField with state normalization (id/title_l10n).
 *
 * When used as an override (via the Overridable id), this component receives the same props as the
 * default child (fieldPath, label, description, etc.) from FieldComponentWrapper.
 *
 * This package provides the default component for this section. Include the regular component name
 * from field_components.jsx (LanguagesComponent) in your configured form layout. To use this
 * overridable version instead, use either:
 *
 * 1. Overridable registry: in your instance's assets/js/invenio_app_rdm/overridableRegistry/mapping.js,
 * add this component to overriddenComponents for the Overridable id `InvenioAppRdm.Deposit.LanguagesField.container`.
 * To pass additional props when using the Overridable registry, use ReactOverridable's parametrize
 * (e.g. parametrize(OverrideLanguagesComponent, { ...props })) and register the parametrized component;
 * see the instance's mapping.js for examples.
 *
 * @example Overridable registry (in instance assets/js/invenio_app_rdm/overridableRegistry/mapping.js)
 * ```js
 * import { OverrideLanguagesComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * overriddenComponents["InvenioAppRdm.Deposit.LanguagesField.container"] = OverrideLanguagesComponent;
 * ```
 *
 * 2. Component registry: register this component in the instance's invenio_modular_deposit_form
 * component registry and include it in the configured form layout by name (OverrideLanguagesComponent).
 * To pass additional props when using the component registry, pass them via the layout config
 * (section props for that component).
 *
 * @example Component registry (instance componentsRegistry.js and form layout)
 * In your instance's componentsRegistry.js (from your entry point or alias), add an entry for this
 * override and merge with or replace the default registry. In the form layout (COMMON_FIELDS or
 * FIELDS_BY_TYPE), set the section's component to the key you used; section props are passed to the component.
 *
 * ```js
 * import { OverrideLanguagesComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * OverrideLanguagesComponent: [OverrideLanguagesComponent, ["metadata.languages"]],
 * ```
 */
const OverrideLanguagesComponent = ({
  fieldPath = "metadata.languages",
  initialOptions: initialOptionsProp,
  placeholder,
  serializeSuggestions,
  ...extraProps
}) => {
  const { setFieldValue, values } = useFormikContext();
  const formOptions =
    values?.metadata?.languages?.filter((lang) => lang !== null) || [];

  // When used as override we receive initialOptions (stock shape { key, value, text }) from the wrapper's default child.
  // Use it as-is for the field; convert to id/title_l10n for the normalization effect.
  const initialOptionsForField = initialOptionsProp;
  const initialOptionsForEffect = initialOptionsProp?.length
    ? initialOptionsProp.map((o) => ({ id: o.value, title_l10n: o.text }))
    : formOptions;

  useEffect(() => {
    const formHasStrings = formOptions.some((o) => typeof o === "string");
    const formMismatch =
      !formOptions?.length ||
      formOptions.some(
        (formOption, index) =>
          formOption.id !== initialOptionsForEffect[index]?.id ||
          formOption.title_l10n !== initialOptionsForEffect[index]?.title_l10n
      );
    if (
      initialOptionsForEffect?.length > 0 &&
      (formHasStrings || formMismatch)
    ) {
      setFieldValue("metadata.languages", initialOptionsForEffect);
    }
  }, []);

  const onValueChange = ({ event, data, formikProps }, selectedSuggestions) => {
    const fieldValues = selectedSuggestions.map((item) => ({
      title_l10n: item.text,
      id: item.value,
    }));
    setFieldValue("metadata.languages", fieldValues);
  };

  return (
    <LanguagesField
      fieldPath={fieldPath}
      initialOptions={initialOptionsForField}
      placeholder={placeholder ?? i18next.t(
        'Type to search for a language (press "enter" to select)'
      )}
      description={i18next.t(extraProps.description)}
      serializeSuggestions={serializeSuggestions ?? ((suggestions) =>
        suggestions.map((item) => ({
          text: item.title_l10n,
          value: item.id,
          key: item.id,
        }))
      )}
      noQueryMessage={i18next.t("No languages found")}
      aria-describedby="metadata.languages.helptext"
      multiple={true}
      onValueChange={onValueChange}
      {...extraProps}
    />
  );
};

export { OverrideLanguagesComponent };
