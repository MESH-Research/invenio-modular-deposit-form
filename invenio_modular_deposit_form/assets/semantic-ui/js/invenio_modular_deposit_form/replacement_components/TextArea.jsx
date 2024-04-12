import React from "react";
import { Field, FastField, getIn } from "formik";
import { Form } from "semantic-ui-react";
import { ErrorLabel, FieldLabel } from "react-invenio-forms";
import { getTouchedParent } from "../utils";

const TextArea = ({
  classnames,
  error,
  fieldPath,
  fluid = true,
  helpText = "",
  label,
  onBlur,
  optimized = false,
  required = false,
  rows = 3,
  showLabel = true,
  width,
  ...extraProps
}) => {
  // FIXME: This is a hack to remove the extra props that are not used by the
  // semantic-ui Form.Input component. We should probably remove these earlier
  // FIXME: Implement the extraRequiredFields and defaultFieldValues props
  const {
    customFieldsUI,
    currentResourceType,
    currentUserprofile,
    descriptionMods,
    defaultFieldValue,
    extraRequiredFields,
    fieldComponents,
    helpTextMods,
    icon,
    iconMods,
    inputIcon,
    labelIcon,
    labelMods,
    noFiles,
    placeholderMods,
    priorityFieldValues,
    ...filteredProps
  } = extraProps;

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
            {((!!meta.error && (!!meta.touched || touchedAncestor)) ||
              !!error) && <ErrorLabel fieldPath={fieldPath} />}
            {helpText && <label className="helptext">{description}</label>}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { TextArea };
