// This file is part of Invenio-Modular-Deposit-Form
// Copyright (C) 2026 MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it
// and/or modify it under the terms of the MIT License; see LICENSE file
// for more details.

/**
 * Measured-height expand/collapse helpers.
 *
 * Line-clamp / max-height / `display` toggles cannot interpolate cleanly, so
 * callers measure start and end pixel heights and tween `style.height`.
 * Higher-level {@link animateOpen} / {@link animateClosed} wrap measurement +
 * scheduling (including `prefers-reduced-motion`).
 */

export const DEFAULT_HEIGHT_TRANSITION_MS = 120;

/**
 * Whether the user has requested reduced motion at the OS/browser level.
 *
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Clear inline styles applied by {@link animateElementHeight}.
 *
 * @param {HTMLElement} el
 */
export function clearHeightAnimationStyles(el) {
  el.style.height = "";
  el.style.overflow = "";
  el.style.transition = "";
}

/**
 * Animate an element's height between two measured pixel values.
 *
 * @param {HTMLElement} el
 * @param {number} fromPx
 * @param {number} toPx
 * @param {object} [options]
 * @param {number} [options.durationMs]
 * @param {() => void} [options.onComplete]
 * @returns {() => void} Cancel function (clears listeners/timers/styles; does not call onComplete).
 */
export function animateElementHeight(el, fromPx, toPx, options = {}) {
  const { durationMs = DEFAULT_HEIGHT_TRANSITION_MS, onComplete } = options;

  el.style.overflow = "hidden";
  el.style.transition = "none";
  el.style.height = `${fromPx}px`;
  // Force reflow so the browser commits the start height before transitioning.
  void el.offsetHeight;
  el.style.transition = `height ${durationMs}ms ease`;
  el.style.height = `${toPx}px`;

  let finished = false;
  const finish = (callComplete) => {
    if (finished) {
      return;
    }
    finished = true;
    el.removeEventListener("transitionend", onTransitionEnd);
    window.clearTimeout(fallbackTimer);
    clearHeightAnimationStyles(el);
    if (callComplete && onComplete) {
      onComplete();
    }
  };

  const onTransitionEnd = (event) => {
    if (event.target !== el || event.propertyName !== "height") {
      return;
    }
    finish(true);
  };

  const fallbackTimer = window.setTimeout(() => finish(true), durationMs + 50);
  el.addEventListener("transitionend", onTransitionEnd);

  return () => finish(false);
}

/**
 * Temporarily remove a class, measure `scrollHeight`, then restore the class.
 *
 * Useful for expand: measure full content height while still visually clamped.
 *
 * @param {HTMLElement} el
 * @param {string} className
 * @returns {number}
 */
export function measureScrollHeightWithoutClass(el, className) {
  const hadClass = el.classList.contains(className);
  el.classList.remove(className);
  const height = el.scrollHeight;
  if (hadClass) {
    el.classList.add(className);
  }
  return height;
}

/**
 * Temporarily add a class, measure `scrollHeight`, then restore prior class state.
 *
 * Useful for accordion open: measure full open height (e.g. with `.active`
 * padding) while the panel is still visually collapsed.
 *
 * @param {HTMLElement} el
 * @param {string} className
 * @returns {number}
 */
export function measureScrollHeightWithClass(el, className) {
  const hadClass = el.classList.contains(className);
  el.classList.add(className);
  const height = el.scrollHeight;
  if (!hadClass) {
    el.classList.remove(className);
  }
  return height;
}

/**
 * Temporarily add a class, measure bounding height, then restore prior class state.
 *
 * Useful for collapse: measure the clamped target height while still expanded.
 *
 * @param {HTMLElement} el
 * @param {string} className
 * @returns {number}
 */
export function measureClientHeightWithClass(el, className) {
  const hadClass = el.classList.contains(className);
  el.classList.add(className);
  const height = el.getBoundingClientRect().height;
  if (!hadClass) {
    el.classList.remove(className);
  }
  return height;
}

/**
 * Result of {@link animateOpen} / {@link animateClosed}.
 *
 * - `animated` — height tween was scheduled
 * - `instant` — reduced motion; caller should flip open state with no tween
 * - `skipped` — no element; caller should no-op
 *
 * @typedef {'animated' | 'instant' | 'skipped'} HeightAnimationResult
 */

/**
 * Measure and schedule a measured-height open (current height → full content).
 *
 * @param {HTMLElement | null | undefined} el
 * @param {(fromPx: number, toPx: number) => void} scheduleHeightAnimation
 * @param {object} [options]
 * @param {string} [options.removeClass] Temporarily remove before measuring end
 *   height (clamp expand).
 * @param {string} [options.addClass] Temporarily add before measuring end height
 *   (e.g. lift a CSS `height: 0` rule).
 * @param {HTMLElement} [options.measureElement] Measure this element's border-box
 *   height as `toPx` instead of `el.scrollHeight` (use when `el` is CSS-clamped
 *   to 0 and its `scrollHeight` reads as 0, but an inner child still has natural
 *   layout height).
 * @returns {HeightAnimationResult}
 */
export function animateOpen(el, scheduleHeightAnimation, options = {}) {
  const { removeClass, addClass, measureElement } = options;
  if (!el) {
    return "skipped";
  }
  if (prefersReducedMotion()) {
    return "instant";
  }

  const fromPx = el.getBoundingClientRect().height;
  let toPx = el.scrollHeight;
  if (removeClass) {
    toPx = measureScrollHeightWithoutClass(el, removeClass);
  } else if (addClass) {
    toPx = measureScrollHeightWithClass(el, addClass);
  } else if (measureElement) {
    toPx = measureElement.getBoundingClientRect().height;
  }
  scheduleHeightAnimation(fromPx, toPx);
  return "animated";
}

/**
 * Measure and schedule a measured-height close (current height → target).
 *
 * @param {HTMLElement | null | undefined} el
 * @param {(fromPx: number, toPx: number) => void} scheduleHeightAnimation
 * @param {object} [options]
 * @param {string} [options.addClass] Temporarily add before measuring end height
 *   (clamp collapse).
 * @param {number} [options.toPx=0] End height when `addClass` is omitted
 *   (accordion collapse).
 * @returns {HeightAnimationResult}
 */
export function animateClosed(el, scheduleHeightAnimation, options = {}) {
  const { addClass, toPx = 0 } = options;
  if (!el) {
    return "skipped";
  }
  if (prefersReducedMotion()) {
    return "instant";
  }

  const fromPx = el.getBoundingClientRect().height;
  const endPx = addClass ? measureClientHeightWithClass(el, addClass) : toPx;
  scheduleHeightAnimation(fromPx, endPx);
  return "animated";
}
