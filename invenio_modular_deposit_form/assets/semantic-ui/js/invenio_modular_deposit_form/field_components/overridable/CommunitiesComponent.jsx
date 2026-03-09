// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock community field with replacement CommunityField.

import React from "react";
import { CommunityField } from "../../replacement_components/CommunityField";

/**
 * Community selection. Uses replacement CommunityField instead of stock CommunityHeader.
 *
 * When used as an override (via the Overridable id), this component receives the same props as the
 * default child (e.g. record, imagePlaceholderLink) from the parent wrapper.
 *
 * This package provides the default component for this section. Include the regular component name
 * from field_components.jsx (CommunitiesComponent) in your configured form layout. To use this
 * overridable version instead, use either:
 *
 * 1. Overridable registry: in your instance's assets/js/invenio_app_rdm/overridableRegistry/mapping.js,
 * add this component to overriddenComponents for the Overridable id `InvenioAppRdm.Deposit.CommunityHeader.container`.
 * To pass additional props when using the Overridable registry (e.g. imagePlaceholderLink for communities
 * without logos), use ReactOverridable's parametrize (e.g. parametrize(OverrideCommunitiesComponent,
 * { imagePlaceholderLink: "/static/images/..." })) and register the parametrized component; see the
 * instance's mapping.js for examples.
 *
 * @example Overridable registry (in instance assets/js/invenio_app_rdm/overridableRegistry/mapping.js)
 * ```js
 * import { OverrideCommunitiesComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * overriddenComponents["InvenioAppRdm.Deposit.CommunityHeader.container"] = OverrideCommunitiesComponent;
 * ```
 *
 * 2. Component registry: register this component in the instance's invenio_modular_deposit_form
 * component registry and include it in the configured form layout by name (OverrideCommunitiesComponent).
 * To pass additional props when using the component registry (e.g. imagePlaceholderLink), pass them
 * via the layout config (section props for that component).
 *
 * @example Component registry (instance componentsRegistry.js and form layout)
 * In your instance's componentsRegistry.js (from your entry point or alias), add an entry for this
 * override and merge with or replace the default registry. In the form layout, set the section's
 * component to OverrideCommunitiesComponent; pass imagePlaceholderLink and other props in the section config.
 *
 * ```js
 * import { OverrideCommunitiesComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * OverrideCommunitiesComponent: [OverrideCommunitiesComponent, []],
 * ```
 */
const OverrideCommunitiesComponent = ({ imagePlaceholderLink, ...extraProps }) => {
  return (
    <CommunityField
      imagePlaceholderLink={imagePlaceholderLink}
      {...extraProps}
    />
  );
};

export { OverrideCommunitiesComponent };
