// Focus helpers for the local ArrayField fork's onAfterAdd / onAfterRemove
// callbacks. Plain-input rows can't always be focused immediately after a
// Formik push/remove because React hasn't flushed the new DOM yet, so each
// helper retries across a small number of animation frames.
//
// `focusFieldByPath` works for replacement TextField rows (id on the input) and
// SelectField rows (id/name on the SUI dropdown root). Search dropdowns put
// tabIndex on `input.search`, not the root, so when the lookup hits a
// `.dropdown` we focus that search input instead.

const FOCUS_ATTEMPTS_MAX = 5;

function findFocusTarget(path) {
  let el = document.getElementById(path);
  if (!el) {
    el = document.querySelector(`[name="${path.replace(/"/g, '\\"')}"]`);
  }
  if (!el) return null;

  const dropdown = el.classList?.contains("dropdown") ? el : el.closest?.(".dropdown");
  if (dropdown) {
    return dropdown.querySelector("input.search") || dropdown;
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

/**
 * Focus the ArrayField add button for `fieldPath`.
 * Uses `id={`${fieldPath}.add-button`}` set by the local ArrayField fork —
 * `Form.Button` does not forward refs to the DOM `<button>`.
 */
export function focusAddButton(fieldPath) {
  tryFocusWithRetry(() => document.getElementById(`${fieldPath}.add-button`));
}
