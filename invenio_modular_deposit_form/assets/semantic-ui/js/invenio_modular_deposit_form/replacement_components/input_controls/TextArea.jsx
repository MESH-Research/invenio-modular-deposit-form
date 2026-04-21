import React from "react";
import { Field, FastField, getIn } from "formik";
import { Form } from "semantic-ui-react";
import { ErrorLabel, FieldLabel } from "react-invenio-forms";
import { getTouchedParent } from "../../utils";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

const TextArea = ({
  classnames,
  description = undefined,
  error,
  fieldPath,
  fluid = true,
  helpText = undefined,
  label,
  labelIcon,
  onBlur,
  optimized = false,
  required = false,
  rows = 3,
  showLabel = true,
  width,
  ...extraProps
}) => {
  // FIXME: Implement the extraRequiredFields and defaultFieldValues props
  // FIXME: reimplement the richtext editor
  const { defaultFieldValue, editorConfig, ...uiProps } = extraProps;

  const FormikField = optimized ? FastField : Field;

  return (
    <FormikField
      id={fieldPath}
      key={fieldPath}
      name={fieldPath}
      fieldPath={fieldPath}
      optimized={optimized}
    >
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors, values }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => {
        const descriptionId =
          description && description !== " " ? `${fieldPath}.description` : "";
        const helptextId =
          helpText && helpText !== " " ? `${fieldPath}.helptext` : "";
        const describedByText =
          [descriptionId, helptextId].filter(Boolean).join(" ") || undefined;
        const labelId = showLabel && label ? `${fieldPath}.label` : undefined;

        return (
          <Form.Field
            required={!!required}
            error={
              (!!meta.error && !!meta.touched) ||
              !!error ||
              (field.value === meta.initialValue && !!meta.initialError)
            }
            className={`invenio-text-area-field ${classnames ? classnames : ""}`}
            width={width}
          >
            {showLabel && label && (
              <FieldLabel
                id={`${fieldPath}.label`}
                htmlFor={fieldPath}
                icon={labelIcon}
                label={label}
              />
            )}
            {descriptionId && (
              <div className="description" id={descriptionId}>
                {React.isValidElement(description)
                  ? description
                  : i18next.t(description)}
              </div>
            )}
            <Form.TextArea
              id={fieldPath}
              name={fieldPath}
              rows={rows}
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
            {((!!meta.error && !!meta.touched) ||
              !!error ||
              (field.value === meta.initialValue && !!meta.initialError)) && (
              <ErrorLabel fieldPath={fieldPath} />
            )}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { TextArea };
