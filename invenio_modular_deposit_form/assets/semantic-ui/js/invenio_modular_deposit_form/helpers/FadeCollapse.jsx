// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2026 MESH Research
//
// Invenio Modular Deposit Form is free software; you can redistribute it
// and/or modify it under the terms of the MIT License; see LICENSE file
// for more details.

import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";

/**
 * Keeps children mounted through an exit animation, then unmounts.
 *
 * When `visible` becomes false: applies `--hiding`, waits `durationMs`, then
 * unmounts children and calls `onExited`. Parent owns when `visible` flips;
 * this component owns exit CSS + delayed unmount.
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {number} [props.durationMs=400]
 * @param {Function} [props.onExited]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
const FadeCollapse = ({
  visible,
  durationMs = 400,
  onExited,
  children,
  className,
}) => {
  const [mounted, setMounted] = useState(visible);
  const [hiding, setHiding] = useState(false);
  const mountedRef = useRef(visible);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useEffect(() => {
    if (visible) {
      mountedRef.current = true;
      setMounted(true);
      setHiding(false);
      return undefined;
    }

    // Never shown (or already fully exited) — nothing to animate.
    if (!mountedRef.current) {
      return undefined;
    }

    setHiding(true);
    const timer = setTimeout(() => {
      mountedRef.current = false;
      setMounted(false);
      setHiding(false);
      onExitedRef.current?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [visible, durationMs]);

  if (!mounted) {
    return null;
  }

  const rootClass = ["fade-collapse", hiding && "fade-collapse--hiding", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} style={{ transitionDuration: `${durationMs}ms` }}>
      <div className="fade-collapse__inner">{children}</div>
    </div>
  );
};

FadeCollapse.propTypes = {
  visible: PropTypes.bool.isRequired,
  durationMs: PropTypes.number,
  onExited: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export { FadeCollapse };
