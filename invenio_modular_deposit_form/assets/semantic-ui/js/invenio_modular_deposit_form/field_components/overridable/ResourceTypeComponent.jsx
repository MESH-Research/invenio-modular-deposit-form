// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock ResourceTypeField with ResourceTypeSelectorField (button-style).

import React from "react";
import ResourceTypeSelectorField from "../../replacement_components/ResourceTypeSelectorField";

/**
 * Resource type (metadata.resource_type). Uses ResourceTypeSelectorField (button-style) instead of stock dropdown.
 *
 * When used as an override (via the Overridable id), this component receives the same props as the
 * default child (fieldPath, label, required, etc.) from FieldComponentWrapper.
 *
 * This package provides the default component for this section. Include the regular component name
 * from field_components.jsx (ResourceTypeComponent) in your configured form layout. To use this
 * overridable version instead, use either:
 *
 * 1. Overridable registry: in your instance's assets/js/invenio_app_rdm/overridableRegistry/mapping.js,
 * add this component to overriddenComponents for the Overridable id `InvenioAppRdm.Deposit.ResourceTypeField.container`.
 * To pass additional props when using the Overridable registry, use ReactOverridable's parametrize
 * (e.g. parametrize(OverrideResourceTypeComponent, { ...props })) and register the parametrized component;
 * see the instance's mapping.js for examples.
 *
 * @example Overridable registry (in instance assets/js/invenio_app_rdm/overridableRegistry/mapping.js)
 * ```js
 * import { OverrideResourceTypeComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * overriddenComponents["InvenioAppRdm.Deposit.ResourceTypeField.container"] = OverrideResourceTypeComponent;
 * ```
 *
 * 2. Component registry: register this component in the instance's invenio_modular_deposit_form
 * component registry and include it in the configured form layout by name (OverrideResourceTypeComponent).
 * To pass additional props when using the component registry, pass them via the layout config
 * (section props for that component).
 *
 * @example Component registry (instance componentsRegistry.js and form layout)
 * In your instance's componentsRegistry.js (from your entry point or alias), add an entry for this
 * override. You can use key ResourceTypeComponent to replace the default or OverrideResourceTypeComponent
 * as a new name. In the form layout, set the section's component to that key; section props are passed to the component.
 *
 * ```js
 * import { OverrideResourceTypeComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * ResourceTypeComponent: [OverrideResourceTypeComponent, ["metadata.resource_type"]],
 * ```
 */
const OverrideResourceTypeComponent = ({
  fieldPath = "metadata.resource_type",
  ...extraProps
}) => (
  <ResourceTypeSelectorField
    fieldPath={fieldPath}
    required={true}
    {...extraProps}
  />
);

export { OverrideResourceTypeComponent };
