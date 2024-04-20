import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext, getIn } from "formik";

import { FieldLabel } from "react-invenio-forms";
import { SelectField } from "./SelectField";

function MultiInput({
  additionLabel = undefined,
  description,
  placeholder,
  fieldPath,
  helpText,
  label,
  icon = undefined,
  noQueryMessage,
  required = false,
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
    <>
      <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
      {description && <label className="helptext">{description}</label>}
      <SelectField
        additionLabel={additionLabel}
        allowAdditions
        className="invenio-multi-input"
        clearable
        defaultValue={[]}
        description={""}
        fieldPath={fieldPath}
        helpText={""}
        label={""}
        multiple
        noQueryMessage={noQueryMessage}
        noResultsMessage={""}
        onChange={({ data, formikProps }) => {
          setOptions(serializeValues(data.value));
          formikProps.form.setFieldValue(fieldPath, data.value);
        }}
        onAddItem={({ data }) => {
          setOptions([{ text: data.value, value: data.value }, ...options]);
        }}
        optimized
        options={serializeValues(getIn(values, fieldPath, []))}
        placeholder={placeholder}
        required={required}
        search
      />
      {helpText && <label className="helptext">{helpText}</label>}
    </>
  );
}

MultiInput.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  additionLabel: PropTypes.string,
  icon: PropTypes.string,
  required: PropTypes.bool,
};

export default MultiInput;