// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Overridable: replaces stock DatesField with DatesFieldAlternate implementation.

import React from "react";
import { useStore } from "react-redux";
import { DatesFieldAlternate } from "../../replacement_components/DatesFieldAlternate";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/**
 * Additional dates field (metadata.dates). Uses DatesFieldAlternate inside FieldComponentWrapper.
 * Use this component when you want the alternate dates UI instead of stock DatesField.
 *
 * @example Register in components registry
 * import { AdditionalDatesComponent } from "@js/.../field_components/overridable";
 * componentsRegistry.AdditionalDatesComponent = [AdditionalDatesComponent, ["metadata.dates"]];
 *
 * @example Override via ReactOverridable (parent app)
 * Overridable id: `InvenioAppRdm.Deposit.DateField.container`
 * The wrapper is provided by FieldComponentWrapper; override that id to replace the inner content.
 * Stock inner: InvenioRdmRecords.DatesField.AddDateArrayField.Container.
 * Props passed to wrapper: fieldPath, options (vocabularies.metadata.dates), showEmptyValue.
 */
const AdditionalDatesComponent = ({ ...extraProps }) => {
  const vocabularies = useStore().getState().deposit?.config?.vocabularies ?? { metadata: {} };

  return (
    <FieldComponentWrapper
      componentName="DateField"
      fieldPath="metadata.dates"
      {...extraProps}
    >
      <DatesFieldAlternate
        fieldPath="metadata.dates"
        options={vocabularies.metadata.dates}
        showEmptyValue={false}
      />
    </FieldComponentWrapper>
  );
};

export { AdditionalDatesComponent };
