// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// based on portions of InvenioRDM
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2025 Graz University of Technology.
//
// Invenio Modular Deposit Form and Invenio App RDM are free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import _isEmpty from "lodash/isEmpty";
import React, { useContext } from "react";
import { Button, Label } from "semantic-ui-react";
import PropTypes from "prop-types";
import { FormUIStateContext } from "../../FormLayoutContainer";
import { getSeverityLabel } from "../../helpers/severityChecksConfig";
import { fieldMatches, getFormSectionElementId, getAllErrPaths, getSeverityAtPath } from "../../utils";
import { getSeverityBadgeType } from "../../helpers/severityChecksConfig";


/**
 * sectionsConfig from buildFormSections can have multiple entries per (pageId, sectionId)
 * when resource types define different fields for that section (merge only when fieldsEqual).
 * Dedupe by (pageId, sectionId), pick the entry for currentResourceType when multiple exist,
 * add counts of matching error paths by severity, return sections with total count > 0 in config order.
 */
function getErrorSections(errors, sectionsConfig, currentResourceType) {
  const config = Array.isArray(sectionsConfig) ? sectionsConfig : [];
  const paths = getAllErrPaths(errors);

  const keyOrder = [];
  const byKey = new Map();
  for (const entry of config) {
    const key = `${entry.pageId}\0${entry.sectionId}`;
    if (!byKey.has(key)) {
      keyOrder.push(key);
      byKey.set(key, []);
    }
    byKey.get(key).push(entry);
  }

  const result = [];
  for (const key of keyOrder) {
    const entries = byKey.get(key);
    const chosen =
      currentResourceType && entries.length > 1
        ? entries.find((s) => (s.resourceTypes || []).includes(currentResourceType)) ?? entries[0]
        : entries[0];
    const fieldList = chosen.fields ?? [];
    let errorsCount = 0;
    let warningsCount = 0;
    let infoCount = 0;
    for (const path of paths) {
      if (!fieldList.some((field) => fieldMatches(path, field))) continue;
      const severity = getSeverityAtPath(errors, path);
      if (severity === "error") errorsCount += 1;
      else if (severity === "warning") warningsCount += 1;
      else infoCount += 1;
    }
    const count = errorsCount + warningsCount + infoCount;
    if (count === 0) continue;
    result.push({
      ...chosen,
      count,
      errors: errorsCount,
      warnings: warningsCount,
      info: infoCount,
    });
  }
  return result;
}

/* React component to display validation and system error messages.
  *
  *
  */
const FormFeedbackSummary = ({ errors, sectionsConfig = [], currentResourceType: currentResourceTypeProp }) => {
  const ctx = useContext(FormUIStateContext) ?? {};
  const { formUIState, handleFormPageChange } = ctx;
  const currentFormPage = formUIState?.currentFormPage;
  const currentResourceType = currentResourceTypeProp ?? formUIState?.currentResourceType;
  const sectionsWithCount = getErrorSections(errors, sectionsConfig, currentResourceType);
  if (_isEmpty(sectionsWithCount)) {
    return null;
  }
  const multiPage = new Set(sectionsWithCount.map((s) => s.pageId)).size > 1;

  const scrollToSection = (sectionId, options = {}) => {
    if (!sectionId) return;
    const elementId = getFormSectionElementId(sectionId);
    const scroll = () => {
      const sectionEl = document.getElementById(elementId);
      if (!sectionEl) return;

      sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });

      // Try to focus the first focusable element within the section
      const focusable = sectionEl.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const targetEl = focusable || sectionEl;

      if (typeof targetEl.focus === "function") {
        try {
          targetEl.focus({ preventScroll: true });
        } catch {
          targetEl.focus();
        }
      }
    };
    if (options.waitForElement) {
      // Section is on another page; give the UI a moment to render, then poll until it appears.
      const maxAttempts = 40;
      let attempts = 0;
      const tryScroll = () => {
        const sectionEl = document.getElementById(elementId);
        if (sectionEl) {
          scroll();
          return;
        }
        attempts += 1;
        if (attempts < maxAttempts) {
          setTimeout(tryScroll, 50);
        }
      };
      setTimeout(tryScroll, 200);
    } else if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(scroll);
    } else {
      setTimeout(scroll, 0);
    }
  };

  return sectionsWithCount.map((section) => {
    const { pageId, sectionId, pageLabel, sectionLabel, errors: errorsCount = 0, warnings: warningsCount = 0, info: infoCount = 0 } = section;
    const label = multiPage ? `${pageLabel ?? pageId} / ${sectionLabel ?? sectionId}` : (sectionLabel ?? sectionId);
    const severityClass =
      errorsCount > 0 ? getSeverityBadgeType("error") : warningsCount > 0 ? getSeverityBadgeType("warning") : infoCount > 0 ? getSeverityBadgeType("info") : "";
    return (
      <Button
        key={`${pageId}\0${sectionId}`}
        type="button"
        transparent
        basic
        className={`pl-5 comma-separated ${severityClass}`}
        onClick={(e) => {
          if (multiPage && pageId !== currentFormPage && handleFormPageChange) {
            handleFormPageChange(e, { value: pageId });
          }
          const waitForElement = multiPage && pageId !== currentFormPage;
          scrollToSection(sectionId, { waitForElement });
        }}
      >
        {label}{" "}
        {errorsCount > 0 && (
          <Label size="tiny" circular className={getSeverityBadgeType("error")} key="error">
            {errorsCount} {getSeverityLabel("error")}{errorsCount !== 1 ? "s" : ""}
          </Label>
        )}
        {warningsCount > 0 && (
          <Label size="tiny" circular className={getSeverityBadgeType("warning")} key="warning">
            {warningsCount} {getSeverityLabel("warning")}{warningsCount !== 1 ? "s" : ""}
          </Label>
        )}
        {infoCount > 0 && (
          <Label size="tiny" circular className={getSeverityBadgeType("info")} key="info">
            {infoCount} {getSeverityLabel("info")}{infoCount !== 1 ? "s" : ""}
          </Label>
        )}
      </Button>
    );
  });
}

FormFeedbackSummary.propTypes = {
  sectionsConfig: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  currentResourceType: PropTypes.string,
};

export { FormFeedbackSummary };
