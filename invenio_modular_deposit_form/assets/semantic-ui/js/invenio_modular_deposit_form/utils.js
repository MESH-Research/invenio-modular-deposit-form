// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { func } from "prop-types";
import { getIn } from "formik";
import { readableFieldLabels } from "./readableFieldLabels";

/**
 * Scroll page to top
 */
function scrollTop() {
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

function pushToArrayEnd(startingArray, targetValue, keyLabel) {
  let newArray = [...startingArray];
  newArray.push(
    ...newArray.splice(
      newArray.findIndex((item) => item[keyLabel] === targetValue),
      1
    )
  );
  return newArray;
}

function flattenKeysDotJoined(val) {
  const keysArray = Object.keys(val);
  let newArray = [];
  for (let i = 0; i < keysArray.length; i++) {
    const myValue = val[keysArray[i]];
    if (
      typeof myValue === "object" &&
      !Array.isArray(myValue) &&
      myValue !== null
    ) {
      const childKeys = flattenKeysDotJoined(val[keysArray[i]]).map(
        (k) => `${keysArray[i]}.${k}`
      );
      newArray = newArray.concat(childKeys);
    } else {
      newArray.push(keysArray[i]);
    }
  }
  return newArray;
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
 * @returns {string|null} Page id (e.g. "page-6"), or null if not found
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

function getTouchedParent(touched, fieldPath) {
  const fieldParts = fieldPath.split(".");
  let touchedAncestor = false;

  for (let i = fieldParts.length; i > 1; i--) {
    let currentPath = fieldParts.slice(0, i).join(".");
    if (getIn(touched, currentPath) === true) {
      touchedAncestor = true;
      break;
    }
  }
  return touchedAncestor;
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

    if (!areDeeplyEqual(obj1[key], obj2[key], getSubKeys(key, ignoreKeys))) {
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
function getSubKeys(key, ignoreKeys) {
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
function mergeNestedObjects(objA, objB, arrayStrategy="concat") {
  let mergedObj = objA;
  if ( Array.isArray(objA) ) {
    switch ( arrayStrategy ) {
    case "concat":
       mergedObj = objA.concat(objB); 
       break;
    case "dedup":
      mergedObj = [...new Set([...objA, ...objB])];
      break;
    case "override":
        break;
    }
  } else if ( typeof objA === "object" ) {
    const aKeys = Object.keys(objA);
    const bKeys = Object.keys(objB);
    const allKeys = aKeys.concat(bKeys);
    for (let i=0; i<allKeys.length; i++) {
      const focusKey = allKeys[i];
      if ( bKeys.includes(focusKey) && aKeys.includes(focusKey) ) {
        mergedObj[focusKey] = mergeNestedObjects(objA[focusKey], objB[focusKey], arrayStrategy);
      } 
      else if ( bKeys.includes(focusKey) ) {
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
function filterNestedObject(errors, allowedPaths) {
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

export {
  areDeeplyEqual,
  findPageIdContainingComponent,
  filterNestedObject,
  flattenKeysDotJoined,
  flattenWrappers,
  focusFirstElement,
  getErrorParent,
  getReadableFields,
  getTouchedParent,
  isNearViewportBottom,
  mergeNestedObjects,
  moveToArrayStart,
  pushToArrayEnd,
  scrollTop,
};
