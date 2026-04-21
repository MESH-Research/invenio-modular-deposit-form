// Focus helpers for the local ArrayField fork's onAfterAdd / onAfterRemove
// callbacks. Plain-input rows can't always be focused immediately after a
// Formik push/remove because React hasn't flushed the new DOM yet, so each
// helper retries across a small number of animation frames.
//
// `focusFieldByPath` works for both replacement TextField rows (which set
// id={fieldPath} on the input) and replacement SelectField rows (which only
// set name={fieldPath} on a hidden input inside a Semantic UI dropdown
// wrapper); we fall back from id-lookup to name-lookup, and if the matched
// node is the hidden input we walk up to the dropdown wrapper / its inner
// search input.

const FOCUS_ATTEMPTS_MAX = 5;

function findFocusTarget(path) {
  let el = document.getElementById(path);
  if (el) return el;
  el = document.querySelector(`[name="${path.replace(/"/g, '\\"')}"]`);
  if (!el) return null;
  if (el.type === "hidden") {
    const wrapper = el.closest(".dropdown");
    return wrapper?.querySelector("input.search") || wrapper || null;
  }
  return el;
}

function tryFocusWithRetry(getEl, maxAttempts = FOCUS_ATTEMPTS_MAX) {
  let attempts = 0;
  const attempt = () => {
    const el = getEl();
    if (el && typeof el.focus === "function") {
      el.focus();
      return;
    }
    if (++attempts < maxAttempts) {
      requestAnimationFrame(attempt);
    }
  };
  requestAnimationFrame(attempt);
}

/** Focus the form control at `path` once it appears in the DOM. */
export function focusFieldByPath(path) {
  tryFocusWithRetry(() => findFocusTarget(path));
}

/** Focus the ArrayField add-button referenced by `ref` once it's mounted. */
export function focusAddButton(ref) {
  tryFocusWithRetry(() => ref?.current ?? null);
}
