/**
 * Hidden-field detection for the deposit form footer notices.
 *
 * Visibility is one shared predicate: a path is hidden iff it does not match
 * any path in `formUIState.currentFormPageFields` (via {@link fieldMatches}).
 *
 * Notices only include paths that appear on the **current form page** in
 * `formSectionFields` for some resource type (so switching type could reveal
 * them without leaving the page).
 *
 * Candidate sets differ by variant:
 * - errors: flatten `sectionErrorsFlagged[].error_fields`
 * - values: configured paths from `formSectionFields` with a non-empty Formik value,
 *   minus any path already in the errors set (via {@link fieldMatches})
 *
 * Resource-type switch suggestions are a separate step over `formSectionFields`
 * (scoped to the current page).
 */

import get from "lodash/get";
import { fieldMatches } from "./utils";

/** Default cap on switch-to type buttons in the footer notices. */
const DEFAULT_MAX_SUGGESTED_TYPES = 5;

/**
 * Whether a Formik value counts as “filled” for hidden-value notices.
 * Empty string / whitespace, `null`, `undefined`, `[]`, and `{}` (including
 * nested all-empty objects/arrays) do not count. Booleans and numbers do
 * (including `false` / `0`); refine per-field later if needed.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isNonEmptyFormValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "boolean" || typeof value === "number") return true;
  if (Array.isArray(value)) {
    return value.length > 0 && value.some((item) => isNonEmptyFormValue(item));
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return keys.length > 0 && keys.some((k) => isNonEmptyFormValue(value[k]));
  }
  return true;
}

/**
 * @param {string} path - Formik field path
 * @param {Object.<string, string[]>} currentFormPageFields
 * @returns {boolean}
 */
function isFieldHidden(path, currentFormPageFields) {
  if (!path) return false;
  const pageFields =
    currentFormPageFields && typeof currentFormPageFields === "object"
      ? currentFormPageFields
      : {};
  const visibleFields = Object.values(pageFields).flatMap((paths) =>
    Array.isArray(paths) ? paths : []
  );
  return !visibleFields.some((visible) => fieldMatches(path, visible));
}

/**
 * Whether `path` appears in any `formSectionFields` entry for `pageId`
 * (any resource type).
 *
 * @param {string} path
 * @param {Array<{ pageId?: string, fields?: string[] }>} sectionsConfig
 * @param {string} pageId
 * @returns {boolean}
 */
function isConfiguredOnPage(path, sectionsConfig, pageId) {
  if (!path || !pageId) return false;
  const config = Array.isArray(sectionsConfig) ? sectionsConfig : [];
  return config.some(
    (entry) =>
      (entry.pageId ?? "") === pageId &&
      (entry.fields ?? []).some((f) => fieldMatches(path, f))
  );
}

/**
 * Unique field paths configured on `currentFormPage` for any resource type that
 * are not visible for the current resource type.
 *
 * @param {Array<{ pageId?: string, fields?: string[] }>} sectionsConfig
 * @param {string} currentFormPage
 * @param {Object.<string, string[]>} currentFormPageFields
 * @returns {string[]}
 */
function getHiddenConfiguredPathsOnPage(
  sectionsConfig,
  currentFormPage,
  currentFormPageFields
) {
  const config = Array.isArray(sectionsConfig) ? sectionsConfig : [];
  const paths = new Set();
  for (const entry of config) {
    if ((entry.pageId ?? "") !== currentFormPage) continue;
    for (const fieldPath of entry.fields ?? []) {
      if (fieldPath) paths.add(fieldPath);
    }
  }
  return [...paths].filter((path) => isFieldHidden(path, currentFormPageFields));
}

/**
 * Flagged error paths that are not visible for the current resource type and
 * could appear on `currentFormPage` under another type.
 *
 * @param {Array<{ error_fields?: string[] }>} sectionErrorsFlagged
 * @param {Object.<string, string[]>} currentFormPageFields
 * @param {Array} sectionsConfig
 * @param {string} currentFormPage
 * @returns {string[]}
 */
function getHiddenErrorPaths(
  sectionErrorsFlagged,
  currentFormPageFields,
  sectionsConfig,
  currentFormPage
) {
  const list = Array.isArray(sectionErrorsFlagged) ? sectionErrorsFlagged : [];
  const candidates = [
    ...new Set(
      list.flatMap((entry) =>
        Array.isArray(entry?.error_fields) ? entry.error_fields : []
      )
    ),
  ];
  return candidates.filter(
    (path) =>
      isFieldHidden(path, currentFormPageFields) &&
      isConfiguredOnPage(path, sectionsConfig, currentFormPage)
  );
}

/**
 * Pick up to `maxCount` items evenly spaced across an already-ordered array
 * (first, last, and intermediates), so samples are scattered rather than
 * clustered at the start.
 *
 * @template T
 * @param {T[]} orderedItems
 * @param {number} [maxCount=5]
 * @returns {T[]}
 */
function scatterSample(orderedItems, maxCount = 5) {
  const items = Array.isArray(orderedItems) ? orderedItems : [];
  const limit = Math.max(0, Math.floor(maxCount));
  if (limit === 0 || items.length === 0) return [];
  if (items.length <= limit) return [...items];
  if (limit === 1) {
    return [items[Math.floor((items.length - 1) / 2)]];
  }
  const picked = [];
  const seen = new Set();
  for (let i = 0; i < limit; i++) {
    const index = Math.round((i * (items.length - 1)) / (limit - 1));
    if (seen.has(index)) continue;
    seen.add(index);
    picked.push(items[index]);
  }
  return picked;
}

/**
 * Suggest alternative resource types for hidden paths: all covering types on
 * the current page, alphabetized by `getLabel` (or id), then scatter-sampled.
 *
 * @param {string[]} hiddenPaths
 * @param {Array<{ pageId?: string, fields?: string[], resourceTypes?: string[] }>} sectionsConfig
 * @param {string} currentResourceType
 * @param {string} [currentFormPage]
 * @param {{ getLabel?: (typeId: string) => string, maxSuggestions?: number }} [options]
 * @returns {string[]}
 */
function suggestResourceTypesForPaths(
  hiddenPaths,
  sectionsConfig,
  currentResourceType,
  currentFormPage,
  options = {}
) {
  const {
    getLabel = (typeId) => typeId,
    maxSuggestions = DEFAULT_MAX_SUGGESTED_TYPES,
  } = options;
  const paths = Array.isArray(hiddenPaths) ? hiddenPaths : [];
  const config = Array.isArray(sectionsConfig) ? sectionsConfig : [];
  if (paths.length === 0 || config.length === 0) return [];

  const covering = new Set();
  for (const entry of config) {
    if (currentFormPage && (entry.pageId ?? "") !== currentFormPage) {
      continue;
    }
    const fields = entry.fields ?? [];
    const coversAny = paths.some((p) => fields.some((f) => fieldMatches(p, f)));
    if (!coversAny) continue;
    for (const typeId of entry.resourceTypes ?? []) {
      if (typeId && typeId !== currentResourceType) {
        covering.add(typeId);
      }
    }
  }

  const sorted = [...covering].sort((a, b) =>
    String(getLabel(a)).localeCompare(String(getLabel(b)), undefined, {
      sensitivity: "base",
    })
  );
  return scatterSample(sorted, maxSuggestions);
}

/**
 * Banner payload for the errors variant.
 *
 * @param {Array<{ error_fields?: string[] }>} sectionErrorsFlagged
 * @param {Array} sectionsConfig
 * @param {string} currentResourceType
 * @param {Object.<string, string[]>} currentFormPageFields
 * @param {string} currentFormPage
 * @param {{ getLabel?: (typeId: string) => string, maxSuggestions?: number }} [suggestOptions]
 * @returns {{ hiddenPaths: string[], suggestedResourceTypes: string[] }}
 */
function getHiddenErrors(
  sectionErrorsFlagged,
  sectionsConfig,
  currentResourceType,
  currentFormPageFields,
  currentFormPage,
  suggestOptions
) {
  const hiddenPaths = getHiddenErrorPaths(
    sectionErrorsFlagged,
    currentFormPageFields,
    sectionsConfig,
    currentFormPage
  );
  return {
    hiddenPaths,
    suggestedResourceTypes: suggestResourceTypesForPaths(
      hiddenPaths,
      sectionsConfig,
      currentResourceType,
      currentFormPage,
      suggestOptions
    ),
  };
}

/**
 * Banner payload for the values variant.
 *
 * Builds page-configured hidden paths once (`hiddenConfiguredPaths`) so the
 * banner can mark them touched for validation, then filters to non-empty
 * values for display (`hiddenPaths`), excluding any path that already appears
 * in the hidden-errors set (so the two notices do not list the same fields).
 *
 * @param {Object} values
 * @param {Array} sectionsConfig
 * @param {string} currentResourceType
 * @param {Object.<string, string[]>} currentFormPageFields
 * @param {string} currentFormPage
 * @param {{ getLabel?: (typeId: string) => string, maxSuggestions?: number }} [suggestOptions]
 * @param {Array<{ error_fields?: string[] }>} [sectionErrorsFlagged] - flagged errors to subtract
 * @returns {{
 *   hiddenPaths: string[],
 *   hiddenConfiguredPaths: string[],
 *   suggestedResourceTypes: string[],
 * }}
 */
function getHiddenValuedFields(
  values,
  sectionsConfig,
  currentResourceType,
  currentFormPageFields,
  currentFormPage,
  suggestOptions,
  sectionErrorsFlagged
) {
  const hiddenConfiguredPaths = getHiddenConfiguredPathsOnPage(
    sectionsConfig,
    currentFormPage,
    currentFormPageFields
  );
  const errorPaths = getHiddenErrorPaths(
    sectionErrorsFlagged,
    currentFormPageFields,
    sectionsConfig,
    currentFormPage
  );
  const hiddenPaths = hiddenConfiguredPaths.filter((path) => {
    if (!isNonEmptyFormValue(get(values, path))) return false;
    return !errorPaths.some((errPath) => fieldMatches(errPath, path));
  });
  return {
    hiddenPaths,
    hiddenConfiguredPaths,
    suggestedResourceTypes: suggestResourceTypesForPaths(
      hiddenPaths,
      sectionsConfig,
      currentResourceType,
      currentFormPage,
      suggestOptions
    ),
  };
}

export {
  getHiddenErrors,
  getHiddenValuedFields,
  suggestResourceTypesForPaths,
};
