import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { useEffect, useCallback } from "react";

/**
 * A custom hook that transforms submitted form data before it is sent to the server.
 *
 * This is not intended to validate data, but to make behind-the-scenes adjustments
 * to the data where we want to allow flexibility in the entered data that will not
 * be validated by the form validation schema. This includes providing some defaults
 * that are not required by the form validation schema.
 *
 * This hook is used in the SubmitButton component but it does not return anything.
 * It accesses and updates the formik context values directly.
 *
 * @param {boolean} hasFiles - Whether the form has files.
 * @param {boolean} filesEnabled - Whether files are enabled in the form.
 */
const useFormSubmissionTransformer = () => {
  const { values, setFieldValue } = useFormikContext();
  const store = useStore();
  const hasFiles = Object.keys(store.getState().files.entries).length > 0;
  const filesEnabled = !!values.files.enabled;

  const filterEmptyIdentifiers = useCallback(async () => {
    if (values.metadata.identifiers?.length) {
      let filteredIdentifiers = values.metadata.identifiers.reduce(
        (newList, item) => {
          if (item.identifier !== "" && item.scheme !== "") newList.push(item);
          return newList;
        },
        []
      );
      if (JSON.stringify(filteredIdentifiers) !== JSON.stringify(values.metadata.identifiers)) {
        await setFieldValue("metadata.identifiers", filteredIdentifiers);
      }
    }
  }, [values.metadata.identifiers, setFieldValue]);

  const fixEmptyPublisher = useCallback(async () => {
    if (values.metadata.publisher === "" || !values.metadata.publisher) {
      await setFieldValue("metadata.publisher", "Knowledge Commons");
    }
  }, [values.metadata.publisher, setFieldValue]);

  const fixOrcidUrl = useCallback(async () => {
    const orcid = values.metadata.identifiers?.filter(
      (identifier) => identifier.scheme === "orcid"
    )[0];
    if (orcid && orcid.identifier.startsWith("https://orcid.org/")) {
      const newIdentifiers = [
        ...values.metadata.identifiers.filter(
          (identifier) => identifier.scheme !== "orcid"
        ),
        { ...orcid, identifier: orcid.identifier.replace("https://orcid.org/", "") },
      ];
      if (JSON.stringify(newIdentifiers) !== JSON.stringify(values.metadata.identifiers)) {
        await setFieldValue("metadata.identifiers", newIdentifiers);
      }
    }
  }, [values.metadata.identifiers, setFieldValue]);

  const enableFiles = useCallback(async () => {
    if (hasFiles && !filesEnabled) {
      await setFieldValue("files.enabled", true);
    }
  }, [hasFiles, filesEnabled, setFieldValue]);

  useEffect(() => {
    const runTransformations = async () => {
      // Run all transformations in sequence
      await filterEmptyIdentifiers();
      await fixOrcidUrl();
      await fixEmptyPublisher();
      await enableFiles();
    };

    runTransformations();
  }, [filterEmptyIdentifiers, fixOrcidUrl, fixEmptyPublisher, enableFiles]);
};

export { useFormSubmissionTransformer };
