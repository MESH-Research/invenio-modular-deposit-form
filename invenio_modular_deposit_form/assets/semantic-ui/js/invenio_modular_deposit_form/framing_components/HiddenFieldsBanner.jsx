import React, { useEffect, useMemo } from "react";
import { useFormikContext } from "formik";
import { get } from "lodash";
import { useStore } from "react-redux";
import { Trans } from "react-i18next";
import { Message } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import {
  getHiddenErrors,
  getHiddenValuedFields,
  suggestResourceTypesForPaths,
} from "../helpers/hiddenSectionErrors";
import { getReadableFieldLabel } from "../helpers/readableFieldLabels";
import { useFormUIState } from "../FormUIStateManager.jsx";
import { getTouchedParent } from "../helpers/utils";
import PropTypes from "prop-types";

/**
 * Readable label for a resource type id from deposit config vocabularies.
 * Source: `deposit.config.vocabularies.metadata.resource_type` (same as the
 * resource-type selector). Prefers `subtype_name`, then `type_name`.
 *
 * @param {Object} vocabularies - `deposit.config.vocabularies`
 * @param {string} typeId
 * @returns {string}
 */
function getResourceTypeLabel(vocabularies, typeId) {
  const options = vocabularies?.metadata?.resource_type ?? [];
  const option = Array.isArray(options) ? options.find((o) => (o.id ?? o.value) === typeId) : null;
  if (!option) return typeId;
  const subtype =
    option.subtype_name != null && String(option.subtype_name).trim() !== ""
      ? String(option.subtype_name).trim()
      : "";
  if (subtype) return subtype;
  if (option.type_name != null && String(option.type_name).trim() !== "") {
    return String(option.type_name).trim();
  }
  return option.text ?? option.label ?? typeId;
}

/**
 * Notice when the form has errors or non-empty values in fields that are only
 * visible for another resource type **on the current form page**. Mount both
 * variants via {@link HiddenFieldsNotices} (typically a StickyFooter subsection).
 *
 * - `variant="errors"`: flagged errors not in `currentFormPageFields`, configured on this page
 * - `variant="values"`: non-empty values on fields not in `currentFormPageFields`,
 *   configured on this page, excluding paths already listed in the errors banner
 *
 * For each hidden field, lists resource types that include it on this page as
 * link-styled buttons. The values variant also marks page-configured hidden
 * paths as Formik-touched so they validate.
 */
const HiddenFieldsBanner = ({ variant = "errors", hidden = false, onDismiss }) => {
  const store = useStore();
  const { setFieldTouched, setFieldValue, touched, validateForm, values } = useFormikContext();
  const { formUIState } = useFormUIState();
  const vocabularies = store?.getState?.()?.deposit?.config?.vocabularies;
  const formSectionFields = store?.getState?.()?.deposit?.config?.formSectionFields ?? [];
  const currentResourceType = formUIState?.currentResourceType ?? "";
  const currentFormPage = formUIState?.currentFormPage ?? "";
  const currentFormPageFields = formUIState?.currentFormPageFields ?? {};
  const sectionErrorsFlagged = formUIState?.sectionErrorsFlagged ?? [];

  const suggestOptions = useMemo(
    () => ({
      getLabel: (typeId) => getResourceTypeLabel(vocabularies, typeId),
    }),
    [vocabularies]
  );

  const { hiddenPaths, hiddenConfiguredPaths } = useMemo(() => {
    if (variant === "values") {
      return getHiddenValuedFields(
        values,
        formSectionFields,
        currentResourceType,
        currentFormPageFields,
        currentFormPage,
        suggestOptions,
        sectionErrorsFlagged
      );
    }
    const errorsResult = getHiddenErrors(
      sectionErrorsFlagged,
      formSectionFields,
      currentResourceType,
      currentFormPageFields,
      currentFormPage,
      suggestOptions
    );
    return { ...errorsResult, hiddenConfiguredPaths: [] };
  }, [
    variant,
    values,
    formSectionFields,
    currentResourceType,
    currentFormPageFields,
    currentFormPage,
    sectionErrorsFlagged,
    suggestOptions,
  ]);

  // Values variant owns touching: same helper pass already listed page-hidden paths.
  useEffect(() => {
    if (variant !== "values") return;
    if (
      !currentFormPage ||
      !currentFormPageFields ||
      !Object.prototype.hasOwnProperty.call(currentFormPageFields, currentFormPage)
    ) {
      return;
    }
    if (!hiddenConfiguredPaths?.length) return;

    let didTouch = false;
    for (const path of hiddenConfiguredPaths) {
      if (get(touched, path) === true || getTouchedParent(touched, path)) {
        continue;
      }
      setFieldTouched(path, true, false);
      didTouch = true;
    }
    if (didTouch) {
      void validateForm();
    }
    // Omit `touched`: re-run on page/type/layout/list changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [
    variant,
    currentFormPage,
    currentResourceType,
    hiddenConfiguredPaths,
    setFieldTouched,
    validateForm,
  ]);

  const fieldItems = useMemo(() => {
    const seenLabels = new Set();
    const items = [];
    for (const path of hiddenPaths) {
      const label = getReadableFieldLabel(path);
      if (seenLabels.has(label)) continue;
      seenLabels.add(label);
      items.push({
        path,
        label,
        typeIds: suggestResourceTypesForPaths(
          [path],
          formSectionFields,
          currentResourceType,
          currentFormPage,
          suggestOptions
        ),
      });
    }
    return items;
  }, [hiddenPaths, formSectionFields, currentResourceType, currentFormPage, suggestOptions]);

  if (fieldItems.length === 0) {
    return null;
  }

  const isValues = variant === "values";
  const count = fieldItems.length;
  const intro = isValues
    ? i18next.t(
        "These fields are not shown when this resource type is selected. To review or edit them, switch to one of the resource types listed below by clicking on it. (Don't forget to switch the resource type back once you're done.)"
      )
    : i18next.t(
        "These fields are not shown when this resource type is selected. To fix them, switch to one of the resource types listed below by clicking on it. (Don't forget to switch the resource type back once you're done.)"
      );

  return (
    <Message
      warning={!isValues}
      info={isValues}
      className={[
        "hidden-fields-banner",
        isValues ? "hidden-fields-values" : "hidden-fields-errors",
      ].join(" ")}
      size="small"
      hidden={hidden}
      onDismiss={onDismiss}
    >
      <Message.Content>
        <Message.Header>
          {isValues ? (
            <Trans
              i18n={i18next}
              count={count}
              defaults="{{count}} value in hidden fields"
              values={{ count }}
              tOptions={{
                defaultValue_plural: "{{count}} values in hidden fields",
              }}
            />
          ) : (
            <Trans
              i18n={i18next}
              count={count}
              defaults="{{count}} error in hidden fields"
              values={{ count }}
              tOptions={{
                defaultValue_plural: "{{count}} errors in hidden fields",
              }}
            />
          )}
        </Message.Header>
        <p>{intro}</p>
        <Message.List>
          {fieldItems.map(({ path, label, typeIds }) => (
            <Message.Item key={path}>
              <b>{label}</b> is visible on:
              {typeIds.length > 0 ? (
                <Message.List>
                  {typeIds.map((typeId, idx) => (
                    <Message.Item
                      key={typeId}
                      as="button"
                      type="button"
                      className={`ui button link-button ${variant === "errors" ? "error" : "info"}`}
                      onClick={() => setFieldValue("metadata.resource_type", typeId)}
                    >
                      {getResourceTypeLabel(vocabularies, typeId)}
                      {idx !== typeIds.length - 1 && ", "}
                    </Message.Item>
                  ))}
                </Message.List>
              ) : null}
            </Message.Item>
          ))}
        </Message.List>
      </Message.Content>
    </Message>
  );
};

HiddenFieldsBanner.propTypes = {
  variant: PropTypes.oneOf(["errors", "values"]),
  hidden: PropTypes.bool,
  onDismiss: PropTypes.func,
};

export { HiddenFieldsBanner };
