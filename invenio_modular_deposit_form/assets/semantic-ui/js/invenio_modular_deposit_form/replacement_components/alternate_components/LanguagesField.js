// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Based on a file from Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { useFormikContext } from "formik";
import PropTypes from "prop-types";
import { FieldLabel } from "react-invenio-forms";
import { RemoteSelectField } from "./RemoteSelectField";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

export const LanguagesField = ({
  classnames = undefined,
  fieldPath,
  label,
  icon,
  required,
  multiple=true,
  placeholder=i18next.t('Search for a language by name (e.g "eng", "fra" or "Polish")'),
  clearable,
  initialOptions,
  serializeSuggestions: serializeSuggestionsFunc,
  onValueChange,
  ...uiProps
}) => {
  const serializeSuggestions = serializeSuggestionsFunc || null;

  return (
    <RemoteSelectField
      classnames={classnames}
      fieldPath={fieldPath}
      suggestionAPIUrl="/api/vocabularies/languages"
      suggestionAPIHeaders={{
        Accept: "application/vnd.inveniordm.v1+json",
      }}
      {...(onValueChange && { onValueChange })}
      placeholder={placeholder}
      required={required}
      clearable={clearable}
      multiple={multiple}
      upward={false}
      initialSuggestions={initialOptions}
      label={label}
      noQueryMessage={i18next.t("Type the full name of a language to search...")}
      noResultsMessage={i18next.t("Type the full name of a language to search...")}
      {...(serializeSuggestions && { serializeSuggestions })}
      {...uiProps}
    />
  );
}

LanguagesField.propTypes = {
  classnames: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  icon: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  clearable: PropTypes.bool,
  placeholder: PropTypes.string,
  initialOptions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
      text: PropTypes.string,
    })
  ),
  serializeSuggestions: PropTypes.func,
};

LanguagesField.defaultProps = {
  label: i18next.t("Languages"),
  icon: "globe",
  multiple: true,
  clearable: true,
  placeholder: i18next.t('Search for a language by name (e.g "eng", "fr" or "Polish")'),
  required: false,
  initialOptions: undefined,
  serializeSuggestions: undefined,
};
