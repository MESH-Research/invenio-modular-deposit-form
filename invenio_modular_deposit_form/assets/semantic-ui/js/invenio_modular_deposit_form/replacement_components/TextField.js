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
        const touchedAncestor = getTouchedParent(touched, fieldPath);

        return (
          <Form.Field
            required={!!required}
            error={
              (!!meta.error && (!!meta.touched || touchedAncestor)) ||
              !!error //||
              // (!meta.touched && meta.initialError)
            }
            // (!!meta.touched && !!meta.errors) ||
            // (!meta.touched && meta.initialError)
            className={`invenio-text-input-field ${classnames ? classnames : ""}`}
            fluid={fluid}
            width={width}
          >
            {showLabel && (
              <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
            )}
            {description && description !== " " && (
              <div className="helptext" id={`${fieldPath}.helptext`}>
                {i18next.t(description)}
              </div>
            )}
            <Form.Input
              error={
                (meta.error && (meta.touched || touchedAncestor)) ||
                (!meta.touched && meta.initialError)
                  ? meta.error
                  : undefined
              }
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
              <div className="helptext" id={`${fieldPath}.helptext`}>
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
