import { useFormikContext } from "formik";
import { useEffect } from "react";

const extras = require("@js/invenio_modular_deposit_form_transformations");
const extraTransformations = Array.isArray(extras) ? extras : (extras?.transformations ?? []);

/**
 * A custom hook that transforms submitted form data before it is sent to the server.
 *
 * Built-in transformations run first, then any extra transformations registered
 * via the ``invenio_modular_deposit_form.transformations`` entry point.
 *
 * Each extra transformation is a pure function receiving
 * formik `values`, and each should return a new modified
 * copy of those values. This allows them to be chained in a
 * determinate sequence and avoid race conditions in updating.
 */
const useFormSubmissionTransformer = () => {
  const { isSubmitting, setValues, values } = useFormikContext();

  useEffect(() => {
    if (isSubmitting) {
      const modifiedVals = extraTransformations.reduce((vals, func) => func(vals), values);
      setValues(modifiedVals);
    }
  }, [isSubmitting]);
};

export { useFormSubmissionTransformer };
