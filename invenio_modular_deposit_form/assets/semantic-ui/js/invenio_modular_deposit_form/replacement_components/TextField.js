import React from "react";
import { FastField, Field } from "formik";
import { Form } from "semantic-ui-react";
import { FieldLabel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_rdm_records/i18next";

const TextField = ({
  fieldPath,
  label,
  labelIcon,
  required,
  disabled,
  error,
  helpText,
  optimized,
  classnames,
  showLabel = true,
  fluid = true,
  width,
}) => {
  const FormikField = optimized ? FastField : Field;
  return (
    <FormikField id={fieldPath} name={fieldPath}>
      {({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => (
        <Form.Field
          required={!!required}
          error={(!!meta.error && !!meta.touched) || !!error}
          // (!!meta.touched && !!meta.errors) ||
          // (!meta.touched && meta.initialError)
          className={`invenio-text-input-field ${classnames}`}
          fluid={fluid}
          width={width}
        >
          {showLabel && (
            <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
          )}
          <Form.Input
            error={meta.error && meta.touched ? meta.error : undefined}
            disabled={disabled}
            fluid={fluid}
            id={fieldPath}
            name={fieldPath}
            aria-describedby={`${fieldPath}.helptext`}
            {...field}
          />
          {helpText && (
            <div className="helptext" id={`${fieldPath}.helptext`}>
              {i18next.t(helpText)}
            </div>
          )}
        </Form.Field>
      )}
    </FormikField>
  );
};

export { TextField };