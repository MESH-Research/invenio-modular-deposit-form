import React from "react";
import { FastField, Field, getIn, useFormikContext } from "formik";
import _isEmpty from "lodash/isEmpty";

import { Dropdown, Form } from "semantic-ui-react";
import { FieldLabel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_rdm_records/i18next";

const SelectField = ({
  classnames = undefined,
  defaultValue = "",
  description = undefined,
  error = undefined,
  errorDirection = "above",
  fieldPath,
  helpText = undefined,
  label = "",
  icon = undefined,
  onAddItem = undefined,
  onChange = undefined,
  optimized = false,
  options,
  multiple = false,
  noResultsMessage = "No results found.",
  required = false,
  selectOnBlur = false,
  showLabel= true,
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

  const {
    customFieldsUI,
    noQueryMessage,
    defaultFieldValue,
    initialOptions,
    labelIcon,  // core Invenio prop name that we've renamed to icon
    ...uiProps
  } = otherProps;

  // TODO: implement extraRequiredFields, priorityFieldValues and defaultFieldValue

   return (
    <FormikField name={fieldPath} fieldPath={fieldPath} as="select" {...uiProps}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors, handleBlur, values, setFieldValue }, // also values, setXXXX, handleXXXX, dirty, isValid, status, initialValues, initialErrors, etc.
        meta,
      }) => {

        const _defaultValue = defaultValue || (multiple ? [] : "");
        const formikProps = { field, form: {touched, errors, values, setFieldValue}, meta };
        const showError = (!!meta.error && !!meta.touched ||
                !!error ||
                (field.value === meta.initialValue) && !!meta.initialError
              ) ? true : false;

        return (
          <Form.Field
            error={showError}
            width={width}
            {...(required && { required: true })}
            {...(!!uiProps.fluid && { fluid: true })}
          >
            {showLabel && (
            <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
            )}
            {description && description !== " " && (
              <div className="helptext label top" id={`${fieldPath}.helptext`}>
                {i18next.t(description)}
              </div>
            )}
            <Dropdown
              id={fieldPath}
              {...((!!description || !!helpText) && {
                "aria-describedby": `${fieldPath}.helptext`
              })}
              fluid
              className={`invenio-select-field ${classnames ? classnames : ""}`}
              selection
              error={!!showError ? true : false}
              label={null}
              name={fieldPath}
              noResultsMessage={noResultsMessage}
              // {...field}
              onBlur={handleBlur}
              onChange={(event, data) => {
                if (onChange!==undefined) {
                  onChange({event, data, formikProps});
                } else {
                  setFieldValue(fieldPath, data.value);
                }
              }}
              onAddItem={(event, data) => {
                if (onAddItem) {
                  onAddItem({event, data, formikProps});
                }
              }}
              options={options}
              value={field.value || _defaultValue}
              multiple={multiple}
              selectOnBlur={selectOnBlur}
              {...uiProps}
            />
            {!!showError && (
              <div
                className={`ui pointing above ${errorDirection} prompt label `}
                role="alert"
                aria-atomic="true"
              >
                {displayError(meta).content}
              </div>
            )}
            {helpText && helpText !== " " && (
              <div className="helptext label" id={`${fieldPath}.helptext`}>
                {i18next.t(helpText)}
              </div>
            )}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { SelectField };
