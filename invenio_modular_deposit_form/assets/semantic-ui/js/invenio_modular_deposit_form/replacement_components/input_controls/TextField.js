import React from "react";
import { FastField, Field } from "formik";
import { Form } from "semantic-ui-react";
import { FieldLabel } from "./FieldLabel";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { getTouchedParent } from "../../utils";

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

  const descriptionId = description && description !== " " ? `${fieldPath}.description` : "";
  const helptextId = helpText && helpText !== " " ? `${fieldPath}.helptext` : "";
  const describedByText =
    [descriptionId, helptextId].filter(Boolean).join(" ") || undefined;
  const labelId = showLabel && label ? `${fieldPath}.label` : undefined;

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
            {showLabel && label ? (
              <FieldLabel
                id={`${fieldPath}.label`}
                htmlFor={fieldPath}
                icon={labelIcon}
                label={label}
              />
            ) : null}
            {descriptionId && (
              <div className="description mb-5 mt-5" id={descriptionId}>
                {React.isValidElement(description)
                  ? description
                  : i18next.t(description)}
              </div>
            )}
            <Form.Input
              error={showError ? meta.error : undefined}
              disabled={disabled}
              fluid={fluid}
              icon={undefined}
              id={fieldPath}
              name={fieldPath}
              {...field}
              {...(onBlur && {
                onBlur: (e) => {
                  onBlur(e);
                  field.onBlur(e);
                },
              })}
              {...uiProps}
              {...(describedByText ? { "aria-describedby": describedByText } : {})}
              {...(labelId ? { "aria-labelledby": labelId } : {})}
            />
            {helptextId && (
              <div className="helptext" id={helptextId}>
                {React.isValidElement(helpText)
                  ? helpText
                  : i18next.t(helpText)}
              </div>
            )}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { TextField };
