/**
 * Helpers for keeping Formik as the deposit-form source of truth for
 * server-owned share fields (`expanded`, `links`, `parent.access.*`).
 */

/**
 * Whether Formik is missing a value that Redux already has.
 *
 * @param {*} formikVal
 * @param {*} reduxVal
 * @returns {boolean}
 */
export function shouldFillFromRedux(formikVal, reduxVal) {
  if (reduxVal == null) {
    return false;
  }
  if (formikVal == null) {
    return true;
  }
  if (
    !Array.isArray(formikVal) &&
    typeof formikVal === "object" &&
    typeof reduxVal === "object" &&
    !Array.isArray(reduxVal) &&
    Object.keys(formikVal).length === 0 &&
    Object.keys(reduxVal).length > 0
  ) {
    return true;
  }
  return false;
}

/**
 * Return Formik values with any missing server-owned share fields filled
 * from the Redux deposit record. Returns the same reference when nothing
 * needs filling.
 *
 * @param {object} formikValues
 * @param {object} reduxRecord
 * @returns {object}
 */
export function fillMissingFromRedux(formikValues, reduxRecord) {
  if (!formikValues || !reduxRecord) {
    return formikValues;
  }

  let next = formikValues;
  const touch = () => {
    if (next === formikValues) {
      next = { ...formikValues };
    }
    return next;
  };

  if (shouldFillFromRedux(formikValues.expanded, reduxRecord.expanded)) {
    touch().expanded = reduxRecord.expanded;
  }
  if (shouldFillFromRedux(formikValues.links, reduxRecord.links)) {
    touch().links = reduxRecord.links;
  }

  const reduxAccess = reduxRecord.parent?.access;
  if (reduxAccess) {
    const formikAccess = formikValues.parent?.access;
    let access = formikAccess ? { ...formikAccess } : {};
    let accessChanged = !formikAccess;

    if (shouldFillFromRedux(formikAccess?.settings, reduxAccess.settings)) {
      access.settings = reduxAccess.settings;
      accessChanged = true;
    }
    if (shouldFillFromRedux(formikAccess?.grants, reduxAccess.grants)) {
      access.grants = reduxAccess.grants;
      accessChanged = true;
    }
    if (shouldFillFromRedux(formikAccess?.links, reduxAccess.links)) {
      access.links = reduxAccess.links;
      accessChanged = true;
    }
    if (
      shouldFillFromRedux(formikAccess?.owned_by, reduxAccess.owned_by)
    ) {
      access.owned_by = reduxAccess.owned_by;
      accessChanged = true;
    }

    if (accessChanged) {
      touch();
      next.parent = {
        ...(formikValues.parent ?? reduxRecord.parent),
        access: {
          ...reduxAccess,
          ...access,
        },
      };
    }
  }

  return next;
}

/**
 * Snapshot for ShareModal: Formik-shaped record with a shallow-cloned
 * `parent.access` so modal mutations cannot touch Redux or live Formik
 * until we explicitly write back.
 *
 * @param {object} formikValues
 * @returns {object}
 */
export function buildRecordForModal(formikValues) {
  if (!formikValues) {
    return {};
  }
  return {
    ...formikValues,
    parent: formikValues.parent
      ? {
          ...formikValues.parent,
          access: formikValues.parent.access
            ? { ...formikValues.parent.access }
            : formikValues.parent.access,
        }
      : formikValues.parent,
  };
}

/**
 * Paths the share modal may update; merge these into Formik without
 * clobbering in-progress metadata edits.
 *
 * @param {object} formikValues - current Formik values
 * @param {object} modalRecord - ShareModal working record
 * @returns {object} next Formik values
 */
export function mergeShareRecordIntoFormik(formikValues, modalRecord) {
  if (!modalRecord) {
    return formikValues;
  }
  const next = { ...formikValues };
  if (modalRecord.expanded !== undefined) {
    next.expanded = modalRecord.expanded;
  }
  if (modalRecord.links !== undefined) {
    next.links = modalRecord.links;
  }
  if (modalRecord.parent?.access !== undefined) {
    next.parent = {
      ...(formikValues.parent ?? modalRecord.parent),
      access: {
        ...(formikValues.parent?.access ?? {}),
        ...modalRecord.parent.access,
      },
    };
  }
  return next;
}
