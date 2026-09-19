// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { Container, Grid } from "semantic-ui-react";
import { useFormUIState } from "../FormUIStateManager.jsx";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/** Fallback when the sticky stack has not measured yet (matches historical 80px spacer). */
const DEFAULT_STICKY_FOOTER_HEIGHT_PX = 80;

/**
 * Form footer region. Renders an optional observation-target child, then a
 * sticky stack whose content comes from config-driven subsections (typically
 * spacers + StickyFooter with notices and nav).
 *
 * When the bar is `fixed` it leaves document flow; a matching in-flow spacer
 * keeps page height stable so the sentinel does not jump. Spacer height tracks
 * the sticky stack via ResizeObserver (notices may appear/disappear). The same
 * measured height is published to FormUIStateManager so the page-target
 * IntersectionObserver bottom `rootMargin` stays in sync with the stack.
 */
const FormFooterRegion = ({ subsections = [], children, ...props }) => {
  const { pageTargetInViewport, setStickyFooterHeightPx } = useFormUIState();
  const stickyStackRef = useRef(null);
  const [stickyHeightPx, setStickyHeightPx] = useState(DEFAULT_STICKY_FOOTER_HEIGHT_PX);
  const isFixed = !pageTargetInViewport;
  const stickyClass = isFixed ? "sticky-footer-fixed" : "sticky-footer-static";
  const hasSubsections = subsections?.length > 0;

  useLayoutEffect(() => {
    const node = stickyStackRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const publishHeight = (height) => {
      const next = height > 0 ? height : DEFAULT_STICKY_FOOTER_HEIGHT_PX;
      setStickyHeightPx(next);
      setStickyFooterHeightPx?.(next);
    };
    const observer = new ResizeObserver(([entry]) => {
      publishHeight(Math.ceil(entry.contentRect.height));
    });
    observer.observe(node);
    publishHeight(Math.ceil(node.getBoundingClientRect().height));
    return () => {
      observer.disconnect();
      setStickyFooterHeightPx?.(DEFAULT_STICKY_FOOTER_HEIGHT_PX);
    };
  }, [setStickyFooterHeightPx]);

  if (!hasSubsections && !children) return null;

  return (
    <Overridable
      id="InvenioModularDepositForm.footerRegion.container"
      subsections={subsections}
      {...props}
    >
      <div
        className={`form-footer-region row p-0 ml-0 mr-0 ${props?.classnames ? props.classnames : ""}`}
        id="rdm-deposit-form-footer"
      >
        {children}
        {isFixed && (
          <div
            className="sticky-footer-flow-spacer"
            aria-hidden="true"
            style={{ height: stickyHeightPx }}
          />
        )}
        <div
          ref={stickyStackRef}
          className={`sticky-footer-stack ${stickyClass} mt-0 mb-0 p-0 ml-0 mr-0`}
        >
          {hasSubsections && (
            <Grid as={Container} className="sticky-footer-nav mt-0 mb-0">
              <SubsectionsRenderer subsections={subsections} />
            </Grid>
          )}
        </div>
      </div>
    </Overridable>
  );
};

FormFooterRegion.propTypes = {
  subsections: PropTypes.array,
  children: PropTypes.node,
};

export { FormFooterRegion };
