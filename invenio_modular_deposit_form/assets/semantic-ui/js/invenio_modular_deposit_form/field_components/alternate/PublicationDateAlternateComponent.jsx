// Part of the Knowledge Commons Repository
// Copyright (C) 2023-2026 MESH Research
//
// Alternate publication date UI: Y/M/D dropdowns composing metadata.publication_date
// (`replacement_components/alternate_components/PublicationDateFieldAlternate`).

import React from "react";
import { PublicationDateFieldAlternate } from "../../replacement_components/alternate_components/PublicationDateFieldAlternate";
import { FieldComponentWrapper } from "../FieldComponentWrapper";

/**
 * Publication date (metadata.publication_date). Uses PublicationDateFieldAlternate (Y/M/D dropdowns).
 */
const PublicationDateAlternateComponent = ({
  fieldPath = "metadata.publication_date",
  ...extraProps
}) => {
  return (
    <FieldComponentWrapper
      componentName="PublicationDateField"
      fieldPath={fieldPath}
      {...extraProps}
    >
      <PublicationDateFieldAlternate required fieldPath={fieldPath} />
    </FieldComponentWrapper>
  );
};

export { PublicationDateAlternateComponent };
