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
  for ( const target of moveTargets ) {
    const index = newArray.findIndex((item) => item[keyLabel] === target);
    newArray.unshift(...newArray.splice(index, 1));
  }
  return newArray;
}

function pushToArrayEnd(startingArray, targetValue, keyLabel) {
  let newArray = [...startingArray];
  newArray.push(...newArray.splice(newArray.findIndex((item) => item[keyLabel]===targetValue), 1));
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

export { scrollTop, moveToArrayStart, pushToArrayEnd, flattenKeysDotJoined };