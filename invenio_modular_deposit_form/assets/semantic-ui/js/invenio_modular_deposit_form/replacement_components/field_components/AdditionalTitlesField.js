// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork: `ArrayField` is the local fork (`replacement_components/input_controls/
// ArrayField`) so we get `addButtonRef` / `onAfterAdd` / `onAfterRemove` for keyboard
// focus management on add and remove.
//
// The per-row Language picker is `AdditionalTitleLanguagePicker` (a small functional
// wrapper around `LanguagesField`) so it can read the Formik `ui.<fieldPath>` mirror
// and recover human-readable language labels after a localStorage restore. Stock
// reads only from the Redux record's server-rendered UI block, which is stale once
// `resetForm` applies an autosaved snapshot.

import React, { Component, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, Form, Icon } from "semantic-ui-react";

import { useFormikContext } from "formik";
import _get from "lodash/get";
import { GroupField } from "react-invenio-forms";
import { emptyAdditionalTitle } from "@js/invenio_rdm_records/src/deposit/fields/TitlesField/initialValues";
import { LanguagesField } from "./LanguagesField";
import { ArrayField } from "../../replacement_components/input_controls/ArrayField";
import {
  focusAddButton,
  focusFieldByPath,
} from "../../replacement_components/input_controls/arrayFieldFocus";
import { SelectField } from "../../replacement_components/input_controls/SelectField";
import { TextField } from "../../replacement_components/input_controls/TextField";
import { i18next } from "@translations/invenio_rdm_records/i18next";

/**
 * Per-row Language picker for an additional title. Prefers the Formik
 * `ui.<fieldPath>` mirror (written by RemoteSelectField on every selection and
 * rehydrated by localStorage recovery) over the Redux record's server-rendered
 * UI block, so restored language labels survive recovery instead of falling
 * back to bare codes. RemoteSelectField content-aware re-seed
 * (`componentDidUpdate` on `initialSuggestions`) handles the post-mount update.
 */
const AdditionalTitleLanguagePicker = ({ fieldPath, recordUiLang }) => {
  const { values } = useFormikContext();
  const formikUiLang = _get(values, `ui.${fieldPath}`, null);

  const initialOptions = useMemo(() => {
    if (Array.isArray(formikUiLang) && formikUiLang.length > 0) return formikUiLang;
    return recordUiLang ? [recordUiLang] : [];
  }, [JSON.stringify(formikUiLang), JSON.stringify(recordUiLang)]);

  return (
    <LanguagesField
      serializeSuggestions={(suggestions) =>
        suggestions.map((item) => ({
          text: item.title_l10n,
          value: item.id,
          key: item.id,
        }))
      }
      initialOptions={initialOptions}
      fieldPath={fieldPath}
      label={i18next.t("Language")}
      multiple={false}
      placeholder={i18next.t("Select language")}
      labelIcon={null}
      clearable
      selectOnBlur={false}
      width={5}
    />
  );
};

AdditionalTitleLanguagePicker.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  recordUiLang: PropTypes.shape({
    id: PropTypes.string,
    title_l10n: PropTypes.string,
  }),
};

AdditionalTitleLanguagePicker.defaultProps = {
  recordUiLang: undefined,
};

export class AdditionalTitlesField extends Component {
  addButtonRef = React.createRef();

  render() {
    const { fieldPath, options, recordUI } = this.props;
    return (
      <ArrayField
        addButtonRef={this.addButtonRef}
        addButtonLabel={i18next.t("Add titles")}
        defaultNewValue={emptyAdditionalTitle}
        fieldPath={fieldPath}
        className="additional-titles"
        onAfterAdd={({ index }) => focusFieldByPath(`${fieldPath}.${index}.title`)}
        onAfterRemove={({ isNowEmpty, removedIndex }) => {
          if (isNowEmpty) {
            focusAddButton(this.addButtonRef);
            return;
          }
          const target = removedIndex > 0 ? removedIndex - 1 : 0;
          focusFieldByPath(`${fieldPath}.${target}.title`);
        }}
      >
        {({ arrayHelpers, indexPath }) => {
          const fieldPathPrefix = `${fieldPath}.${indexPath}`;

          return (
            <GroupField fieldPath={fieldPath} optimized>
              <TextField
                fieldPath={`${fieldPathPrefix}.title`}
                label={i18next.t("Additional title")}
                required
                width={5}
              />
              <SelectField
                fieldPath={`${fieldPathPrefix}.type`}
                label={i18next.t("Type")}
                optimized
                options={options.type}
                required
                width={5}
              />
              <AdditionalTitleLanguagePicker
                fieldPath={`${fieldPathPrefix}.lang`}
                recordUiLang={recordUI?.additional_titles?.[indexPath]?.lang}
              />
              <Form.Field>
                <Button
                  aria-label={i18next.t("Remove field")}
                  className="close-btn"
                  icon
                  onClick={() => arrayHelpers.remove(indexPath)}
                >
                  <Icon name="close" />
                </Button>
              </Form.Field>
            </GroupField>
          );
        }}
      </ArrayField>
    );
  }
}

AdditionalTitlesField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  options: PropTypes.shape({
    type: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.string,
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    lang: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }),
  recordUI: PropTypes.object,
};

AdditionalTitlesField.defaultProps = {
  options: undefined,
  recordUI: undefined,
};
