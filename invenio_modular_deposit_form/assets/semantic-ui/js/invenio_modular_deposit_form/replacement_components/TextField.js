import React from "react";
import { FastField, Field } from "formik";
import { Form } from "semantic-ui-react";
import { FieldLabel } from "./FieldLabel";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { getTouchedParent } from "../utils";

const TextField = ({
  classnames,
  description,
  disabled,
  error,
  fieldPath,
  fluid = "true",
  helpText,
  label,
  labelIcon,
  onBlur,
  optimized,
  required,
  showLabel = true,
  width,
  ...extraProps
}) => {
  const FormikField = Field;
  // FIXME: reimplement FastField with custom shouldComponentUpdate to register prop changes? (FormikField = optimized ? FastField : Field;)
  // FIXME: Implement the extraRequiredFields, priorityFieldValues and defaultFieldValues props
  const {
    customFieldsUI,
    defaultFieldValue,
    priorityFieldValues,
    extraRequiredFields,
    ...uiProps
  } = extraProps;
  return (
    <FormikField id={fieldPath} name={fieldPath}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => {
        const showError =
          (!!meta.error && !!meta.touched) ||
          !!error ||
          (field.value === meta.initialValue && !!meta.initialError)
            ? true
            : false;

        return (
          <Form.Field
            required={!!required}
            error={showError}
            className={`invenio-text-input-field ${classnames ? classnames : ""} ${label?.length < 1 ? "no-label" : ""}`}
            fluid={fluid.toString()}
            width={width}
          >
            {showLabel && (
              <FieldLabel
                id={`${fieldPath}.label`}
                htmlFor={fieldPath}
                icon={labelIcon}
                label={label}
              />
            )}
            {description && description !== " " && (
              <label className="helptext" id={`${fieldPath}.helptext`}>
                {i18next.t(description)}
              </label>
            )}
            <Form.Input
              error={showError ? meta.error : undefined}
              disabled={disabled}
              fluid={fluid}
              icon={undefined}
              id={fieldPath}
              name={fieldPath}
              aria-labelledby={`${fieldPath}.label`}
              aria-describedby={`${fieldPath}.helptext`}
              {...field}
              {...(onBlur && {
                onBlur: (e) => {
                  onBlur(e);
                  field.onBlur(e);
                },
              })}
              {...uiProps}
            />
            {helpText && helpText !== " " && (
              <label className="helptext" id={`${fieldPath}.helptext`}>
                {React.isValidElement(helpText) ? helpText : i18next.t(helpText)}
              </label>
            )}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { TextField };
