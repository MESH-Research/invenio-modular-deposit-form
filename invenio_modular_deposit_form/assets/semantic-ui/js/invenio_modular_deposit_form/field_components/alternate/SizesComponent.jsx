// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// No stock SizesField in invenio_rdm_records for metadata.sizes. This contrib
// component is the single implementation using the package's SizesField.

import React from "react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { SizesFieldAlternate as SizesField } from "./field_inputs/SizesField";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/**
 * Sizes/dimensions field (metadata.sizes). No stock component in RDM; this is the only implementation.
 * Wraps the package's SizesField in FieldComponentWrapper for layout/overridable support.
 *
 * @example Register in components registry (default field_components.jsx already imports this from contrib)
 * import { SizesComponent } from "@js/.../field_components/contrib";
 * componentsRegistry.SizesComponent = [SizesComponent, ["metadata.sizes"]];
 *
 * @example Override via ReactOverridable (parent app)
 * Overridable id: `InvenioAppRdm.Deposit.SizeField.container`
 * The wrapper is provided by FieldComponentWrapper; override that id to customize the inner content.
 * Props: fieldPath="metadata.sizes", labelIcon="crop", label (i18n "Dimensions"); inner SizesField gets label="Size".
 */
const SizesComponent = ({ ...extraProps }) => {
  return (
    <FieldComponentWrapper
      componentName="SizeField"
      fieldPath="metadata.sizes"
      labelIcon="crop"
      label={i18next.t("Dimensions")}
      {...extraProps}
    >
      <SizesField fieldPath="metadata.sizes" label="Size" />
    </FieldComponentWrapper>
  );
};

export { SizesComponent };
