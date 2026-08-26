// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2026 MESH Research
//
// Invenio Modular Deposit Form is free software; you can redistribute it
// and/or modify it under the terms of the MIT License; see LICENSE file
// for more details.

import PropTypes from "prop-types";
import React, { useCallback, useRef, useState } from "react";
import { FadeCollapse } from "./FadeCollapse";

/**
 * Manages a list of fade-collapsing items: push hides prior visible items,
 * dismiss flips `visible`, onExited removes from the array.
 *
 * Items with `meta.loading` are removed immediately (no exit animation) when
 * replaced by a new push or when dismissed.
 *
 * @param {object} [options]
 * @param {number} [options.durationMs=400]
 * @returns {{
 *   items: Array<object>,
 *   push: (entry: { props: object, autoHideMs?: number|null, meta?: object }) => number,
 *   dismiss: (predicate?: (item: object) => boolean) => void,
 *   handleExited: (id: number) => void,
 *   durationMs: number,
 * }}
 */
function useFadeCollapseStack({ durationMs = 400 } = {}) {
  const [items, setItems] = useState([]);
  const nextIdRef = useRef(0);
  const autoHideTimersRef = useRef(new Map());

  const clearAutoHide = useCallback((id) => {
    const timer = autoHideTimersRef.current.get(id);
    if (timer != null) {
      clearTimeout(timer);
      autoHideTimersRef.current.delete(id);
    }
  }, []);

  const handleExited = useCallback(
    (id) => {
      clearAutoHide(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [clearAutoHide]
  );

  const dismiss = useCallback(
    (predicate = () => true) => {
      setItems((prev) =>
        prev.flatMap((item) => {
          if (!item.visible || !predicate(item)) {
            return [item];
          }
          clearAutoHide(item.id);
          // Loading toasts drop immediately; others fade out.
          if (item.meta?.loading) {
            return [];
          }
          return [{ ...item, visible: false }];
        })
      );
    },
    [clearAutoHide]
  );

  /**
   * Hide all currently visible items and append a new visible one.
   * Prior loading items are removed immediately (no fade).
   *
   * @param {{ props: object, autoHideMs?: number|null, meta?: object }} entry
   * @returns {number} New item id
   */
  const push = useCallback(
    (entry) => {
      const id = ++nextIdRef.current;
      const autoHideMs = entry.autoHideMs ?? null;

      setItems((prev) => [
        ...prev.flatMap((item) => {
          if (!item.visible) {
            return [item];
          }
          clearAutoHide(item.id);
          if (item.meta?.loading) {
            return [];
          }
          return [{ ...item, visible: false }];
        }),
        {
          id,
          visible: true,
          props: entry.props ?? {},
          meta: entry.meta ?? {},
        },
      ]);

      if (autoHideMs != null && autoHideMs > 0) {
        const timer = setTimeout(() => {
          autoHideTimersRef.current.delete(id);
          setItems((prev) =>
            prev.map((item) =>
              item.id === id && item.visible ? { ...item, visible: false } : item
            )
          );
        }, autoHideMs);
        autoHideTimersRef.current.set(id, timer);
      }

      return id;
    },
    [clearAutoHide]
  );

  return { items, push, dismiss, handleExited, durationMs };
}

/**
 * Renders stack items with `component`, each wrapped in {@link FadeCollapse}.
 *
 * @param {object} props
 * @param {Array<object>} props.items - From {@link useFadeCollapseStack}
 * @param {Function} props.onExited - `handleExited` from the hook
 * @param {React.ElementType} props.component - Item component (receives each item's `props`)
 * @param {number} [props.durationMs=400]
 * @param {string} [props.className] - Extra class on each FadeCollapse root
 * @param {object} [props.sharedProps] - Merged into every item (e.g. hideMessageIcon)
 */
const FadeCollapseStack = ({
  items,
  onExited,
  component: ItemComponent,
  durationMs = 400,
  className,
  sharedProps,
}) => {
  if (!items.length) {
    return null;
  }

  return (
    <>
      {items.map((item) => (
        <FadeCollapse
          key={item.id}
          visible={item.visible}
          durationMs={durationMs}
          onExited={() => onExited(item.id)}
          className={className}
        >
          <ItemComponent {...sharedProps} {...item.props} />
        </FadeCollapse>
      ))}
    </>
  );
};

FadeCollapseStack.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      visible: PropTypes.bool.isRequired,
      props: PropTypes.object.isRequired,
      meta: PropTypes.object,
    })
  ).isRequired,
  onExited: PropTypes.func.isRequired,
  component: PropTypes.elementType.isRequired,
  durationMs: PropTypes.number,
  className: PropTypes.string,
  sharedProps: PropTypes.object,
};

export { FadeCollapseStack, useFadeCollapseStack };
