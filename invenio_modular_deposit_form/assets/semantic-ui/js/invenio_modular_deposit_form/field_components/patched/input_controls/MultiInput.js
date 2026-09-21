// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms MultiInput.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms MultiInput:
//
// ### Delegates to replacement SelectField
// - Renders local `SelectField` (`multiple`, `allowAdditions`, `search`, `clearable`)
//   so touched-aware errors, `classnames`, and the description/help slots apply.
//   Stock uses its own `SelectField`.
//
// ### Support for both help text and description (above and below the input)
// - Passes **`description`** and **`helpText`** through separately to `SelectField`.
//   Stock merges `helpText ?? description` into one string and renders it as a sibling
//   `<label class="helptext">` outside the select.
//
// ### Label and icon
// - Passes `label` and `labelIcon` into `SelectField` (which renders `FieldLabel`).
//   Stock builds a `FieldLabel` itself from `labelIcon ?? icon`.
//
// ### Empty-menu copy
// - Sets `noResultsMessage=""`. Stock sets `noResultsMessage={placeholder}`, so an
//   empty additions menu repeats the placeholder as “no results” text.
//
// ### openOnFocus / noQueryMessage
// - Forces `openOnFocus={false}` so focusing a tag field does not open an empty
//   additions menu. Drops `noQueryMessage` (a RemoteSelect empty-query string);
//   callers still pass it, but this widget is type-and-Enter, not remote search.
//

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext, getIn } from "formik";
import { showHideOverridableWithDynamicId } from "react-invenio-forms";

import { SelectField } from "./SelectField";

function MultiInputComponent({
  additionLabel = undefined,
  classnames = undefined,
  description = undefined,
  placeholder = undefined,
  fieldPath,
  helpText = undefined,
  label,
  labelIcon,
  noQueryMessage: _noQueryMessage,
  openOnFocus = false,
  required = false,
  ...uiProps
}) {
  const [options, setOptions] = useState([]);
  const { values } = useFormikContext();
  const serializeValues = (values) =>
    values?.map((item) => ({
      text: item,
      key: item,
      value: item,
    }));

  return (
    <SelectField
      additionLabel={additionLabel}
      classnames={classnames}
      allowAdditions
      className="invenio-multi-input"
      clearable
      defaultValue={[]}
      description={description}
      fieldPath={fieldPath}
      helpText={helpText}
      label={label}
      labelIcon={labelIcon}
      multiple
      noResultsMessage={""}
      onChange={({ data, formikProps }) => {
        setOptions(serializeValues(data.value));
        formikProps.form.setFieldValue(fieldPath, data.value);
      }}
      onAddItem={({ data }) => {
        setOptions([{ text: data.value, value: data.value }, ...options]);
      }}
      openOnFocus={false}
      optimized
      options={serializeValues(getIn(values, fieldPath, []))}
      placeholder={placeholder}
      required={required}
      search
      {...uiProps}
      icon={null}
    />
  );
}

MultiInputComponent.propTypes = {
  classnames: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  placeholder: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  additionLabel: PropTypes.string,
  labelIcon: PropTypes.string,
  noQueryMessage: PropTypes.string,
  required: PropTypes.bool,
};

const MultiInput = showHideOverridableWithDynamicId(MultiInputComponent);

export default MultiInput;
export { MultiInput };
