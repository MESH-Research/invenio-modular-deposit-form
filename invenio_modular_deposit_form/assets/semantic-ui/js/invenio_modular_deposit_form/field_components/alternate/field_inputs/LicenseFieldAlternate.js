// Part of Knowledge Commons Works
// Copyright (C) 2026 MESH Research
//
// Alternate LicenseField: same Formik / DnD / modal add flow as
// invenio-rdm-records LicenseField, with LicenseFieldAlternateItem for
// creatibutor-style edit / remove / button-reorder controls.

import React, { useRef } from "react";
import PropTypes from "prop-types";
import _find from "lodash/find";
import { FieldArray, getIn } from "formik";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Button, Form, Icon, List } from "semantic-ui-react";
import { FieldLabel, FeedbackLabel } from "react-invenio-forms";
import { LicenseModal } from "@js/invenio_rdm_records/src/deposit/fields/License/LicenseModal";
import { i18next } from "@translations/invenio_rdm_records/i18next";

import { LicenseFieldAlternateItem } from "./LicenseFieldAlternateItem";

/**
 * Display model for a license list row (title, description, link, type).
 */
class VisibleLicense {
  /**
   * @param {array} uiRights
   * @param {object} right
   * @param {number} index
   */
  constructor(uiRights, right, index) {
    this.index = index;
    this.type = right.id ? "standard" : "custom";
    this.key = right.id || right.title;
    this.initial = this.type === "custom" ? right : null;

    const uiRight =
      _find(uiRights, right.id ? (o) => o.id === right.id : (o) => o.title === right.title) || {};

    this.description = uiRight.description_l10n || right.description || "";
    this.title = uiRight.title_l10n || right.title || "";
    this.link =
      (uiRight.props && uiRight.props.url) ||
      uiRight.link ||
      (right.props && right.props.url) ||
      right.link ||
      "";
  }
}

/**
 * Inner Formik FieldArray render for license entries.
 *
 * @param {object} props — Formik array helpers plus LicenseField props
 */
function LicenseFieldAlternateForm(props) {
  const {
    label,
    labelIcon,
    fieldPath,
    uiFieldPath,
    form: { values, errors, initialErrors, initialValues },
    move: formikArrayMove,
    push: formikArrayPush,
    remove: formikArrayRemove,
    replace: formikArrayReplace,
    required,
    searchConfig,
    serializeLicenses,
  } = props;

  // Maintain stable React keys for list items to avoid triggering
  // component remounts when one item's license content changes. Formik
  // has no notion of per-item identity, so we shadow its array operations.
  const itemKeysRef = useRef([]);

  const ensureItemKeys = (length) => {
    const itemKeys = itemKeysRef.current;
    while (itemKeys.length < length) {
      itemKeys.push(crypto.randomUUID());
    }
    if (itemKeys.length > length) {
      itemKeys.length = length;
    }
  };

  const moveLicense = (from, to) => {
    const itemKeys = itemKeysRef.current;
    const [key] = itemKeys.splice(from, 1);
    itemKeys.splice(to, 0, key);
    formikArrayMove(from, to);
  };

  const pushLicense = (value) => {
    itemKeysRef.current.push(crypto.randomUUID());
    formikArrayPush(value);
  };

  const removeLicense = (index) => {
    itemKeysRef.current.splice(index, 1);
    formikArrayRemove(index);
  };

  const licenseUp = (index) => {
    if (index > 0) {
      moveLicense(index, index - 1);
    }
  };

  const licenseDown = (index) => {
    const length = getIn(values, fieldPath, []).length;
    if (index < length - 1) {
      moveLicense(index, index + 1);
    }
  };

  const uiRights = getIn(values, uiFieldPath, []);
  const licenseList = getIn(values, fieldPath, []);
  const formikInitialValues = getIn(initialValues, fieldPath, []);

  const error = getIn(errors, fieldPath, null);
  const initialError = getIn(initialErrors, fieldPath, null);
  const licenseError = error || (licenseList === formikInitialValues && initialError);

  let className = "";
  if (licenseError) {
    className = typeof licenseError !== "string" ? licenseError.severity : "error";
  }

  ensureItemKeys(licenseList.length);

  return (
    <DndProvider backend={HTML5Backend}>
      <Form.Field required={required} className={className}>
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        {licenseList.length > 0 && (
          <List>
            {licenseList.map((value, index) => {
              const license = new VisibleLicense(uiRights, value, index);
              return (
                <LicenseFieldAlternateItem
                  key={itemKeysRef.current[index]}
                  license={license}
                  moveLicense={moveLicense}
                  replaceLicense={formikArrayReplace}
                  removeLicense={removeLicense}
                  searchConfig={searchConfig}
                  serializeLicenses={serializeLicenses}
                  licenseListLength={licenseList.length}
                  licenseUp={licenseUp}
                  licenseDown={licenseDown}
                />
              );
            })}
          </List>
        )}
        <div className="mt-10">
          <LicenseModal
            searchConfig={searchConfig}
            trigger={
              <Button type="button" key="standard" icon labelPosition="left" className={className}>
                <Icon name="add" />
                {i18next.t("Add standard")}
              </Button>
            }
            onLicenseChange={pushLicense}
            mode="standard"
            action="add"
            serializeLicenses={serializeLicenses}
          />
          <LicenseModal
            searchConfig={searchConfig}
            trigger={
              <Button type="button" key="custom" icon labelPosition="left" className={className}>
                <Icon name="add" />
                {i18next.t("Add custom")}
              </Button>
            }
            onLicenseChange={pushLicense}
            mode="custom"
            action="add"
          />
        </div>
        {licenseError && <FeedbackLabel fieldPath={fieldPath} />}
      </Form.Field>
    </DndProvider>
  );
}

LicenseFieldAlternateForm.propTypes = {
  label: PropTypes.node.isRequired,
  labelIcon: PropTypes.node,
  fieldPath: PropTypes.string.isRequired,
  uiFieldPath: PropTypes.string,
  form: PropTypes.object.isRequired,
  move: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  required: PropTypes.bool.isRequired,
  searchConfig: PropTypes.object.isRequired,
  serializeLicenses: PropTypes.func,
};

LicenseFieldAlternateForm.defaultProps = {
  labelIcon: undefined,
  uiFieldPath: undefined,
  serializeLicenses: undefined,
};

/**
 * Alternate license field with button reorder controls on each list item.
 *
 * @param {object} props
 * @param {string} props.fieldPath
 */
export function LicenseFieldAlternate(props) {
  const { fieldPath } = props;
  return (
    <FieldArray name={fieldPath}>
      {(formikProps) => <LicenseFieldAlternateForm {...formikProps} {...props} />}
    </FieldArray>
  );
}

LicenseFieldAlternate.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  searchConfig: PropTypes.object.isRequired,
  required: PropTypes.bool,
  serializeLicenses: PropTypes.func,
  uiFieldPath: PropTypes.string,
};

LicenseFieldAlternate.defaultProps = {
  label: i18next.t("Licenses"),
  uiFieldPath: "ui.rights",
  labelIcon: "drivers license",
  required: false,
  serializeLicenses: undefined,
};
