import React from "react";
import { FastField, Field, useFormikContext } from "formik";
import _isEmpty from "lodash/isEmpty";

import { Dropdown, Form } from "semantic-ui-react";
import { FieldLabel } from "react-invenio-forms";
import { set } from "lodash";

const SelectField = ({
  defaultValue = "",
  error = undefined,
  errorDirection = "above",
  fieldPath,
  label = "",
  labelIcon = undefined,
  onAddItem = undefined,
  onChange = undefined,
  optimized = false,
  options,
  multiple = false,
  required = false,
  selectOnBlur = false,
  width = undefined,
  ...otherProps
}) => {
  const FormikField = optimized ? FastField : Field;
  const { setFieldValue } = useFormikContext();

  const displayError = (meta) => {
    let error = meta.error;
    if (!Array.isArray(meta.value)) {
      if (
        !_isEmpty(options) &&
        !options.find(function (o) {
          return o.value === meta.value;
        }) &&
        !_isEmpty(meta.value)
      ) {
        error = 'The current value "'.concat(
          meta.value,
          '" is invalid, please select another value.'
        );
      }
    }
    return error
      ? {
          content: error,
          pointing: errorDirection,
        }
      : null;
  };

  const handleChange = (e, { value }) => {
    setFieldValue(fieldPath, value);
  };

  return (
    <FormikField id={fieldPath} name={fieldPath} as="select" {...otherProps}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, initialValues, initialErrors, etc.
        meta,
      }) => {
        return (
          <Form.Field
            error={meta.error && meta.touched ? true : undefined}
            width={width}
          >
            <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
            <Dropdown
              className="invenio-select-field"
              error={meta.error && meta.touched ? true : undefined}
              fluid={true}
              id={fieldPath}
              multiple={multiple}
              name={fieldPath}
              options={options}
              selection={true}
              selectOnBlur={selectOnBlur}
              {...field}
              {...otherProps}
              onChange={handleChange}
              onAddItem={onAddItem}
              value={field.value || defaultValue}
            />
            {meta.error && meta.touched && (
              <div
                className={`ui pointing above ${errorDirection} prompt label `}
                role="alert"
                aria-atomic="true"
              >
                {meta.error}
              </div>
            )}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { SelectField };
