import React, { useMemo } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { Message } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { getHiddenErrorsInSection } from "../helpers/hiddenSectionErrors";
import PropTypes from "prop-types";

function getResourceTypeLabel(vocabularies, typeId) {
  const options = vocabularies?.metadata?.resource_type ?? [];
  const option = Array.isArray(options)
    ? options.find((o) => (o.value ?? o.id) === typeId)
    : null;
  return option?.text ?? option?.label ?? typeId;
}

/**
 * Displays a warning when this section has errors in fields that are only visible
 * for another resource type. Computes hidden paths and suggested types; returns null if none.
 */
const HiddenFieldsBanner = ({
  pageId,
  sectionId,
  sectionErrorPaths,
  formSectionFields,
  currentResourceType,
}) => {
  const store = useStore();
  const { setFieldValue } = useFormikContext();
  const vocabularies = store?.getState?.()?.deposit?.config?.vocabularies;

  const { hiddenPaths, minResourceTypes } = useMemo(
    () =>
      getHiddenErrorsInSection(
        pageId,
        sectionId,
        sectionErrorPaths,
        formSectionFields,
        currentResourceType
      ),
    [
      pageId,
      sectionId,
      sectionErrorPaths,
      formSectionFields,
      currentResourceType,
    ]
  );

  if (hiddenPaths.length === 0) {
    return null;
  }

  return (
    <Message warning className="hidden-fields-errors" size="small">
      <Message.Content>
        <Message.Header>
          {i18next.t("{{ count }} error(s) in hidden fields", {
            count: hiddenPaths.length,
          })}
        </Message.Header>
        {minResourceTypes.length > 0 ? (
          <>
            <p>
              {i18next.t(
                "These fields are not shown for the current resource type. Switch to the following resource type(s) to fix them: {{ types }}.",
                {
                  types: minResourceTypes
                    .map((id) => getResourceTypeLabel(vocabularies, id))
                    .join(", "),
                }
              )}
            </p>
            <Message.List>
              {minResourceTypes.map((typeId) => (
                <Message.Item
                  key={typeId}
                  as="button"
                  type="button"
                  className="link"
                  onClick={() => setFieldValue("metadata.resource_type", typeId)}
                >
                  {i18next.t("Switch to {{ type }}", {
                    type: getResourceTypeLabel(vocabularies, typeId),
                  })}
                </Message.Item>
              ))}
            </Message.List>
          </>
        ) : (
          <p>
            {i18next.t(
              "These fields are not shown for the current resource type."
            )}
          </p>
        )}
      </Message.Content>
    </Message>
  );
};

HiddenFieldsBanner.propTypes = {
  pageId: PropTypes.string.isRequired,
  sectionId: PropTypes.string.isRequired,
  sectionErrorPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
  formSectionFields: PropTypes.array.isRequired,
  currentResourceType: PropTypes.string.isRequired,
};

export { HiddenFieldsBanner };
