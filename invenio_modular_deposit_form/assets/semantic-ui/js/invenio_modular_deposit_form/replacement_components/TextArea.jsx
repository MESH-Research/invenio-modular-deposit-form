import React from "react";
import { Field, FastField, getIn } from "formik";
import { Form } from "semantic-ui-react";
import { ErrorLabel, FieldLabel } from "react-invenio-forms";
import { getTouchedParent } from "../utils";

const TextArea = ({
  classnames,
  description,
  error,
  fieldPath,
  fluid = true,
  helpText = undefined,
  label,
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
  const {
    defaultFieldValue,
    editorConfig,
    icon,
    inputIcon,
    labelIcon,
    ...filteredProps
  } = extraProps;

  const FormikField = optimized ? FastField : Field;

  // console.log("TextArea", fieldPath, extraProps, filteredProps, helpText);

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
        const touchedAncestor = getTouchedParent(touched, fieldPath);
        // console.log("TextArea", fieldPath, meta, touchedAncestor);

        return (
          <Form.Field
            required={!!required}
            error={
              (!!meta.error && (!!meta.touched || touchedAncestor)) || !!error
            }
            // (!!meta.touched && !!meta.errors) ||
            // (!meta.touched && meta.initialError)
            className={`invenio-text-area-field ${classnames}`}
            width={width}
          >
            {showLabel && (
              <FieldLabel
                htmlFor={fieldPath}
                icon={labelIcon || icon}
                label={label}
              />
            )}
            {helpText && <label id={`${fieldPath}.helptext`} className={`helptext`}>{description}</label>}
            <Form.TextArea
              id={fieldPath}
              name={fieldPath}
              rows={rows}
              {...(helpText
                ? { "aria-describedby": `${fieldPath}.helptext` }
                : {})}
              {...field}
              {...(onBlur && {
                onBlur: (e) => {
                  onBlur(e);
                  field.onBlur(e);
                },
              })}
              {...filteredProps}
            />
            {helpText && (
              <div className="helptext" id={`${fieldPath}.helptext`}>
                {i18next.t(helpText)}
              </div>
            )}
            {((!!meta.error && (!!meta.touched || touchedAncestor)) ||
              !!error) && <ErrorLabel fieldPath={fieldPath} />}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { TextArea };
