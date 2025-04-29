import { useFormikContext } from "formik";
import { useStore } from "react-redux";

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
const useFormSubmissionTransformer = async () => {
  const { values, setFieldValue } = useFormikContext();
  const store = useStore();
  const hasFiles = Object.keys(store.getState().files.entries).length > 0;
  const filesEnabled = !!values.files.enabled;

  const filterEmptyIdentifiers = async () => {
    if (values.metadata.identifiers?.length) {
      let filteredIdentifiers = values.metadata.identifiers.reduce(
        (newList, item) => {
          if (item.identifier !== "" && item.scheme !== "") newList.push(item);
          return newList;
        },
        []
      );
      setFieldValue("metadata.identifiers", filteredIdentifiers);
    }
    return values.metadata.identifiers;
  };

  const fixEmptyPublisher = async () => {
    if (values.metadata.publisher === "" || !values.metadata.publisher) {
      setFieldValue("metadata.publisher", "Knowledge Commons");
    }
    return values.metadata.publisher;
  };

  const fixOrcidUrl = async () => {
    const orcid = values.metadata.identifiers.filter(
      (identifier) => identifier.scheme === "orcid"
    )[0];
    if (orcid && orcid.identifier.startsWith("https://orcid.org/")) {
      setFieldValue("metadata.identifiers", [
        ...values.metadata.identifiers.filter(
          (identifier) => identifier.scheme !== "orcid"
        ),
        { ...orcid, identifier: orcid.identifier.replace("https://orcid.org/", "") },
      ]);
    }
  };

  const enableFiles = async () => {
    if (hasFiles && !filesEnabled) {
      await setFieldValue("files.enabled", true);
    }
  };

  await filterEmptyIdentifiers();
  await fixEmptyPublisher();
  await enableFiles();
  await fixOrcidUrl();
};

export { useFormSubmissionTransformer };
