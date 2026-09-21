// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Based on react-invenio-forms TextAreaField.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.
//
// Differences from stock react-invenio-forms TextAreaField:
//
// ### Layout/styling support
// - Pulls `classnames` out of props and merges it into `className` on the wrapping
//   `Form.Field` (plus `invenio-text-area-field`).
// - Uses plain semantic-ui `TextArea` inside `Form.Field` (not `Form.TextArea`) to
//   avoid a nested `.field` wrapper. Label is a separate `FieldLabel` sibling rather
//   than a `label` prop on the textarea, so `description` can sit between the label
//   and the control.
// - Accepts `showLabel`, `width`, `rows`, and `labelIcon`. Strips deposit-form-only
//   extras (`defaultFieldValue`, `editorConfig`) before spreading the rest onto the
//   textarea (rich-text reimplementation left as a FIXME).
//
// ### Support for both help text and description (above and below the input)
// - Stock `TextAreaField` has no `description` / `helpText` slots. This fork treats
//   **`description`** (above) and **`helpText`** (below) as separate slots, matching
//   `TextField`. String copy is passed through `i18next.t`; React elements are
//   rendered as-is. Empty/" " placeholders are skipped.
//
// ### Client-side validation support
// - Stock always renders `ErrorLabel` under the control (no touched gate on the
//   wrapper). This fork uses the same show-error rule as `TextField`:
//   `(meta.error && meta.touched) || error prop || (value still initial &&
//   meta.initialError)`, sets `Form.Field` `error` from that, and only renders
//   `ErrorLabel` when true.
// - Honors `optimized` (`FastField` vs `Field`); unlike replacement `TextField`,
//   FastField is wired here. Same caveat as TextField’s FIXME: FastField can skip
//   re-renders when non-Formik props change unless given a custom
//   `shouldComponentUpdate`.
//
// ### Support for onBlur
// - If `onBlur` is passed as a field prop, it is chained: caller `onBlur(e)` then
//   Formik `field.onBlur(e)`.
//
// ### a11y support
// - Sets `id={fieldPath}` on the textarea so `FieldLabel`'s `htmlFor={fieldPath}`
//   resolves.
// - Distinct ids for description / helptext; wires `aria-describedby` and
//   `aria-labelledby` on the textarea when those nodes exist.
// - Uses stock `FieldLabel` from `react-invenio-forms` (not the local fork); `id` is
//   still passed through for `aria-labelledby`.
//

import React from "react";
import { Field, FastField, getIn } from "formik";
import {
  ErrorLabel,
  FieldLabel,
  showHideOverridableWithDynamicId,
} from "react-invenio-forms";
import { Form, TextArea as SemanticTextArea } from "semantic-ui-react";
import { getTouchedParent } from "../../../helpers/utils";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

const TextAreaComponent = ({
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
        // form: { touched, errors, values }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => {
        const descriptionId = description && description !== " " ? `${fieldPath}.description` : "";
        const helptextId = helpText && helpText !== " " ? `${fieldPath}.helptext` : "";
        const describedByText = [descriptionId, helptextId].filter(Boolean).join(" ") || undefined;
        const labelId = showLabel && label ? `${fieldPath}.label` : undefined;
        const showError =
          (!!meta.error && !!meta.touched) ||
          !!error ||
          (field.value === meta.initialValue && !!meta.initialError);

        return (
          <Form.Field
            required={!!required}
            error={showError}
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
                {React.isValidElement(description) ? description : i18next.t(description)}
              </div>
            )}
            <SemanticTextArea
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

const TextArea = showHideOverridableWithDynamicId(TextAreaComponent);

export { TextArea };
