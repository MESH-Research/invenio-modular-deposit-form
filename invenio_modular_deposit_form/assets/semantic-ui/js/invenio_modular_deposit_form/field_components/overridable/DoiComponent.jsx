// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock PIDField with replacement implementation.

import React, { Fragment } from "react";
import { useStore } from "react-redux";
import { PIDField } from "../../replacement_components/PIDField";

/**
 * DOI/identifier field(s). Renders one PIDField per scheme in config.pids (e.g. doi).
 * Use this component when you want the replacement PIDField instead of stock.
 *
 * @example Register in components registry
 * import { DoiComponent } from "@js/.../field_components/overridable";
 * componentsRegistry.DoiComponent = [DoiComponent, ["pids.doi"]];
 *
 * @example Override via ReactOverridable (parent app)
 * The stock DoiComponent in field_components.jsx does not wrap PID in FieldComponentWrapper,
 * so there is no single Overridable id for the PID block in the default. To override the
 * entire block, replace DoiComponent in the registry with this overridable version or your
 * own. If the stock component is later updated to expose an id (e.g. InvenioAppRdm.Deposit.PIDField.container
 * per scheme or for the block), the parent can override that id instead.
 * Stock: PIDField from @js/invenio_rdm_records. Props: fieldPath, fieldLabel, isEditingPublishedRecord,
 * record, pidType; optional btnLabelDiscardPID, btnLabelGetPID, canBeManaged, canBeUnmanaged,
 * managedHelpText, pidLabel, pidPlaceholder, required, unmanagedHelpText (from config.pids + record).
 */
const DoiComponent = ({ ...extraProps }) => {
  const store = useStore();
  const pids = store.getState().deposit.config.pids;
  const record = store.getState().deposit.record;

  return (
    <>
      {pids.map((pid) => (
        <Fragment key={pid.scheme}>
          <PIDField
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

export { DoiComponent };
