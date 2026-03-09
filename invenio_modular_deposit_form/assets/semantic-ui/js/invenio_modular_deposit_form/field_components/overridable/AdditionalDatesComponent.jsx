// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock DatesField with DatesFieldAlternate implementation.

import React from "react";
import { DatesFieldAlternate } from "../../replacement_components/DatesFieldAlternate";

/**
 * Additional dates field (metadata.dates). Uses DatesFieldAlternate instead of stock DatesField.
 *
 * When used as an override (via the Overridable id), this component receives the same props as the
 * default child (fieldPath, label, description, options, etc.) from react-overridable.
 *
 * This package provides the default component for this section. Include the regular component name
 * from field_components.jsx (AdditionalDatesComponent) in your configured form layout. To use this
 * overridable version instead, use either:
 *
 * 1. Overridable registry: in your instance's assets/js/invenio_app_rdm/overridableRegistry/mapping.js,
 * add this component to overriddenComponents for the Overridable id `InvenioAppRdm.Deposit.DateField.container`.
 * To pass additional props when using the Overridable registry, use ReactOverridable's parametrize
 * (e.g. parametrize(OverrideAdditionalDatesComponent, { ...props })) and register the parametrized
 * component; see the instance's mapping.js for examples.
 *
 * @example Overridable registry (in instance assets/js/invenio_app_rdm/overridableRegistry/mapping.js)
 * ```js
 * import { OverrideAdditionalDatesComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * overriddenComponents["InvenioAppRdm.Deposit.DateField.container"] = OverrideAdditionalDatesComponent;
 * ```
 *
 * 2. Component registry: register this component in the instance's invenio_modular_deposit_form
 * component registry and include it in the configured form layout by name (OverrideAdditionalDatesComponent).
 * To pass additional props when using the component registry, pass them via the layout config
 * (section props for that component).
 *
 * @example Component registry (instance componentsRegistry.js and form layout)
 * In your instance's componentsRegistry.js (from your entry point or alias), add an entry for this
 * override and merge with or replace the default registry. In the form layout (COMMON_FIELDS or
 * FIELDS_BY_TYPE), set the section's component to the key you used; section props are passed to the component.
 *
 * ```js
 * import { OverrideAdditionalDatesComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * OverrideAdditionalDatesComponent: [OverrideAdditionalDatesComponent, ["metadata.dates"]],
 * ```
 */
const OverrideAdditionalDatesComponent = ({
  fieldPath = "metadata.dates",
  options,
  ...extraProps
}) => (
  <DatesFieldAlternate
    fieldPath={fieldPath}
    options={options}
    showEmptyValue={false}
    {...extraProps}
  />
);

export { OverrideAdditionalDatesComponent };
