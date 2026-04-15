// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Copy of stock SizesField; only MultiInput import is replaced.

import React from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import MultiInput from "../../replacement_components/input_controls/MultiInput";

const SizesField = ({
  classnames = undefined,
  fieldPath = "metadata.sizes",
  additionLabel,
  label = i18next.t("Sizes"),
  description = i18next.t("Please provide the size of the resource."),
  placeholder = i18next.t("e.g., 32 x 24 cm or 1.5 GB (press 'enter' to add)"),
  labelIcon = "crop",
  required,
  ...uiProps
}) => {
  return (
    <MultiInput
      fieldPath={`${fieldPath}`}
      {...{
        additionLabel,
        classnames,
        description,
        labelIcon,
        label,
        placeholder,
        required,
      }}
      {...uiProps}
    />
  );
};

SizesField.propTypes = {
  additionLabel: PropTypes.string,
  classnames: PropTypes.string,
  description: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  labelIcon: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

export { SizesField };
