// This file is part of Invenio-Modular-Deposit-Form
// Copyright (C) 2026 MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it
// and/or modify it under the terms of the MIT License; see LICENSE file
// for more details.

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  animateClosed,
  animateElementHeight,
  animateOpen,
  DEFAULT_HEIGHT_TRANSITION_MS,
  prefersReducedMotion,
} from "./animateElementHeight";

/**
 * Resolve the CSS clamp class from measure options (expand removes it; collapse
 * re-adds it).
 *
 * @param {object} options
 * @returns {string | null}
 */
function clampClassFromOptions(options) {
  return (
    options.openMeasure?.removeClass || options.closeMeasure?.addClass || null
  );
}

/**
 * React wrapper around {@link animateElementHeight}: schedule a measured-height
 * tween to run in `useLayoutEffect` after the next render (so className / open
 * state updates apply before paint), and track `isAnimating`.
 *
 * Also returns shared {@link expand} / {@link collapse} handlers that guard on
 * open/`isAnimating`, call {@link animateOpen} / {@link animateClosed}, and
 * invoke `onOpen` / `onClose` unless the result is `"skipped"`.
 *
 * When `clampEnabled` is true, observes whether the clamped element overflows
 * (sticky while open / animating) and exposes `isOverflowing` + `showClampClass`.
 *
 * @param {React.RefObject<HTMLElement | null>} elementRef
 * @param {object} [options]
 * @param {number} [options.durationMs]
 * @param {boolean} [options.open] Current open state (for expand/collapse guards).
 * @param {() => void} [options.onOpen] Called when expand proceeds (not skipped).
 * @param {() => void} [options.onClose] Called when collapse proceeds (not skipped).
 * @param {Parameters<typeof animateOpen>[2]} [options.openMeasure]
 *   Options forwarded to {@link animateOpen}.
 * @param {Parameters<typeof animateClosed>[2]} [options.closeMeasure]
 *   Options forwarded to {@link animateClosed}.
 * @param {boolean} [options.clampEnabled] When true, measure clamp overflow via
 *   `ResizeObserver`. Clamp class is taken from
 *   `openMeasure.removeClass` / `closeMeasure.addClass`.
 * @param {unknown | unknown[]} [options.contentKey] Remount the overflow
 *   observer when content changes (string/html, content prop, or an array of
 *   deps).
 * @returns {{
 *   isAnimating: boolean,
 *   scheduleHeightAnimation: (fromPx: number, toPx: number) => void,
 *   prefersReducedMotion: () => boolean,
 *   expand: (event?: { preventDefault?: () => void }) => void,
 *   collapse: () => void,
 *   isOverflowing: boolean,
 *   showClampClass: boolean,
 * }}
 */
export function useMeasuredHeightAnimation(elementRef, options = {}) {
  const {
    durationMs = DEFAULT_HEIGHT_TRANSITION_MS,
    open = false,
    clampEnabled = false,
    contentKey,
  } = options;
  const clampClass = clampClassFromOptions(options);
  const contentKeys = Array.isArray(contentKey) ? contentKey : [contentKey];

  const [isAnimating, setIsAnimating] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [animationRequestId, setAnimationRequestId] = useState(0);
  /** @type {React.MutableRefObject<{ fromPx: number, toPx: number } | null>} */
  const pendingRef = useRef(null);
  const cancelRef = useRef(null);
  // Keep expand/collapse deps narrow; read latest open/callbacks/measure opts.
  const toggleOptionsRef = useRef(options);
  toggleOptionsRef.current = options;

  const cancelInFlight = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
  }, []);

  const scheduleHeightAnimation = useCallback((fromPx, toPx) => {
    pendingRef.current = { fromPx, toPx };
    setIsAnimating(true);
    setAnimationRequestId((id) => id + 1);
  }, []);

  useLayoutEffect(() => {
    const pending = pendingRef.current;
    const el = elementRef.current;
    if (!pending || !el) {
      return undefined;
    }
    pendingRef.current = null;
    cancelInFlight();
    cancelRef.current = animateElementHeight(el, pending.fromPx, pending.toPx, {
      durationMs,
      onComplete: () => {
        cancelRef.current = null;
        setIsAnimating(false);
      },
    });
    return undefined;
  }, [animationRequestId, cancelInFlight, durationMs, elementRef]);

  useLayoutEffect(() => {
    return () => {
      cancelInFlight();
    };
  }, [cancelInFlight]);

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || !clampEnabled || !clampClass) {
      setIsOverflowing(false);
      return undefined;
    }

    const measure = () => {
      // Overflow is only detectable while clamped; keep sticky value when
      // expanded or mid-animation.
      if (open || isAnimating || !el.classList.contains(clampClass)) {
        return;
      }
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
    // contentKeys identity is caller-controlled (stable props / primitives).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clampEnabled,
    clampClass,
    open,
    isAnimating,
    elementRef,
    ...contentKeys,
  ]);

  const expand = useCallback(
    (event) => {
      if (typeof event?.preventDefault === "function") {
        event.preventDefault();
      }
      const { open: isOpen, onOpen, openMeasure } = toggleOptionsRef.current;
      const el = elementRef.current;
      if (!el || isOpen || isAnimating) {
        return;
      }
      const result = animateOpen(el, scheduleHeightAnimation, openMeasure);
      if (result !== "skipped" && onOpen) {
        onOpen();
      }
    },
    [elementRef, isAnimating, scheduleHeightAnimation]
  );

  const collapse = useCallback(() => {
    const { open: isOpen, onClose, closeMeasure } = toggleOptionsRef.current;
    const el = elementRef.current;
    if (!el || !isOpen || isAnimating) {
      return;
    }
    const result = animateClosed(el, scheduleHeightAnimation, closeMeasure);
    if (result !== "skipped" && onClose) {
      onClose();
    }
  }, [elementRef, isAnimating, scheduleHeightAnimation]);

  const showClampClass = Boolean(clampEnabled && !open && !isAnimating);

  return {
    isAnimating,
    scheduleHeightAnimation,
    prefersReducedMotion,
    expand,
    collapse,
    isOverflowing,
    showClampClass,
  };
}
