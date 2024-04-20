import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext, getIn } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";

import { FieldLabel } from "react-invenio-forms";
import { SelectField } from "./SelectField";

function MultiInput({
  additionLabel = undefined,
  classnames = undefined,
  description = undefined,
  placeholder = undefined,
  fieldPath,
  helpText = undefined,
  label,
  icon = undefined,
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
    <>
      <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
      {description && description !== " " && <label className="helptext label top">{i18next.t(description)}</label>}
      <SelectField
        additionLabel={additionLabel}
        classnames={classnames}
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
        {...uiProps}
      />
      {helpText && helpText !== " " && <label className="helptext">{i18next.t(helpText)}</label>}
    </>
  );
}

MultiInput.propTypes = {
  classnames: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  additionLabel: PropTypes.string,
  icon: PropTypes.string,
  required: PropTypes.bool,
};

export default MultiInput;