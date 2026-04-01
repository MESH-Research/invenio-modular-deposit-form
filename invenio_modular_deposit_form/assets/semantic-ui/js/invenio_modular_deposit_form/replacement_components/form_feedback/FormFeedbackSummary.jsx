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
import React, { useMemo } from "react";
import { Button, Label } from "semantic-ui-react";
import PropTypes from "prop-types";
import { useFormUIState } from "../../FormUIStateManager.jsx";
import { getSeverityLabel } from "../../helpers/severityChecksConfig";
import { getFormSectionElementId } from "../../utils";
import { getSeverityBadgeType } from "../../helpers/severityChecksConfig";

/**
 * Section list and counts from formUIState.sectionErrorsFlagged (FormErrorManager), so badges
 * match the menu/stepper/section headers and update on resubmit. sectionsConfig is used for key
 * order and section labels; page labels come from formUIState.resolvedFormPages (current type).
 *
 */
function getErrorSectionsFromState(formUIState, sectionsConfig, currentResourceType) {
  const config = Array.isArray(sectionsConfig) ? sectionsConfig : [];
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

  const list = formUIState?.sectionErrorsFlagged ?? [];
  const countsByKey = {};
  for (const entry of list) {
    const page = entry?.page ?? "";
    const section = entry?.section ?? "";
    const key = `${page}\0${section}`;
    const errorsCount = (entry?.error_fields ?? []).length;
    const warningsCount = (entry?.warning_fields ?? []).length;
    const infoCount = (entry?.info_fields ?? []).length;
    const total = errorsCount + warningsCount + infoCount;
    if (total === 0) continue;
    countsByKey[key] = { errors: errorsCount, warnings: warningsCount, info: infoCount };
  }

  const result = [];
  for (const key of keyOrder) {
    const counts = countsByKey[key];
    if (!counts) continue;
    const entries = byKey.get(key);
    const chosen =
      currentResourceType && entries.length > 1
        ? entries.find((s) => (s.resourceTypes || []).includes(currentResourceType)) ?? entries[0]
        : entries[0];
    result.push({
      ...chosen,
      errors: counts.errors,
      warnings: counts.warnings,
      info: counts.info,
    });
  }
  return result;
}

/* React component to display validation and system error messages.
  *
  *
  */
function pageLabelsByPageIdFromResolved(resolvedFormPages) {
  const map = new Map();
  for (const p of resolvedFormPages ?? []) {
    const id = p?.section;
    if (id == null || id === "") continue;
    const lab = typeof p?.label === "string" ? p.label.trim() : "";
    if (lab !== "") map.set(id, lab);
  }
  return map;
}

const FormFeedbackSummary = ({ sectionsConfig = [], currentResourceType: currentResourceTypeProp }) => {
  const ctx = useFormUIState();
  const { formUIState, handleFormPageChange } = ctx;
  const currentFormPage = formUIState?.currentFormPage;
  const currentResourceType = currentResourceTypeProp ?? formUIState?.currentResourceType;
  const pageLabelByPageId = useMemo(
    () => pageLabelsByPageIdFromResolved(formUIState?.resolvedFormPages),
    [formUIState?.resolvedFormPages]
  );
  const sectionsWithCount = getErrorSectionsFromState(formUIState, sectionsConfig, currentResourceType);
  if (_isEmpty(sectionsWithCount)) {
    return null;
  }
  const multiPage = new Set((sectionsConfig || []).map((e) => e.pageId)).size > 1;

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
    const { pageId, sectionId, sectionLabel, errors: errorsCount = 0, warnings: warningsCount = 0, info: infoCount = 0 } = section;
    const pagePart = pageLabelByPageId.get(pageId) ?? pageId;
    const sectionPart = sectionLabel ?? sectionId;
    const label = multiPage
      ? pagePart === sectionPart
        ? sectionPart
        : `${pagePart} / ${sectionPart}`
      : sectionPart;
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
  currentResourceType: PropTypes.string,
};

export { FormFeedbackSummary };
