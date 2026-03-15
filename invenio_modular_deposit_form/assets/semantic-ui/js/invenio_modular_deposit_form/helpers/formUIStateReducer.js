/**
 * Reducer and actions for form UI state (current page, section errors, resource type, field maps).
 * Used with useReducer in FormLayoutContainer. FormErrorManager produces the section error lists
 * and dispatches SET_SECTION_ERRORS_FLAGGED and SET_SECTION_ERRORS_ALL; selectors below derive
 * page- or section-keyed views for stepper, sidebar, nav guard, and section headers.
 *
 * State:
 * - currentFormPage: current form page id (section id from form pages config).
 * - currentFormPageFields: resolved Formik field paths per page for current type { [pageId]: string[] }.
 * - currentResourceType: current resource type id.
 * - currentTypeFields: layout config for the current resource type { [pageId]: subsectionConfig[] }.
 * - sectionErrorsFlagged: flat list of section entries for "flagged" errors only (touched + initial-to-flag).
 *   Used by stepper, sidebar, section headers. Same shape as sectionErrorsAll.
 * - sectionErrorsAll: flat list of section entries for any error (client + initial/unchanged).
 *   Used by nav guard to know if a page has errors before the user has touched fields.
 *
 * Section entry shape: { page, section, error_fields, info_fields, warning_fields } (each value string[]).
 */

const FORM_UI_ACTION = {
  SET_CURRENT_FORM_PAGE: "SET_CURRENT_FORM_PAGE",
  SET_SECTION_ERRORS_FLAGGED: "SET_SECTION_ERRORS_FLAGGED",
  SET_SECTION_ERRORS_ALL: "SET_SECTION_ERRORS_ALL",
  SET_CURRENT_RESOURCE_TYPE: "SET_CURRENT_RESOURCE_TYPE",
  SET_CURRENT_TYPE_FIELDS: "SET_CURRENT_TYPE_FIELDS",
  SET_CURRENT_FORM_PAGE_FIELDS: "SET_CURRENT_FORM_PAGE_FIELDS",
};

const defaultState = {
  currentFormPage: "",
  currentFormPageFields: {},
  currentResourceType: "",
  currentTypeFields: {},
  sectionErrorsFlagged: [],
  sectionErrorsAll: [],
};

/**
 * Build initial form UI state from form pages config and resource type config.
 * Sets currentFormPage to the first page's section id and currentTypeFields from fieldsByType.
 *
 * @param {Array} formPages - form pages from deposit config (common_fields FormPages subsections)
 * @param {string} defaultResourceType - initial resource type id
 * @param {Object} fieldsByType - resource type id -> { [pageId]: subsectionConfig[] }
 * @returns {Object} initial state for formUIStateReducer
 */
function getInitialFormUIState(formPages, defaultResourceType, fieldsByType) {
  const firstSection = formPages[0]?.section ?? "";
  return {
    ...defaultState,
    currentFormPage: firstSection,
    currentResourceType: defaultResourceType ?? "",
    currentTypeFields: fieldsByType?.[defaultResourceType] ?? {},
  };
}

/**
 * Reducer for form UI state. Handles: SET_CURRENT_FORM_PAGE, SET_SECTION_ERRORS_FLAGGED,
 * SET_SECTION_ERRORS_ALL, SET_CURRENT_RESOURCE_TYPE, SET_CURRENT_TYPE_FIELDS, SET_CURRENT_FORM_PAGE_FIELDS.
 */
function formUIStateReducer(state, action) {
  switch (action.type) {
    case FORM_UI_ACTION.SET_CURRENT_FORM_PAGE:
      return { ...state, currentFormPage: action.payload };
    case FORM_UI_ACTION.SET_SECTION_ERRORS_FLAGGED:
      return { ...state, sectionErrorsFlagged: action.payload ?? [] };
    case FORM_UI_ACTION.SET_SECTION_ERRORS_ALL:
      return { ...state, sectionErrorsAll: action.payload ?? [] };
    case FORM_UI_ACTION.SET_CURRENT_RESOURCE_TYPE:
      return { ...state, currentResourceType: action.payload };
    case FORM_UI_ACTION.SET_CURRENT_TYPE_FIELDS:
      return { ...state, currentTypeFields: action.payload };
    case FORM_UI_ACTION.SET_CURRENT_FORM_PAGE_FIELDS:
      return { ...state, currentFormPageFields: action.payload };
    default:
      return state;
  }
}

/**
 * Page id -> list of all flagged field paths on that page (error + warning + info).
 * Use for stepper and sidebar "has error" styling. Built from sectionErrorsFlagged; flattens
 * error_fields, info_fields, warning_fields per page and deduplicates.
 *
 * @param {Object} formUIState - state with sectionErrorsFlagged
 * @returns {{ [pageId]: string[] }}
 */
function getPagesWithFlaggedErrors(formUIState) {
  const list = formUIState?.sectionErrorsFlagged ?? [];
  const out = {};
  for (const entry of list) {
    const page = entry?.page ?? "";
    const all = [
      ...(entry?.error_fields ?? []),
      ...(entry?.info_fields ?? []),
      ...(entry?.warning_fields ?? []),
    ];
    if (all.length > 0) {
      out[page] = [...(out[page] ?? []), ...all];
    }
  }
  for (const p of Object.keys(out)) {
    out[p] = [...new Set(out[p])];
  }
  return out;
}

/**
 * Per-page counts and highest severity for flagged errors. Use for stepper/sidebar
 * severity styling (has-error, has-warning, has-info) and count badges.
 *
 * @param {Object} formUIState - state with sectionErrorsFlagged
 * @returns {{ [pageId]: { errors: number, warnings: number, info: number, severity: "error"|"warning"|"info"|null } }}
 */
function getPageFlaggedErrorCounts(formUIState) {
  const list = formUIState?.sectionErrorsFlagged ?? [];
  const out = {};
  for (const entry of list) {
    const page = entry?.page ?? "";
    if (!out[page]) {
      out[page] = { errors: 0, warnings: 0, info: 0, severity: null };
    }
    const e = (entry?.error_fields ?? []).length;
    const w = (entry?.warning_fields ?? []).length;
    const i = (entry?.info_fields ?? []).length;
    out[page].errors += e;
    out[page].warnings += w;
    out[page].info += i;
  }
  for (const page of Object.keys(out)) {
    const rec = out[page];
    const total = rec.errors + rec.warnings + rec.info;
    rec.severity =
      total === 0
        ? null
        : rec.errors > 0
          ? "error"
          : rec.warnings > 0
            ? "warning"
            : "info";
  }
  return out;
}

/**
 * Page id -> list of all field paths with any error on that page (flagged or not).
 * Uses sectionErrorsAll. Use for nav guard: "confirm when leaving page with errors" even when
 * the user has not touched the field. Flattens error_fields, info_fields, warning_fields per page.
 *
 * @param {Object} formUIState - state with sectionErrorsAll
 * @returns {{ [pageId]: string[] }}
 */
function getPagesWithErrors(formUIState) {
  const list = formUIState?.sectionErrorsAll ?? [];
  const out = {};
  for (const entry of list) {
    const page = entry?.page ?? "";
    const all = [
      ...(entry?.error_fields ?? []),
      ...(entry?.info_fields ?? []),
      ...(entry?.warning_fields ?? []),
    ];
    if (all.length > 0) {
      out[page] = [...(out[page] ?? []), ...all];
    }
  }
  for (const p of Object.keys(out)) {
    out[p] = [...new Set(out[p])];
  }
  return out;
}

/**
 * Page id -> list of section entries with flagged errors on that page. Use for section headers
 * or per-page error summaries; each entry includes error_fields, info_fields, warning_fields
 * for severity-aware display. Built from sectionErrorsFlagged.
 *
 * @param {Object} formUIState - state with sectionErrorsFlagged
 * @returns {{ [pageId]: Array<{ page, section, error_fields, info_fields, warning_fields }> }}
 */
function getSectionErrorsByPage(formUIState) {
  const list = formUIState?.sectionErrorsFlagged ?? [];
  const out = {};
  for (const entry of list) {
    const page = entry?.page ?? "";
    if (!out[page]) out[page] = [];
    out[page].push(entry);
  }
  return out;
}

/**
 * Section key (page + "\\0" + section) -> single section entry with flagged errors. Use when
 * you need the full entry for one section (e.g. error/warning/info counts). Built from sectionErrorsFlagged.
 *
 * @param {Object} formUIState - state with sectionErrorsFlagged
 * @returns {{ [sectionKey]: { page, section, error_fields, info_fields, warning_fields } }}
 */
function getSectionErrorsBySectionKey(formUIState) {
  const list = formUIState?.sectionErrorsFlagged ?? [];
  const out = {};
  for (const entry of list) {
    const page = entry?.page ?? "";
    const section = entry?.section ?? "";
    const key = `${page}\0${section}`;
    out[key] = entry;
  }
  return out;
}

export {
  FORM_UI_ACTION,
  formUIStateReducer,
  getInitialFormUIState,
  getSectionErrorsByPage,
  getSectionErrorsBySectionKey,
  getPagesWithErrors,
  getPagesWithFlaggedErrors,
  getPageFlaggedErrorCounts,
}
