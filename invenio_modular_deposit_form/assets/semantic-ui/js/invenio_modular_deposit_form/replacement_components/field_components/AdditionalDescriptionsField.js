// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021      Graz University of Technology.
// Copyright (C) 2022      TU Wien.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork: local `ArrayField` fork with onAfterAdd/onAfterRemove; TinyMCE focus
// helpers live in this file (RichInputField uses `id={fieldPath}` on Form.Field).

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Form, Grid, Icon } from "semantic-ui-react";
import { RichInputField } from "../../replacement_components/input_controls/RichInputField";
import { ArrayField } from "../../replacement_components/input_controls/ArrayField";
import { emptyAdditionalDescription } from "@js/invenio_rdm_records/src/deposit/fields/DescriptionsField/components/initialValues";
import { sortOptions } from "@js/invenio_rdm_records/src/deposit/utils";
import { i18next } from "@translations/invenio_rdm_records/i18next";

import { LanguagesField } from "./LanguagesField";
import { SelectField } from "../../replacement_components/input_controls/SelectField";

const FOCUS_ATTEMPTS_MAX = 48;

/** TinyMCE (RichEditor) mounts async; focus the iframe and matching editor once it exists. */
function scheduleFocusRichDescriptionField(descriptionFieldPath) {
  const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  void (async () => {
    await frame();
    await frame();
    for (let i = 0; i < FOCUS_ATTEMPTS_MAX; i++) {
      const root = document.getElementById(descriptionFieldPath);
      const iframe = root?.querySelector(".tox-edit-area__iframe") ?? root?.querySelector("iframe");
      const editorId =
        root.querySelector(".invenio-rich-input-field textarea")?.id ||
        iframe?.id.replace(/_ifr/, "");
      const editor = window.tinymce?.get(editorId);
      if (editor?.initialized) {
        editor.execCommand("mceFocus", false, false);
        return;
      } else if (editor) {
        editor.on("init", () => editor.execCommand("mceFocus", false, false));
        return;
      }
      await frame();
    }
  })();
}

function focusAddDescriptionButton(buttonRef) {
  requestAnimationFrame(() => {
    const el = buttonRef?.current;
    if (el && typeof el.focus === "function") {
      el.focus();
    }
  });
}

export class AdditionalDescriptionsField extends Component {
  addDescriptionAddButtonRef = React.createRef();

  render() {
    const { fieldPath, options, recordUI, editorConfig } = this.props;
    return (
      <ArrayField
        addButtonRef={this.addDescriptionAddButtonRef}
        addButtonLabel={i18next.t("Add description")}
        className="additional-descriptions"
        defaultNewValue={emptyAdditionalDescription}
        fieldPath={fieldPath}
        onAfterAdd={({ index }) =>
          scheduleFocusRichDescriptionField(`${fieldPath}.${index}.description`)
        }
        onAfterRemove={({ isNowEmpty, removedIndex }) => {
          if (isNowEmpty) {
            focusAddDescriptionButton(this.addDescriptionAddButtonRef);
            return;
          }
          const targetRow = removedIndex > 0 ? removedIndex - 1 : 0;
          scheduleFocusRichDescriptionField(`${fieldPath}.${targetRow}.description`);
        }}
      >
        {({ arrayHelpers, indexPath }) => {
          const fieldPathPrefix = `${fieldPath}.${indexPath}`;

          return (
            <Grid className="description">
              <Grid.Row>
                <Grid.Column mobile={16} tablet={10} computer={12}>
                  <RichInputField
                    fieldPath={`${fieldPathPrefix}.description`}
                    label={i18next.t("Additional Description")}
                    editorConfig={editorConfig}
                    optimized
                    required
                  />
                </Grid.Column>
                <Grid.Column mobile={16} tablet={6} computer={4}>
                  <Form.Field>
                    <Button
                      aria-label={i18next.t("Remove field")}
                      className="close-btn"
                      floated="right"
                      icon
                      onClick={() => arrayHelpers.remove(indexPath)}
                    >
                      <Icon name="close" />
                    </Button>
                  </Form.Field>
                  <SelectField
                    fieldPath={`${fieldPathPrefix}.type`}
                    label={i18next.t("Type")}
                    options={sortOptions(options.type)}
                    required
                    optimized
                  />
                  <LanguagesField
                    serializeSuggestions={(suggestions) =>
                      suggestions.map((item) => ({
                        text: item.title_l10n,
                        value: item.id,
                        key: item.id,
                      }))
                    }
                    initialOptions={
                      recordUI?.additional_descriptions &&
                      recordUI.additional_descriptions[indexPath]?.lang
                        ? [recordUI.additional_descriptions[indexPath].lang]
                        : []
                    }
                    fieldPath={`${fieldPathPrefix}.lang`}
                    label={i18next.t("Language")}
                    multiple={false}
                    placeholder={i18next.t("Select language")}
                    labelIcon=""
                    clearable
                    selectOnBlur={false}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          );
        }}
      </ArrayField>
    );
  }
}

AdditionalDescriptionsField.propTypes = {
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
  }).isRequired,
  recordUI: PropTypes.object,
  editorConfig: PropTypes.object,
};

AdditionalDescriptionsField.defaultProps = {
  recordUI: {},
  editorConfig: undefined,
};
