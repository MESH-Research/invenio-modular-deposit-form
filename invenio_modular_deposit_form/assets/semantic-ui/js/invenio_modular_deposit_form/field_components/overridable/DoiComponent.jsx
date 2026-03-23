// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock PIDField with replacement implementation.

import React, { Fragment } from "react";
import { useStore } from "react-redux";
import { PIDFieldAlternate } from "../../replacement_components/alternate_components/PIDField";

/**
 * DOI/identifier field(s). Renders one PIDField per scheme in config.pids (e.g. doi). Uses the
 * package's replacement PIDField instead of stock.
 *
 * When used as an override (via the Overridable id), this component receives the same props as the
 * default child. Config (pids, record) is read from the store for the PID list and record state.
 *
 * This package provides the default component for this section. Include the regular component name
 * from field_components.jsx (DoiComponent) in your configured form layout. To use this overridable
 * version instead, use either:
 *
 * 1. Overridable registry: in your instance's assets/js/invenio_app_rdm/overridableRegistry/mapping.js,
 * add this component to overriddenComponents for the Overridable id `InvenioAppRdm.Deposit.PIDField.container`.
 * To pass additional props when using the Overridable registry, use ReactOverridable's parametrize
 * (e.g. parametrize(OverrideDoiComponent, { ...props })) and register the parametrized component;
 * see the instance's mapping.js for examples.
 *
 * @example Overridable registry (in instance assets/js/invenio_app_rdm/overridableRegistry/mapping.js)
 * ```js
 * import { OverrideDoiComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * overriddenComponents["InvenioAppRdm.Deposit.PIDField.container"] = OverrideDoiComponent;
 * ```
 *
 * 2. Component registry: register this component in the instance's invenio_modular_deposit_form
 * component registry and include it in the configured form layout by name (OverrideDoiComponent).
 * To pass additional props when using the component registry, pass them via the layout config
 * (section props for that component).
 *
 * @example Component registry (instance componentsRegistry.js and form layout)
 * In your instance's componentsRegistry.js (from your entry point or alias), add an entry for this
 * override. You can use key DoiComponent to replace the default or OverrideDoiComponent as a new
 * name. In the form layout, set the section's component to that key; section props are passed to the component.
 *
 * ```js
 * import { OverrideDoiComponent } from "@js/invenio_modular_deposit_form/field_components/overridable";
 * DoiComponent: [OverrideDoiComponent, ["pids.doi"]],
 * ```
 */
const OverrideDoiComponent = ({ ...extraProps }) => {
  const store = useStore();
  const pids = store.getState().deposit.config.pids;
  const record = store.getState().deposit.record;

  return (
    <>
      {pids.map((pid) => (
        <Fragment key={pid.scheme}>
          <PIDFieldAlternate
            btnLabelDiscardPID={pid.btn_label_discard_pid}
            btnLabelGetPID={pid.btn_label_get_pid}
            canBeManaged={pid.can_be_managed}
            canBeUnmanaged={pid.can_be_unmanaged}
            fieldPath={`pids.${pid.scheme}`}
            fieldLabel={pid.field_label}
            isEditingPublishedRecord={
              record.is_published === true
            }
            managedHelpText={pid.managed_help_text}
            pidLabel={pid.pid_label}
            pidPlaceholder={pid.pid_placeholder}
            pidType={pid.scheme}
            unmanagedHelpText={pid.unmanaged_help_text}
            required
            {...extraProps}
          />
        </Fragment>
      ))}
    </>
  );
};

export { OverrideDoiComponent };
