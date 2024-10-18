import { func } from "prop-types";
import { getIn } from "formik";

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

export {
  areDeeplyEqual,
  getTouchedParent,
  isNearViewportBottom,
  scrollTop,
  moveToArrayStart,
  pushToArrayEnd,
  flattenKeysDotJoined,
  flattenWrappers,
};
