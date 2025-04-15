import { get, isEqual } from "lodash";
import { flattenKeysDotJoined, getTouchedParent } from "../utils";

/**
 * Helper to harmonize server-side, client-side validation, and form page error states
 *
 * NOTE: fields marked if error + touched or if initial error + untouched
 *       or initial error + touched + value unchanged
 *       (initial errors should become errors when touched and not fixed)
 *
 * all fields must be set touched to trigger validation before submit
 * but then untouched after submission
 *
 * @class FormErrorManager -
 * @param {Object} formPages - the form pages
 * @param {Object} formPageFields - the form page fields
 * @param {Object} errors - the errors
 * @param {Object} touched - the touched fields
 * @param {Object} initialErrors - the initial errors
 * @param {Object} initialValues - the initial values
 * @param {Object} values - the values
 */
class FormErrorManager {
  /**
   * Constructor for FormErrorManager
   * @param {Object} formPages - the form pages
   * @param {Object} formPageFields - the form page fields
   * @param {Object} errors - the errors
   * @param {Object} touched - the touched fields
   * @param {Object} initialErrors - the initial errors
   * @param {Object} initialValues - the initial values
   * @param {Object} values - the values
   */
  constructor(
    formPages,
    formPageFields,
    initialErrors,
    errors,
    touched,
    initialValues,
    values
  ) {
    this.formPages = formPages;
    this.formPageFields = formPageFields;
    this.errors = errors;
    this.touched = touched;
    this.initialErrors = initialErrors;
    this.initialValues = initialValues;
    this.values = values;

    console.log("constructor: this.formPages", this.formPages);
    console.log("constructor: this.formPageFields", this.formPageFields);
    console.log("constructor: this.errors", this.errors);
    console.log("constructor: this.touched", this.touched);
    console.log("constructor: this.initialErrors", this.initialErrors);
    console.log("constructor: this.initialValues", this.initialValues);
    console.log("constructor: this.values", this.values);
  }

  /**
   * Convert error state object to lists of fields in various states
   * @returns {Object} - the field state object
   */
  errorsToFieldSets = () => {
    const errorFields = flattenKeysDotJoined(this.errors);
    const touchedFields = flattenKeysDotJoined(this.touched);
    const touchedErrorFields = errorFields?.filter(
      (item) => touchedFields.includes(item) || getTouchedParent(this.touched, item)
    );
    const initialErrorFields = flattenKeysDotJoined(this.initialErrors);
    const initialErrorFieldsUntouched = initialErrorFields?.filter(
      (item) => !touchedFields.includes(item)
    );
    const initialErrorFieldsUnchanged = initialErrorFields?.filter((item) =>
      isEqual(get(this.values, item), get(this.initialValues, item))
    );
    const initialErrorFieldsUnflagged = initialErrorFields?.filter(
      (item) =>
        ![...initialErrorFieldsUntouched, ...initialErrorFieldsUnchanged].includes(item)
    );
    return {
      errorFields,
      touchedErrorFields,
      initialErrorFields,
      initialErrorFieldsUntouched,
      initialErrorFieldsUnchanged,
      initialErrorFieldsUnflagged,
    };
  };

  /**
   * update form error state with backend errors
   *
   * Initial error fields that are untouched or their values are unchanged
   * should be set as errors in the form state.
   *
   * Initial error fields that *have* since been touched or their values changed
   * should NOT be removed from the form error state. The error state may have
   * newer validation errors that should take precedence. (Client-side validation
   * errors are always freshly calculated before this method is called.)
   *
   * @param {Function} setFieldError - the setFieldError function
   */
  addBackendErrors = (
    setFieldError,
    initialErrorFieldsUntouched,
    initialErrorFieldsUnchanged,
    initialErrorFieldsUnflagged
  ) => {
    if (
      initialErrorFieldsUntouched?.length > 0 ||
      initialErrorFieldsUnchanged?.length > 0 ||
      initialErrorFieldsUnflagged?.length > 0
    ) {
      const backendErrorFields = [
        ...new Set([...initialErrorFieldsUntouched, ...initialErrorFieldsUnchanged]),
      ];
      backendErrorFields.forEach((field) => {
        const fieldError = get(this.initialErrors, field);
        setFieldError(field, fieldError);
      });
    //   initialErrorFieldsUnflagged.forEach((field) => {
    //     setFieldError(field, undefined);
    //   });
    }
  };

  /**
   * Get the form pages with errors and flagged errors
   * @param {Object} fieldState - the field state object
   * @returns {Object} - the error pages and flagged error pages
   */
  getErrorPages = (
    formPages,
    formPageFields,
    errorFields,
    touchedFields,
    initialErrorFields,
    initialUntouchedFields,
    initialUnchangedFields
  ) => {
    let errorPages = {};
    let flaggedErrorPages = {};

    console.log("formPages", formPages);
    console.log("formPageFields", formPageFields);
    console.log("errorFields", errorFields);
    console.log("touchedFields", touchedFields);
    console.log("initialErrorFields", initialErrorFields);
    console.log("initialUntouchedFields", initialUntouchedFields);
    console.log("initialUnchangedFields", initialUnchangedFields);

    for (const p of formPages) {
      const pageErrorFields = formPageFields[p.section]?.filter((item) =>
        errorFields.includes(item)
      );
      const pageTouchedErrorFields = pageErrorFields?.filter(
        (item) => touchedFields.includes(item) || getTouchedParent(this.touched, item)
      );
      const pageInitialErrorFields = formPageFields[p.section]?.filter((item) =>
        initialErrorFields.includes(item)
      );
      const pageInitialUntouchedFields = pageInitialErrorFields?.filter((item) =>
        initialUntouchedFields.includes(item)
      );
      const pageInitialUnchangedFields = pageInitialErrorFields?.filter((item) =>
        initialUnchangedFields.includes(item)
      );
      if (
        pageErrorFields?.length > 0 ||
        pageInitialUntouchedFields?.length > 0 ||
        pageInitialUnchangedFields?.length > 0
      ) {
        errorPages[p.section] = [
          ...new Set([
            ...pageErrorFields,
            ...pageInitialUnchangedFields,
            ...pageInitialUntouchedFields,
          ]),
        ];
      }
      if (
        pageTouchedErrorFields?.length > 0 ||
        pageInitialUntouchedFields?.length > 0 ||
        pageInitialUnchangedFields?.length > 0
      ) {
        flaggedErrorPages[p.section] = [
          ...new Set([
            ...pageTouchedErrorFields,
            ...pageInitialUntouchedFields,
            ...pageInitialUnchangedFields,
          ]),
        ];
      }
    }
    return [errorPages, flaggedErrorPages];
  };

  /**
   * Update the form error state with backend errors and flagged pages with errors
   *
   * The form error state is updated with backend errors, even if the field does not
   * have a client-side validation error, on the condition that the error field has
   * been touched and its value has not changed since the initial submission.
   *
   * It is assumed that client-side validation errors are always freshly calculated
   * before this method is called. So if a field has a client-side validation error,
   * it will take precedence over the state of any backend errors.
   *
   * @param {Function} setFieldError - the setFieldError function, which sets the form
   *                                  field error state for one field.
   * @param {Function} setPagesWithErrors - the setPagesWithErrors function, which
   *                                        updates the higher-level state tracking
   *                                        which form pages have errors.
   * @param {Function} setPagesWithFlaggedErrors - the setPagesWithFlaggedErrors
   *                                              function, which updates the
   *                                              higher-level state tracking
   *                                              which form pages have *                                              errors that should be flagged.
   */
  updateFormErrorState = (
    setFieldError,
    setPagesWithErrors,
    setPagesWithFlaggedErrors
  ) => {
    const errorFieldSets = this.errorsToFieldSets();

    this.addBackendErrors(
      setFieldError,
      errorFieldSets.initialErrorFieldsUntouched,
      errorFieldSets.initialErrorFieldsUnchanged,
      errorFieldSets.initialErrorFieldsUnflagged
    );

    const [errorPages, flaggedErrorPages] = this.getErrorPages(
      this.formPages,
      this.formPageFields,
      ...Object.values(errorFieldSets)
    );

    setPagesWithErrors(errorPages);
    setPagesWithFlaggedErrors(flaggedErrorPages);
  };
}

export { FormErrorManager };
