import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext, getIn } from "formik";

import { SelectField } from "./SelectField";

function MultiInput({
  additionLabel = undefined,
  classnames = undefined,
  description = undefined,
  placeholder = undefined,
  fieldPath,
  helpText = undefined,
  label,
  labelIcon,
  noQueryMessage,
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
      {...uiProps}
      icon={undefined}
    />
  );
}

MultiInput.propTypes = {
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

export default MultiInput;