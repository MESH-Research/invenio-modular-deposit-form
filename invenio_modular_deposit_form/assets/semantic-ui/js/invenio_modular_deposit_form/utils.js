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
 *
 * @param {string} currentFormPage - The current form page
 * @param {boolean} recoveryAskedFlag - Whether the recovery modal is open
 */
const focusFirstElement = (currentFormPage, recoveryAskedFlag = false, recoveryAsked = true) => {
  // FIXME: timing issue
  setTimeout(() => {
    // NOTE: recoveryAsked is true by default if no recovery data present
    if (recoveryAsked || recoveryAskedFlag) {
      // FIXME: workaround since file uploader has inaccessible first input
      const targetIndex = currentFormPage === "page-6" ? 1 : 0;
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

export {
  areDeeplyEqual,
  focusFirstElement,
  getErrorParent,
  getReadableFields,
  getTouchedParent,
  isNearViewportBottom,
  scrollTop,
  moveToArrayStart,
  pushToArrayEnd,
  flattenKeysDotJoined,
  flattenWrappers,
};
