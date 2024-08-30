import React from "react";
import { FastField, Field } from "formik";
import { Form } from "semantic-ui-react";
import { FieldLabel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { getTouchedParent } from "../utils";

const TextField = ({
  classnames,
  description,
  disabled,
  error,
  fieldPath,
  fluid = "true",
  helpText,
  icon,
  label,
  onBlur,
  optimized,
  required,
  showLabel = true,
  width,
  ...extraProps
}) => {
  const FormikField = optimized ? FastField : Field;
  // FIXME: Implement the extraRequiredFields and defaultFieldValues props
  const {
    customFieldsUI,
    defaultFieldValue,
    ...uiProps
  } = extraProps;
  return (
    <FormikField id={fieldPath} name={fieldPath}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => {

        const showError = (!!meta.error && !!meta.touched ||
                !!error ||
                (field.value === meta.initialValue) && !!meta.initialError
              ) ? true : false;
        console.log("TextField label", label?.length);
        console.log("TextField label", label);


        return (
          <Form.Field
            required={!!required}
            error={showError}
            className={`invenio-text-input-field ${classnames ? classnames : ""} ${label?.length<1 ? "no-label" : ""}`}
            fluid={fluid}
            width={width}
          >
            {showLabel && (
              <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
            )}
            {description && description !== " " && (
              <div className="helptext label" id={`${fieldPath}.helptext`}>
                {i18next.t(description)}
              </div>
            )}
            <Form.Input
              error={showError ? meta.error : undefined}
              disabled={disabled}
              fluid={fluid}
              icon={undefined}
              id={fieldPath}
              name={fieldPath}
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

export { TextField };
