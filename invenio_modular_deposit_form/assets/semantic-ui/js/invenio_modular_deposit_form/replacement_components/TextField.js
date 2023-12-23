import React from "react";
import { FastField, Field } from "formik";
import { Form } from "semantic-ui-react";
import { FieldLabel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { getTouchedParent } from "../utils";

const TextField = ({
  fieldPath,
  label,
  labelIcon: label_icon,
  inputIcon: input_icon = true,
  required,
  disabled,
  error,
  helpText,
  optimized,
  classnames,
  showLabel = true,
  fluid = "true",
  onBlur,
  width,
  ...extraProps
}) => {
  const FormikField = optimized ? FastField : Field;
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
              (!!meta.error && (!!meta.touched || touchedAncestor)) || !!error
            }
            // (!!meta.touched && !!meta.errors) ||
            // (!meta.touched && meta.initialError)
            className={`invenio-text-input-field ${classnames}`}
            fluid={fluid}
            width={width}
          >
            {showLabel && (
              <FieldLabel htmlFor={fieldPath} icon={label_icon} label={label} />
            )}
            <Form.Input
              error={
                meta.error && (meta.touched || touchedAncestor)
                  ? meta.error
                  : undefined
              }
              disabled={disabled}
              fluid={fluid}
              icon={input_icon ? label_icon : undefined}
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
              {...filteredProps}
            />
            {helpText && (
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
