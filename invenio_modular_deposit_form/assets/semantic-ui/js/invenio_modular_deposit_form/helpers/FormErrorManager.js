import { get, isEqual } from "lodash";
import { flattenKeysDotJoined, getTouchedParent, getErrorParent } from "../utils";
import { FORM_UI_ACTION } from "./formUIStateReducer";

const SEVERITIES = ["error", "warning", "info"];

/** Top-level keys that correspond to Formik values / Yup validation on the deposit record. */
const RECORD_FIELD_ERROR_ROOTS = new Set([
  "metadata",
  "access",
  "pids",
  "custom_fields",
  "files",
]);

/**
 * Global API failures (e.g. 400 CSRF) often return `{ message: "..." }` only. Those keys are not
 * form field paths — if we treat them like field errors, Yup clears them on the next validation
 * pass and {@link FormErrorManager} re-applies them from `initialErrors`, causing an update loop.
 *
 * @param {string} path - Dot-joined path from {@link flattenKeysDotJoined}
 * @returns {boolean}
 */
function isRecordFieldErrorPath(path) {
  if (typeof path !== "string" || path.length === 0) return false;
  const root = path.split(".")[0];
  return RECORD_FIELD_ERROR_ROOTS.has(root);
}

/**
 * Resolve severity for a field path from the errors object at that path.
 * Error values may be a string (legacy) or an object { message, severity?, description? }.
 * Backend and validation can set severity to "error" | "warning" | "info"; if missing, treated as "error".
 * @param {Object} errors - Formik errors or initialErrors
 * @param {string} path - Dot-notation field path
 * @returns {"error"|"warning"|"info"}
 */
function getSeverityAtPath(errors, path) {
  const err = get(errors, path);
  if (err && typeof err === "object" && SEVERITIES.includes(err.severity)) {
    return err.severity;
  }
  return "error";
}

/**
 * Find the section (pageId, sectionId) that owns this field path.
 * formSectionFields is the full section config (common_fields + fields_by_type for all resource types),
 * so paths are attributed to a section even if that section is not visible for the current type.
 * Matching: path equals a section field, or path is a descendant (path.startsWith(f + ".")), or section field is a descendant of path. Same rule as FormFeedbackSummary.
 * @param {Array<{ pageId, sectionId, fields: string[] }>} formSectionFields
 * @param {string} fieldPath
 * @returns {{ pageId: string, sectionId: string } | null} null if path is not in any section's fields
 */
function fieldPathToSection(formSectionFields, fieldPath) {
  if (!Array.isArray(formSectionFields)) return null;
  for (const entry of formSectionFields) {
    const fields = entry?.fields ?? [];
    for (const f of fields) {
      if (fieldPath === f || fieldPath.startsWith(f + ".") || f.startsWith(fieldPath + ".")) {
        return { pageId: entry.pageId ?? "", sectionId: entry.sectionId ?? "" };
      }
    }
  }
  return null;
}

/**
 * Helper to harmonize server-side, client-side validation, and form page error states
 *
 * NOTE: fields marked if error + touched or if initial error + value unchanged
 *       (initial errors should become errors when touched and not fixed)
 *
 * Fields must be touched to display formik errors. This presents challenges when 
 * merging server-side and client-side validation errors. 
 * 
 * - This class will set the touched state appropriately for backend errors that haven't actually been touched yet 
 *   but should be displayed. (i.e. the initial value that caused the error has not changed)
 * 
 * - On form submission all fields are automatically untouched again, so error flagging on the form
 *   (which is based on the touched state) would be briefly lost after submission and only regained 
 *   when the field is touched again. To avoid this, we need to set all fields with errors in the formik 
 *   error state to `touched` after the form is submitted. This is handled by
 *   syncTouchedForBackendValidationErrors().
 *
 * Output (refactor): two flat lists of section entries, both of shape
 *   { page, section, error_fields: string[], info_fields: string[], warning_fields: string[] }.
 * sectionErrorsFlagged: only paths that should be displayed (touched + initial-to-flag). Used for stepper, sidebar, section headers.
 * sectionErrorsAll: any path with an error (client or initial/unchanged). Used for nav guard.
 * Severity comes from the error value at each path ("error"|"warning"|"info"). Paths not in formSectionFields are skipped.
 */
class FormErrorManager {
  /**
   * FormErrorManager constructor
   * @param {Array<{ pageId, sectionId, fields }>} formSectionFields - full section config for path->section lookup (all types)
   * @param {Object} formik - Formik context (errors, touched, initialErrors, initialValues, values, setFieldError, setFieldTouched)
   * @param {Object} store - Redux store (for reading deposit.actionState)
   */
  constructor(formik, store) {
    this.formik = formik;
    this.store = store.getState();
    this.formSectionFields = this.store.deposit?.config?.formSectionFields ?? [];
  }

  /**
   * When we have backend validation errors (submit or load), sync touched for all current error
   * fields so the stepper/sidebar can flag them. Only runs when Redux actionState indicates
   * server-side validation errors; does not run on every client-side validation change.
   */
  syncTouchedForBackendValidationErrors = () => {
    const actionState = this.store?.deposit?.actionState;
    const hasBackendValidationErrors =
      actionState && String(actionState).includes("VALIDATION_ERRORS");
    if (!hasBackendValidationErrors) return;
    const { errors, touched, setFieldTouched } = this.formik;
    const errorFields = errors
      ? flattenKeysDotJoined(errors).filter(isRecordFieldErrorPath)
      : [];
    if (errorFields.length === 0) return;
    errorFields.forEach((field) => {
      if (!get(touched, field) && !getTouchedParent(touched, field)) {
        setFieldTouched(field, true);
      }
    });
  };

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
    const { errors, touched, initialErrors, initialValues, values } = this.formik;
    const errorFields = flattenKeysDotJoined(errors).filter(isRecordFieldErrorPath);
    const touchedFields = flattenKeysDotJoined(touched);
    const touchedErrorFields = errorFields?.filter(
      (item) => touchedFields.includes(item) || getTouchedParent(touched, item)
    );
    const initialErrorFields = flattenKeysDotJoined(initialErrors).filter(
      isRecordFieldErrorPath
    );
    const initialErrorFieldsUntouched = initialErrorFields?.filter(
      (item) => !touchedFields.includes(item)
    );
    const initialErrorFieldsUnchanged = initialErrorFields?.filter((item) =>
      isEqual(get(values, item), get(initialValues, item))
    );
    // const untouchedSet = new Set(initialErrorFieldsUntouched);
    const unchangedSet = new Set(initialErrorFieldsUnchanged);
    const initialErrorFieldsUnflagged = initialErrorFields?.filter(
      (item) => !unchangedSet.has(item)
    );

    // have to account for possibility that frontend and backend error paths
    // are at different levels of specificity
    const initialErrorFieldsToFlag = [
      ...new Set(initialErrorFields.filter(field => !initialErrorFieldsUnflagged.includes(field) && !(errorFields.includes(field) || getErrorParent(errors, field)))),
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
   * Uses this.formik for setFieldError, setFieldTouched, initialErrors, and touched.
   *
   * @param {Array} initialErrorFieldsToFlag - the initial error fields to flag (set in formik)
   */
  addBackendErrors = (initialErrorFieldsToFlag) => {
    const { setFieldError, setFieldTouched, initialErrors, touched } = this.formik;
    if (initialErrorFieldsToFlag?.length > 0) {
      initialErrorFieldsToFlag.forEach((field) => {
        const fieldError = get(initialErrors, field);
        setFieldError(field, fieldError);
        if (!get(touched, field) || !getTouchedParent(touched, field)) {
          setFieldTouched(field, true);
        }
      });
    }
  };

  /**
   * Build a flat list of section error entries from a set of field paths. Each entry has
   * page, section, error_fields, info_fields, warning_fields (string[] each). Paths that
   * do not resolve to any section (fieldPathToSection returns null) are skipped.
   * useErrorsForPath(path) returns the errors object to use for severity for that path
   * (formik.errors vs formik.initialErrors depending on whether the path is in the "current"
   * or "initial" set). Severity is read from the error value and paths are bucketed into
   * error_fields, warning_fields, or info_fields. Arrays are sorted for stable output.
   *
   * @param {string[]} fieldPaths - paths to aggregate by section
   * @param {function(string): Object} useErrorsForPath - (path) => errors object for getSeverityAtPath
   * @returns {Array<{ page, section, error_fields, info_fields, warning_fields }>}
   */
  _buildSectionErrorList = (fieldPaths, useErrorsForPath) => {
    const byKey = new Map();
    for (const path of fieldPaths) {
      const section = fieldPathToSection(this.formSectionFields, path);
      if (!section) continue;
      const key = `${section.pageId}\0${section.sectionId}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          page: section.pageId,
          section: section.sectionId,
          error_fields: [],
          info_fields: [],
          warning_fields: [],
        });
      }
      const entry = byKey.get(key);
      const errors = useErrorsForPath(path);
      const severity = getSeverityAtPath(errors, path);
      if (severity === "error") entry.error_fields.push(path);
      else if (severity === "warning") entry.warning_fields.push(path);
      else entry.info_fields.push(path);
    }
    return Array.from(byKey.values()).map((entry) => ({
      ...entry,
      error_fields: [...entry.error_fields].sort(),
      info_fields: [...entry.info_fields].sort(),
      warning_fields: [...entry.warning_fields].sort(),
    }));
  };

  /**
   * Section error list for "flagged" paths only: those that should be displayed (touched errors
   * plus initial errors that are unchanged and not superseded by a client error). Used by
   * stepper, sidebar, and section headers. For severity we use formik.errors for touched paths
   * and formik.initialErrors for initial-to-flag paths.
   *
   * @param {string[]} touchedErrorFields - paths with errors that are touched
   * @param {string[]} initialErrorFieldsToFlag - paths with initial errors to show (unchanged, not in client errors)
   * @returns {Array<{ page, section, error_fields, info_fields, warning_fields }>}
   */
  getSectionErrorState = (touchedErrorFields, initialErrorFieldsToFlag) => {
    const paths = [
      ...new Set([...(touchedErrorFields ?? []), ...(initialErrorFieldsToFlag ?? [])]),
    ];
    const touchedSet = new Set(touchedErrorFields ?? []);
    const { errors, initialErrors } = this.formik;
    return this._buildSectionErrorList(paths, (path) =>
      touchedSet.has(path) ? errors : initialErrors
    );
  };

  /**
   * Section error list for "any" error paths: client errorFields plus initial errors that are
   * unchanged (regardless of touched). Used for the nav guard so we show "confirm when leaving"
   * even when the user has not yet touched a field with an error. For severity we use
   * formik.errors for paths in errorFields and formik.initialErrors for initial/unchanged.
   *
   * @param {string[]} errorFields - all paths with a current error
   * @param {string[]} initialErrorFieldsUnchanged - paths with initial error and value unchanged
   * @returns {Array<{ page, section, error_fields, info_fields, warning_fields }>}
   */
  getSectionErrorStateAll = (errorFields, initialErrorFieldsUnchanged) => {
    const paths = [...new Set([...(errorFields ?? []), ...(initialErrorFieldsUnchanged ?? [])])];
    const errorSet = new Set(errorFields ?? []);
    const { errors, initialErrors } = this.formik;
    return this._buildSectionErrorList(paths, (path) =>
      errorSet.has(path) ? errors : initialErrors
    );
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
   * Implementation builds section error lists (sectionErrorsFlagged, sectionErrorsAll) and
   * dispatches SET_SECTION_ERRORS_FLAGGED and SET_SECTION_ERRORS_ALL.
   *
   * @param {Function} dispatch - Form UI reducer dispatch (dispatches SET_SECTION_ERRORS_FLAGGED, SET_SECTION_ERRORS_ALL)
   */
  updateFormErrorState = (dispatch) => {
    console.log("Starting error values:");
    console.log("values:", this.formik.values);
    console.log("errors:", this.formik.errors);
    console.log("touched:", this.formik.touched);
    this.syncTouchedForBackendValidationErrors();

    const errorFieldSets = this.errorsToFieldSets();
    this.addBackendErrors(errorFieldSets.initialErrorFieldsToFlag);

    const sectionErrorsFlagged = this.getSectionErrorState(
      errorFieldSets.touchedErrorFields,
      errorFieldSets.initialErrorFieldsToFlag,
    );
    const sectionErrorsAll = this.getSectionErrorStateAll(
      errorFieldSets.errorFields,
      errorFieldSets.initialErrorFieldsUnchanged,
    );
    dispatch({ type: FORM_UI_ACTION.SET_SECTION_ERRORS_FLAGGED, payload: sectionErrorsFlagged });
    dispatch({ type: FORM_UI_ACTION.SET_SECTION_ERRORS_ALL, payload: sectionErrorsAll });
  };
}

export { FormErrorManager };
