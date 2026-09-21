// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms TextField.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms TextField:
//
// ### Layout/styling support
// - Pulls `classnames` out of props and merges it into `className` on the wrapping
//   `Form.Field` (plus `invenio-text-input-field` and `no-label` when the label is empty).
// - Uses plain `Input` inside `Form.Field` (not `Form.Input`) to avoid a nested `.field`
//   wrapper. Label is a separate `FieldLabel` sibling rather than a `label` prop on the
//   input, so `description` can sit between the label and the control.
// - Accepts `showLabel`, `width`, and `fluid` (stock hardcodes `fluid: true` on
//   `Form.Input`). Strips deposit-form-only extras (`customFieldsUI`,
//   `defaultFieldValue`, `priorityFieldValues`, `extraRequiredFields`) before spreading
//   the rest onto `Input`.
// - Label icon goes to `FieldLabel` via `labelIcon`; `icon` is forced off on `Input` so
//   it does not render as an inline input icon.
//
// ### Support for both help text and description (above and below the input)
// - Stock only renders a single `helpText` below the field (as a `<label class="helptext">`).
//   This fork treats **`description`** (above) and **`helpText`** (below) as separate
//   slots, matching the package convention. String copy is passed through `i18next.t`;
//   React elements are rendered as-is. Empty/" " placeholders are skipped.
//
// ### Client-side validation support
// - Stock sets `Form.Input` `error` from `error || meta.error || (!meta.touched &&
//   meta.initialError)`, so Yup/`form.errors` can show before the field is touched.
//   This fork gates display with
//   `(meta.error && meta.touched) || error prop || (value still initial &&
//   meta.initialError)`, and renders `ErrorLabel` as a sibling when that rule is true
//   (same idea as `TextArea` / the SelectField touched rule).
// - Always uses Formik `Field`. Stock (and this file’s unused `optimized` prop) would
//   switch to `FastField`, but FastField skips re-renders when non-Formik props change
//   (`description`, `helpText`, `disabled`, etc.) unless given a custom
//   `shouldComponentUpdate` — left as a FIXME.
//
// ### Support for onBlur
// - If `onBlur` is passed as a field prop, it is chained: caller `onBlur(e)` then
//   Formik `field.onBlur(e)`. Stock had no dedicated chain (custom handlers only via
//   spread into `Form.Input`).
//
// ### a11y support
// - Sets `id={fieldPath}` on `Input` so local `FieldLabel`'s `htmlFor={fieldPath}`
//   resolves (and so `arrayFieldFocus.focusFieldByPath` can find the control).
// - Distinct ids for description / helptext; wires `aria-describedby` and
//   `aria-labelledby` on the input when those nodes exist.
//
// ### Controlled value override
// - `value={uiProps.value ?? field.value ?? ""}` so a parent `value` prop can override
//   Formik (same privilege pattern as SelectField for display), with `""` when both
//   are unset to keep the input controlled.
//

import React from "react";
import { FastField, Field } from "formik";
import { ErrorLabel } from "react-invenio-forms";
import { Form, Input } from "semantic-ui-react";
import { FieldLabel } from "./FieldLabel";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
// import { getTouchedParent } from "../../../helpers/utils";

const TextField = ({
  classnames,
  description,
  disabled,
  error,
  fieldPath,
  fluid = true,
  helpText,
  icon, // field wrapper component puts both icon and labelIcon on
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
  const describedByText = [descriptionId, helptextId].filter(Boolean).join(" ") || undefined;
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
              <div className="description mb-5 mt-0" id={descriptionId}>
                {React.isValidElement(description) ? description : i18next.t(description)}
              </div>
            )}
            <Input
              error={showError}
              disabled={disabled}
              fluid={!!fluid}
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
              value={uiProps.value ?? field.value ?? ""}
              {...(describedByText ? { "aria-describedby": describedByText } : {})}
              {...(labelId ? { "aria-labelledby": labelId } : {})}
              type="text"
            />
            {helptextId && (
              <div className="helptext" id={helptextId}>
                {React.isValidElement(helpText) ? helpText : i18next.t(helpText)}
              </div>
            )}
            {showError && <ErrorLabel fieldPath={fieldPath} />}
          </Form.Field>
        );
      }}
    </FormikField>
  );
};

export { TextField };
