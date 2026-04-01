// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { getIn } from "formik";
import { readableFieldLabels } from "./helpers/readableFieldLabels";

/**
 * Scroll page to top
 */
function _scrollTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

function moveToArrayStart(startingArray, moveTargets, keyLabel) {
  let newArray = [...startingArray];
  for (const target of moveTargets) {
    const index = newArray.findIndex((item) => item[keyLabel] === target);
    newArray.unshift(...newArray.splice(index, 1));
  }
  return newArray;
}

function _pushToArrayEnd(startingArray, targetValue, keyLabel) {
  let newArray = [...startingArray];
  newArray.push(
    ...newArray.splice(
      newArray.findIndex((item) => item[keyLabel] === targetValue),
      1
    )
  );
  return newArray;
}

/**
 * List leaf paths in dot notation (e.g. `metadata.title`, `pids.doi`).
 *
 * Two independent controls:
 * - **`descendArrays`**: structure only. If true, array values are walked index-by-index and the
 *   array node is not emitted as one path; if false (default), an array value is a single leaf
 *   (legacy).
 * - **`includeLeaf`**: optional `(value, path) => boolean`. If set, a value only participates
 *   when this returns true: primitives emit a path only when allowed; under `descendArrays`,
 *   an array slot is skipped (no paths under it) when the slot value fails the test (e.g. Yup
 *   holes: `(v) => v !== undefined`). Object keys whose value fails the test are not emitted as
 *   leaves. Callers choose the predicate per use case (`touched`: omit `false` leaves, errors:
 *   omit `undefined`, etc.). If omitted, any value may produce paths (legacy).
 *
 * @param {Record<string, unknown>} val
 * @param {{
 *   descendArrays?: boolean,
 *   includeLeaf?: (value: unknown, path: string) => boolean,
 * }} [options]
 */
function flattenKeysDotJoined(val, options) {
  const includeLeaf = options?.includeLeaf;
  const descendArrays = options?.descendArrays === true;

  function leafAllowed(value, path) {
    return includeLeaf === undefined || includeLeaf(value, path);
  }

  /**
   * @param {unknown} node
   * @param {string} prefix - empty string at root object only
   */
  function walk(node, prefix) {
    if (node === undefined) {
      return [];
    }
    if (node === null || typeof node !== "object") {
      return prefix !== "" && leafAllowed(node, prefix) ? [prefix] : [];
    }
    if (Array.isArray(node)) {
      if (!descendArrays) {
        return prefix !== "" && leafAllowed(node, prefix) ? [prefix] : [];
      }
      const out = [];
      for (let i = 0; i < node.length; i++) {
        const el = node[i];
        const path = prefix === "" ? String(i) : `${prefix}.${i}`;
        if (el === undefined && !leafAllowed(el, path)) {
          continue;
        }
        out.push(...walk(el, path));
      }
      return out;
    }
    const keysArray = Object.keys(node);
    const out = [];
    for (let i = 0; i < keysArray.length; i++) {
      const key = keysArray[i];
      const myValue = node[key];
      const path = prefix === "" ? key : `${prefix}.${key}`;
      if (Array.isArray(myValue)) {
        if (descendArrays) {
          out.push(...walk(myValue, path));
        } else if (leafAllowed(myValue, path)) {
          out.push(path);
        }
      } else if (typeof myValue === "object" && myValue !== null) {
        out.push(...walk(myValue, path));
      } else if (leafAllowed(myValue, path)) {
        out.push(path);
      }
    }
    return out;
  }

  if (val == null || typeof val !== "object") {
    return [];
  }
  if (Array.isArray(val)) {
    return descendArrays ? walk(val, "") : [];
  }
  return walk(val, "");
}

function flattenWrappers(page) {
  let flattened = [];
  if (page.subsections) {
    for (const sub of page.subsections) {
      if (sub.subsections) {
        flattened = flattened.concat(flattenWrappers(sub));
      } else {
        flattened.push(sub);
      }
    }
  } else {
    flattened.push(page);
  }
  return flattened;
}

/**
 * Find the form page id (the page's `section` value in config) that contains
 * a section with the given component name. Used to locate the file-upload page
 * for focus and navigation without hard-coding page ids.
 *
 * @param {Array} formPages - Array of page configs (each has section, subsections)
 * @param {string} componentName - Registry component name (e.g. "FileUploadComponent")
 * @returns {string|null} Page id (e.g. "6"), or null if not found
 */
function findPageIdContainingComponent(formPages, componentName) {
  if (!Array.isArray(formPages) || !componentName) return null;
  for (const page of formPages) {
    const flat = flattenWrappers(page);
    if (flat.some((s) => s.component === componentName)) {
      return page.section ?? null;
    }
  }
  return null;
}

/**
 * One `fields_by_type` page value must be `{ label?: string, subsections: Array }` (never a bare array).
 *
 * @param {Object|null|undefined} raw
 * @returns {{ label: (string|undefined), subsections: Array|null }}
 */
function _normalizeFieldsByTypePage(raw) {
  if (raw == null) return { label: undefined, subsections: null };
  if (typeof raw === "object" && !Array.isArray(raw) && Array.isArray(raw.subsections)) {
    const label =
      typeof raw.label === "string" && raw.label.trim() !== "" ? raw.label : undefined;
    return { label, subsections: raw.subsections };
  }
  return { label: undefined, subsections: null };
}

/**
 * Merge a layout that declares top-level `same_as` with the **already-resolved base type layout**
 * for the same page. Base keys apply first; keys on `layoutWithSameAs` (except `same_as`) override
 * shallowly. If the consumer defines `subsections`, it replaces the base list; otherwise
 * subsections come from the base.
 *
 * @param {Object} layoutWithSameAs - `fields_by_type` slice entry with `same_as` set
 * @param {Object|undefined|null} baseLayout - Resolved layout from the referenced type (same page id)
 * @returns {object|null} Merged layout without `same_as`, or null if `layoutWithSameAs` is not a same_as row
 */
function _mergeSameAsLayout(layoutWithSameAs, baseLayout) {
  if (layoutWithSameAs == null || typeof layoutWithSameAs !== "object" || Array.isArray(layoutWithSameAs)) {
    return null;
  }
  if (typeof layoutWithSameAs.same_as !== "string" || layoutWithSameAs.same_as.trim() === "") {
    return null;
  }
  const baseObj =
    baseLayout != null && typeof baseLayout === "object" && !Array.isArray(baseLayout)
      ? { ...baseLayout }
      : {};
  const { same_as: _same, ...overrides } = layoutWithSameAs;
  const baseSubs = Array.isArray(baseObj.subsections) ? baseObj.subsections : [];
  return {
    ...baseObj,
    ...overrides,
    subsections: Object.prototype.hasOwnProperty.call(overrides, "subsections")
      ? overrides.subsections
      : baseSubs,
  };
}

/**
 * Resolves the **inherited page layout** for one step (`pageId`) and resource type: the object at
 * `fields_by_type[resourceTypeId][pageId]` (e.g. `subsections`, `label`, `classnames`) after
 * expanding `same_as`. Used internally before reading `.subsections` or labels; not Formik paths.
 *
 * **Without `same_as`:** shallow-copies the stored value (`{ ...pageLayout }`).
 *
 * **With `same_as: "<baseTypeId>"`:** resolves the **same** `pageId` on `baseTypeId`, then merges
 * this type on top ({@link _mergeSameAsLayout}). The result normally has no `same_as`.
 *
 * **Why recursive:** The base type’s layout can also declare `same_as` (e.g. subtype → journal →
 * generic). Each step must be fully resolved before merging the outer type, so the call walks the
 * chain until a layout has no `same_as` (or stops on a cycle via `visitedTypeIds`).
 *
 * **Returns `null`** if missing, not a plain object, or `same_as` cycles.
 *
 * @param {string} pageId - Form page id (today: FormPage `section`)
 * @param {string} resourceTypeId - Resource type whose `fields_by_type` slice is read
 * @param {Object} fieldsByType - Full `fields_by_type` map
 * @param {Set<string>} [visitedTypeIds] - Types already visited on this `same_as` chain (cycle guard)
 * @returns {Object|null} Resolved layout object (includes `subsections` when present), or null
 */
function _resolveInheritedPageLayout(pageId, resourceTypeId, fieldsByType, visitedTypeIds = new Set()) {
  if (resourceTypeId == null || resourceTypeId === "") return null;
  if (visitedTypeIds.has(resourceTypeId)) return null;
  const pageLayout = fieldsByType?.[resourceTypeId]?.[pageId];
  if (pageLayout == null || typeof pageLayout !== "object" || Array.isArray(pageLayout)) return null;

  if (typeof pageLayout.same_as === "string" && pageLayout.same_as.trim() !== "") {
    const nextVisited = new Set(visitedTypeIds);
    nextVisited.add(resourceTypeId);
    // Resolve the base type’s layout first; it may itself use same_as (multi-hop chain).
    const resolvedBaseLayout = _resolveInheritedPageLayout(
      pageId,
      pageLayout.same_as,
      fieldsByType,
      nextVisited
    );
    return _mergeSameAsLayout(pageLayout, resolvedBaseLayout);
  }
  return { ...pageLayout };
}

/**
 * One merged FormPage row: common `FormPages` entry plus `fields_by_type` override (including
 * `same_as` overlays). Resolves the type’s page entry (inheritance + shallow copy) once, then
 * derives `subsections`, `label`, and shallow spread keys (always strips `same_as` from output).
 *
 * @param {Object} commonPage - One FormPage from common_fields FormPages.subsections
 * @param {Object} currentTypePageConfigs - `fields_by_type[resourceTypeId]`
 * @param {Object} fieldsByType - full `fields_by_type` map
 * @param {string} [resourceTypeId] - Selected resource type id
 * @returns {Object}
 */
function _resolveMergedFormPageConfig(
  commonPage,
  currentTypePageConfigs,
  fieldsByType,
  resourceTypeId
) {
  const pageId = commonPage?.section;
  const raw = currentTypePageConfigs?.[pageId];
  const commonSubs = Array.isArray(commonPage?.subsections) ? commonPage.subsections : [];

  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ...commonPage,
      label: commonPage?.label ?? pageId ?? "",
      subsections: commonSubs,
    };
  }

  let resolvedPage;
  if (typeof raw.same_as === "string" && raw.same_as.trim() !== "") {
    resolvedPage =
      resourceTypeId != null && resourceTypeId !== ""
        ? _resolveInheritedPageLayout(pageId, resourceTypeId, fieldsByType)
        : null;
  } else {
    resolvedPage = { ...raw };
  }
  const unanchoredSameAs =
    typeof raw.same_as === "string" &&
    raw.same_as.trim() !== "" &&
    (resourceTypeId == null || resourceTypeId === "");

  let subsections;
  if (resolvedPage && Array.isArray(resolvedPage.subsections)) {
    subsections = resolvedPage.subsections;
  } else if (unanchoredSameAs) {
    subsections = [];
  } else if (resolvedPage) {
    subsections = commonSubs;
  } else {
    const { subsections: normSubs } = _normalizeFieldsByTypePage(raw);
    subsections = normSubs != null ? normSubs : commonSubs;
  }

  let navLabel;
  if (resolvedPage) {
    const lab =
      typeof resolvedPage.label === "string" && resolvedPage.label.trim() !== ""
        ? resolvedPage.label
        : undefined;
    navLabel = lab ?? commonPage?.label ?? pageId ?? "";
  } else {
    navLabel = commonPage?.label ?? pageId ?? "";
  }

  const spreadSource = resolvedPage ?? raw;
  const { same_as: _sameAsKey, ...typePageRest } = spreadSource;
  return {
    ...commonPage,
    ...typePageRest,
    subsections,
    label: navLabel,
  };
}

/**
 * Every FormPage row after merging common layout with the type override (`fields_by_type`), in the
 * same order as `formPages`. Includes pages whose merged `subsections` are empty (placeholders).
 * Each item is {@link _resolveMergedFormPageConfig} for that page.
 *
 * @param {Array} formPages - FormPages subsection array from common_fields
 * @param {Object} currentTypePageConfigs - `fields_by_type` slice for the **selected** resource type
 * @param {Object} fieldsByType - Full fields_by_type map (for same_as)
 * @param {string} [resourceTypeId] - Selected resource type id
 * @returns {Array<Object>}
 */
function getResolvedFormPages(formPages, currentTypePageConfigs, fieldsByType, resourceTypeId) {
  return formPages.map((p) =>
    _resolveMergedFormPageConfig(p, currentTypePageConfigs, fieldsByType, resourceTypeId)
  );
}

/**
 * Keep merged pages that have at least one subsection (stepper, sidebar, main column).
 * Pass the array returned by {@link getResolvedFormPages}; do not resolve inside this helper.
 *
 * @param {Array<Object>} resolvedFormPages
 * @returns {Array<Object>}
 */
function filterVisibleFormPages(resolvedFormPages) {
  return (resolvedFormPages ?? []).filter((p) => (p.subsections ?? []).length > 0);
}

/** Dot-path segment that is a non-negative integer array index (Formik/Yup style). */
const ARRAY_INDEX_PATH_SEGMENT = /^\d+$/;

/**
 * Whether any strict prefix of `fieldPath` is touched as `true` in Formik `touched`.
 *
 * @param {Object} touched - Formik `touched`
 * @param {string} fieldPath - Dot-joined path (same as Formik field names)
 * @param {boolean} [ignoreArrayFields=false] - If true, a touched prefix does not count when
 *   the **next** segment toward `fieldPath` is a numeric index (so `metadata.identifiers`
 *   does not imply touch for `metadata.identifiers.0.x`); `files` + `files.enabled` still
 *   works. A touched ancestor **above** the array (e.g. `metadata` only) can still match for
 *   `metadata.creators.0.name`.
 * @returns {boolean}
 */
function getTouchedParent(touched, fieldPath, ignoreArrayFields = false) {
  // Leaf explicitly touched (same as stock’s first iteration when i === length).
  if (getIn(touched, fieldPath) === true) {
    return true;
  }
  const fieldParts = fieldPath.split(".");
  if (fieldParts.length < 2) {
    return false;
  }
  // Any strict prefix path touched as boolean (e.g. `files` for `files.enabled`).
  // The old loop used i === length first, so for two-segment paths it never checked `files` alone.
  for (let i = fieldParts.length - 1; i >= 1; i--) {
    const currentPath = fieldParts.slice(0, i).join(".");
    if (getIn(touched, currentPath) === true) {
      if (ignoreArrayFields && ARRAY_INDEX_PATH_SEGMENT.test(fieldParts[i])) {
        continue;
      }
      return true;
    }
  }
  return false;
}

function getErrorParent(errors, fieldPath) {
  const fieldParts = fieldPath.split(".");
  let errorAncestor = false;

  for (let i = fieldParts.length; i > 1; i--) {
    let currentPath = fieldParts.slice(0, i).join(".");
    if (getIn(errors, currentPath) !== undefined) {
      errorAncestor = true;
      break;
    }
  }
  return errorAncestor;
}


// Compares two objects deeply, ignoring the keys passed in the ignoreKeys array
// Returns true if the objects are deeply equal, false otherwise
// If ignoreKeys is not passed, it compares the objects deeply without ignoring any keys
//
// param obj1(object): first object to compare
// param obj2(object): second object to compare
// param ignoreKeys(array): array of dot-separated key paths to ignore when
// comparing the objects. Array items in the object can be ignored by
// passing the array index as the key path.
// returns(boolean): true if the objects are deeply equal, false otherwise
function areDeeplyEqual(obj1, obj2, ignoreKeys) {

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if ( ignoreKeys.some(ignoreKey => key === ignoreKey?.split(".")[0])) {
      continue;
    }

    if (!keys2.includes(key)) return false;

    if (!areDeeplyEqual(obj1[key], obj2[key], _getSubKeys(key, ignoreKeys))) {
        return false;
    }
  }

  return true;
}

// Given an array of dot-separated key paths, returns new array representing
// the paths below a given key
//
// param key(string): key string or dot-separated key path
// param ignoreKeys(array): array of dot-separated key paths
// returns(array): array of the paths below the given key or path
function _getSubKeys(key, ignoreKeys) {
  return ignoreKeys
    .filter(ignoreKey => ignoreKey.startsWith(key + '.'))
    .map(ignoreKey => ignoreKey.slice(key.length + 1));
}

function isNearViewportBottom(el, offset = 0) {
  const { bottom } = el.getBoundingClientRect();
  return (
    (bottom + offset) >= window.innerHeight
  );
};

/**
 * Make sure first page element is focused when navigating
 *
 * Passed down to FormPage but also called by confirm modal
 *
 * Timeout allows time for the page to render before focusing the first element.
 * On the page that contains the file upload component, the first focusable element
 * is skipped (targetIndex 1) as a workaround for the file uploader's inaccessible first input.
 *
 * @param {string} currentFormPage - The current form page id
 * @param {boolean} recoveryAsked - Whether recovery has been asked (or modal closed)
 * @param {string|null} fileUploadPageId - Page id of the page that contains FileUploadComponent (optional)
 */
const focusFirstElement = (currentFormPage, recoveryAsked = true, fileUploadPageId = null) => {
  // FIXME: timing issue
  setTimeout(() => {
    if (recoveryAsked) {
      // Workaround: file uploader has an inaccessible first input; focus the second focusable on that page.
      const targetIndex =
        fileUploadPageId && currentFormPage === fileUploadPageId ? 1 : 0;
      const idString = `InvenioAppRdm\\.Deposit\\.FormPage\\.${currentFormPage}`;
      const newInputs = document.querySelectorAll(
        `#${idString} button, #${idString} input, #${idString} .selection.dropdown input`
      );
      const newFirstInput = newInputs[targetIndex];
      if (newFirstInput !== undefined) {
        newFirstInput?.focus();
        window.scrollTo(0, 0);
      }
    }
  }, 100);
};

/**
 * Return readable field labels for a list of fields
 *
 * Separates fields into two lists:
 * - One list contains readable field labels for fields without square brackets
 * - The other list contains readable field labels for fields with square brackets,
 *   including just the part of the field path before the square brackets
 *
 * @param {Array} fields - List of fields (dot-separated key paths)
 * @returns {Array} List of two arrays
 */
function getReadableFields(fields) {
  // Separate fields with array indices into a separate list
  const fieldsWithArrays = fields.filter(field => field.includes('['));
  const fieldsWithoutArrays = fields.filter(field => !field.includes('['));

  const fieldsWithArraysStripped = fieldsWithArrays.map(field => field.substring(0, field.indexOf('['))
  );

  console.log("fieldsWithoutArrays", fieldsWithoutArrays);
  console.log("fieldsWithArraysStripped", fieldsWithArraysStripped);
  let readableFields = fieldsWithoutArrays.map(field => readableFieldLabels[field] || field);
  let readableFieldsWithArrays = fieldsWithArraysStripped.map(field => readableFieldLabels[field] || field);
  console.log("readableFieldLabels", readableFieldLabels);
  console.log("readableFields", readableFields);
  console.log("readableFieldsWithArrays", readableFieldsWithArrays);

  return [readableFields, readableFieldsWithArrays];
}

/**
 * Merge two deeply nested objects so that the properties of A take priority.
 *
 * @param {string} arrayStrategy: One of "concat", "dedup", or "override"
 */
function _mergeNestedObjects(objA, objB, arrayStrategy = "concat") {
  // Object.keys(null|undefined) throws; return the other so callers can pass arbitrary types.
  if (objA == null) return objB;
  if (objB == null) return objA;

  let mergedObj = objA;
  if (Array.isArray(objA)) {
    const safeB = Array.isArray(objB) ? objB : [];
    switch (arrayStrategy) {
    case "concat":
      mergedObj = objA.concat(safeB);
      break;
    case "dedup":
      mergedObj = [...new Set([...objA, ...safeB])];
      break;
    case "override":
      break;
    }
  } else if (typeof objA === "object") {
    const aKeys = Object.keys(objA);
    const bKeys = Object.keys(objB);
    const allKeys = aKeys.concat(bKeys);
    for (let i = 0; i < allKeys.length; i++) {
      const focusKey = allKeys[i];
      if (bKeys.includes(focusKey) && aKeys.includes(focusKey)) {
        mergedObj[focusKey] = _mergeNestedObjects(objA[focusKey], objB[focusKey], arrayStrategy);
      } else if (bKeys.includes(focusKey)) {
        mergedObj[focusKey] = objB[focusKey];
      }
    }
  }
  return mergedObj;
}

/**
  * Filter a nested object based on a whitelist of dot-separated paths.
  * Preserves array structure when allowed paths refer to properties inside array elements.
  */
function _filterNestedObject(errors, allowedPaths) {
  const result = {};
  const allowed = new Set(allowedPaths);

  // Build nested structure in target; path may contain numeric segments for array indices.
  function setDeep(target, path, value) {
    const parts = path.split('.');
    let ref = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const isIndex = /^\d+$/.test(part);
      if (isIndex) {
        const num = parseInt(part, 10);
        if (!Array.isArray(ref)) ref = [];
        while (ref.length <= num) ref.push(undefined);
        if (ref[num] === undefined || typeof ref[num] !== 'object') ref[num] = {};
        ref = ref[num];
      } else {
        const nextPart = parts[i + 1];
        const nextIsIndex = /^\d+$/.test(nextPart);
        if (nextIsIndex) {
          if (!Array.isArray(ref[part])) ref[part] = [];
          ref = ref[part];
        } else {
          if (!ref[part] || typeof ref[part] !== 'object') ref[part] = {};
          ref = ref[part];
        }
      }
    }
    ref[parts[parts.length - 1]] = value;
  }

  // pathWithIndex: includes array indices for writing to result; pathWithoutIndex: for allowed check.
  function walk(obj, pathWithIndex, pathWithoutIndex) {
    if (obj === null || typeof obj !== 'object') return;

    const prefixWith = pathWithIndex;
    const prefixWithout = pathWithoutIndex;

    if (allowed.has(prefixWithout)) {
      setDeep(result, prefixWith, obj);
      return;
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const nextWith = prefixWith ? `${prefixWith}.${i}` : String(i);
        walk(obj[i], nextWith, prefixWithout);
      }
      return;
    }

    for (const key in obj) {
      const pathWith = prefixWith ? `${prefixWith}.${key}` : key;
      const pathWithout = prefixWithout ? `${prefixWithout}.${key}` : key;
      const value = obj[key];

      if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
        walk(value, pathWith, pathWithout);
      } else {
        if (allowed.has(pathWithout)) {
          setDeep(result, pathWith, value);
        }
      }
    }
  }

  walk(errors, '', '');
  return result;
}

/**
 * Whether an error path matches a section field path (exact, or one is a prefix of the other).
 */
function fieldMatches(errorPath, fieldPath) {
  return (
    errorPath === fieldPath ||
    errorPath.startsWith(fieldPath + ".") ||
    fieldPath.startsWith(errorPath + ".")
  );
}

/**
 * DOM id for a form section container. Uses hyphens only (no dots), safe for
 * getElementById, scroll targets, and CSS. Not the same as Overridable ids.
 * @param {string} sectionId - Section id from form config (e.g. "resource_type")
 * @returns {string|null}
 */
function getFormSectionElementId(sectionId) {
  return sectionId ? `deposit-form-section-${sectionId}` : null;
}

/**
 * Dot-paths for Formik leaf values under `rootPath` for the given subtree `value`
 * (`get(values, rootPath)` / `getIn(values, rootPath)`).
 * Used to call `setFieldTouched` on descendants when a page-level root is touched but
 * widgets key off leaf `meta.touched` (e.g. array rows). Arrays recurse by index; plain
 * objects recurse by key; primitives return `[rootPath]`. Empty arrays/objects and
 * null/undefined yield no paths (parent touch is enough).
 *
 * @param {string} rootPath - Formik path (no trailing dot)
 * @param {*} value - Value at rootPath
 * @returns {string[]}
 */
function collectLeafFieldPathsUnderRoot(rootPath, value) {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }
    return value.flatMap((item, i) =>
      collectLeafFieldPathsUnderRoot(`${rootPath}.${i}`, item)
    );
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return [];
    }
    return keys.flatMap((k) =>
      collectLeafFieldPathsUnderRoot(`${rootPath}.${k}`, value[k])
    );
  }
  return [rootPath];
}

export {
  _filterNestedObject,
  _mergeNestedObjects,
  _mergeSameAsLayout,
  _pushToArrayEnd,
  _resolveMergedFormPageConfig,
  _scrollTop,
  areDeeplyEqual,
  collectLeafFieldPathsUnderRoot,
  fieldMatches,
  filterVisibleFormPages,
  findPageIdContainingComponent,
  flattenKeysDotJoined,
  flattenWrappers,
  focusFirstElement,
  getErrorParent,
  getFormSectionElementId,
  getReadableFields,
  getResolvedFormPages,
  getTouchedParent,
  isNearViewportBottom,
  moveToArrayStart,
};
