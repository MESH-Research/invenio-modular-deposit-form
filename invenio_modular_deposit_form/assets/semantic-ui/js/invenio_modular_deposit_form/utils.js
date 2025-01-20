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

// Given an array of objects, moves the items with a given key value to the start
//
// The moved elements will remain in the same order as they were in the
// moveTargets array.
//
// Note: This function creates a new array and does not modify the original array.
//
// param startingArray(array): array of objects to reorder elements
// param moveTargets(array): array of target values to move to the start of the array
// param keyLabel(string): key to use to find the target values in the array
// returns(array): new array with the target values moved to the start
function moveToArrayStart(startingArray, moveTargets, keyLabel) {
  let newArray = [...startingArray];
  for (const target of moveTargets.slice().reverse()) {
    // Process targets in reverse order to avoid index shifting issues
    // And ensure that the moveTargets are processed end up in the order
    // they were passed in
    const index = newArray.findIndex((item) => item[keyLabel] === target[keyLabel]);
    if (index !== -1) {
      newArray.unshift(...newArray.splice(index, 1));
    }
  }
  return newArray;
}

// Given an array of objects and a target value, pushes the elements with the
// target values to the end of the array
//
// The moved elements will remain in the same order as they were in the
// targetValues array.
//
// Note: This function creates a new array and does not modify the original array.
//
// param startingArray(array): array to move elements from
// param targetValue(array): values to move to the end of the array
// param keyLabel(string): key to use to find the target value in the array
// returns(array): new array with the target value moved to the end
function pushToArrayEnd(startingArray, targetValues, keyLabel) {
  let newArray = [...startingArray];
  for (const target of targetValues) {
    newArray.push(
      ...newArray.splice(
        newArray.findIndex((item) => item[keyLabel] === target[keyLabel]),
        1
      )
    );
  }
  return newArray;
}

// Given an object, returns an array of dot-separated key paths
//
// The results represent the deepest leaves of each branch of the object's tree,
// traversed in left-depth-first order.
//
// Note: This function creates a new array and does not modify the original array.
//
// param val(object): object to flatten
// returns(array): array of dot-separated key paths
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

// Given a formik touched object and a field path, returns the true if the
// field or any of its ancestors is touched, false otherwise
//
// param touched(object): formik touched object
// param fieldPath(string): dot-separated field path
// returns(boolean): true if the field or any of its ancestors is touched, false otherwise
function getTouchedParent(touched, fieldPath) {
  const fieldParts = fieldPath.split(".");
  let touchedAncestor = false;

  for (let i = fieldParts.length; i > 1; i--) {
    let currentPath = fieldParts.slice(0, i).join(".");
    if (getIn(touched, currentPath) === true) {
      touchedAncestor = currentPath;
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
function areDeeplyEqual(obj1, obj2, ignoreKeys=[]) {

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