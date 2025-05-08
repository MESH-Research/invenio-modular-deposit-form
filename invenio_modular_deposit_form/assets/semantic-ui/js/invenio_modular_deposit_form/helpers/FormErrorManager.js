import { get, isEqual } from "lodash";
import { flattenKeysDotJoined, getTouchedParent, getErrorParent } from "../utils";

/**
 * Helper to harmonize server-side, client-side validation, and form page error states
 *
 * NOTE: fields marked if error + touched or if initial error + value unchanged
 *       (initial errors should become errors when touched and not fixed)
 *
 * Fields must be touched . This
 * class will set the touched state appropriately for backend errors that aren't
 * in the current formik context `errors` object. But on form submission all
 * fields are automatically untouched again, and all backend errors enter the
 * formik error state. As a result, error flagging on the form (which is based on
 * the touched state) would be briefly lost after submission, and then regained
 * when the client-side validation runs again for the first time after submission.
 * To avoid this, we need to set all errors in the formik error state to `touched`
 * after the form is submitted. This is handled by the `<FormFeedback>` component.
 *
 * All fields must also be set to touched to trigger client-side validation
 * before submission. This is handled by the ??? component.
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
   * FormErrorManager constructor
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
  }

  /**
   * Convert error state object to lists of fields in various states
   *
   * Note: Backend error fields that are not changed should be flagged
   * whether or not they are touched. Frontend error fields are all
   * already touched.
   *
   * The returned object has the following properties:
   * - errorFields: all fields that have errors
   * - touchedErrorFields: all fields that have errors and are touched
   * - initialErrorFields: all fields that have initial errors
   * - initialErrorFieldsUntouched: all fields that have initial errors and are not touched
   * - initialErrorFieldsUnchanged: all fields that have initial errors and are unchanged
   * - initialErrorFieldsUnflagged: all fields that have initial errors and are not unchanged
   * - initialErrorFieldsToFlag: all fields that have initial errors and are not unchanged or already in client-side error state
   *
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
    // const untouchedSet = new Set(initialErrorFieldsUntouched);
    const unchangedSet = new Set(initialErrorFieldsUnchanged);
    const initialErrorFieldsUnflagged = initialErrorFields?.filter(
      (item) => !unchangedSet.has(item)
    );

    // have to account for possibility that frontend and backend error paths
    // are at different levels of specificity
    const initialErrorFieldsToFlag = [
      ...new Set(initialErrorFields.filter(field => !initialErrorFieldsUnflagged.includes(field) && !(errorFields.includes(field) || getErrorParent(this.errors, field)))),
    ];
    return {
      errorFields,
      touchedErrorFields,
      initialErrorFields,
      initialErrorFieldsUntouched,
      initialErrorFieldsUnchanged,
      initialErrorFieldsUnflagged,
      initialErrorFieldsToFlag,
    };
  };

  /**
   * update form error state with backend errors
   *
   * Initial error fields whose values are unchanged
   * should be set as errors in the form state. If they are
   * not touched, they should be set as touched.
   *
   * Initial error fields that *have* since been touched or their values changed
   * should NOT be removed from the form error state. The error state may have
   * newer validation errors that should take precedence. (Client-side validation
   * errors are always freshly calculated before this method is called.)
   *
   * @param {Function} setFieldError - the setFieldError function
   * @param {Function} setFieldTouched - the setFieldTouched function
   * @param {Array} errorFields - the error fields
   * @param {Array} initialErrorFields - the initial error fields
   * @param {Array} initialErrorFieldsUnflagged - the initial error fields that are
   * not flagged as unchanged
   */
  addBackendErrors = (
    setFieldError,
    setFieldTouched,
    initialErrorFieldsToFlag
  ) => {
    if (initialErrorFieldsToFlag?.length > 0) {
      initialErrorFieldsToFlag.forEach((field) => {
        const fieldError = get(this.initialErrors, field);
        setFieldError(field, fieldError);
        if (!get(this.touched, field) || !getTouchedParent(this.touched, field)) {
          setFieldTouched(field, true);
        }
      });
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
    touchedErrorFields,
    initialErrorFields,
    initialErrorFieldsUnchanged,
    initialErrorFieldsToFlag,
  ) => {
    let errorPages = {};
    let flaggedErrorPages = {};

    for (const p of formPages) {
      const pageErrorFields = formPageFields[p.section]?.filter((item) =>
        errorFields?.some(e => item.startsWith(e) || e.startsWith(item))
      );
      const pageTouchedErrorFields = pageErrorFields?.filter(
        (item) => touchedErrorFields?.some(e => item.startsWith(e) || e.startsWith(item))
      );
      const pageInitialErrorFields = formPageFields[p.section]?.filter((item) =>
        initialErrorFields?.some(i => item.startsWith(i) || i.startsWith(item))
      );
      const pageInitialUnchangedFields = pageInitialErrorFields?.filter((item) =>
        initialErrorFieldsUnchanged?.some(i => item.startsWith(i) || i.startsWith(item))
      );
      const hasInitialUnchangedFields = pageInitialUnchangedFields?.length > 0;
      const pageInitialErrorFieldsToFlag = pageInitialErrorFields?.filter((item) =>
        initialErrorFieldsToFlag?.some(i => item.startsWith(i) || i.startsWith(item))
      );
      const hasInitialErrorFieldsToFlag = pageInitialErrorFieldsToFlag?.length > 0;
      if (
        pageErrorFields?.length > 0 ||
        hasInitialUnchangedFields
      ) {
        errorPages[p.section] = [
          ...new Set([
            ...pageErrorFields,
            ...pageInitialUnchangedFields,
          ]),
        ];
      }
      if (pageTouchedErrorFields?.length > 0 || hasInitialErrorFieldsToFlag) {
        flaggedErrorPages[p.section] = [
          ...new Set([
            ...pageTouchedErrorFields,
            ...pageInitialErrorFieldsToFlag,
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
    setFieldTouched,
    setPagesWithErrors,
    setPagesWithFlaggedErrors
  ) => {
    console.log("Updating form error state");
    const errorFieldSets = this.errorsToFieldSets();
    console.log("errorFieldSets:", errorFieldSets);

    this.addBackendErrors(
      setFieldError,
      setFieldTouched,
      errorFieldSets.initialErrorFieldsToFlag
    );
    console.log("added backend errors");
    console.log("errors:", this.errors);
    console.log("touched:", this.touched);

    const [errorPages, flaggedErrorPages] = this.getErrorPages(
      this.formPages,
      this.formPageFields,
      errorFieldSets.errorFields,
      errorFieldSets.touchedErrorFields,
      errorFieldSets.initialErrorFields,
      errorFieldSets.initialErrorFieldsUnchanged,
      errorFieldSets.initialErrorFieldsToFlag
    );
    console.log("got error pages");
    console.log("errorPages:", errorPages);
    console.log("flaggedErrorPages:", flaggedErrorPages);

    setPagesWithErrors(errorPages);
    console.log("set error pages");
    setPagesWithFlaggedErrors(flaggedErrorPages);
    console.log("set flagged error pages");
  };
}

export { FormErrorManager };
