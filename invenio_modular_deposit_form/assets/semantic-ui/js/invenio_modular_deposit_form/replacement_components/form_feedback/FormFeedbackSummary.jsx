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

function fieldMatches(errorPath, fieldPath) {
  return (
    errorPath === fieldPath ||
    errorPath.startsWith(fieldPath + ".") ||
    fieldPath.startsWith(errorPath + ".")
  );
}


function getAllErrPaths(obj, prev = "") {
  const result = [];
  for (let k in obj) {
    let path = prev + (prev ? "." : "") + k;
    if (typeof obj[k] == "string" || obj[k].severity !== undefined) {
      result.push(path);
    } else if (typeof obj[k] == "object") {
      result.push(...getAllErrPaths(obj[k], path));
    }
  }
  return result;
};


/**
 * sectionsConfig from buildFormSections can have multiple entries per (pageId, sectionId)
 * when resource types define different fields for that section (merge only when fieldsEqual).
 * Dedupe by (pageId, sectionId), pick the entry for currentResourceType when multiple exist,
 * add count of matching error paths, return sections with count > 0 in config order.
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
    const count = paths.filter((path) =>
      fieldList.some((field) => fieldMatches(path, field))
    ).length;
    if (count === 0) continue;
    result.push({ ...chosen, count });
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
  const currentResourceType = currentResourceTypeProp ?? formUIState?.currentResourceType;
  const sectionsWithCount = getErrorSections(errors, sectionsConfig, currentResourceType);
  if (_isEmpty(sectionsWithCount)) {
    return null;
  }
  const multiPage = new Set(sectionsWithCount.map((s) => s.pageId)).size > 1;

  const scrollToSection = (sectionId) => {
    if (!sectionId) return;
    const scroll = () => {
      const sectionEl = document.getElementById(sectionId);
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
    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(scroll);
    } else {
      setTimeout(scroll, 0);
    }
  };

  return sectionsWithCount.map((section) => {
    const { pageId, sectionId, pageLabel, sectionLabel, count } = section;
    const label = multiPage ? `${pageLabel ?? pageId} / ${sectionLabel ?? sectionId}` : (sectionLabel ?? sectionId);
    return (
      <Button
        key={`${pageId}\0${sectionId}`}
        transparent
        basic
        className="pl-5 comma-separated error"
        onClick={(e) => {
          if (multiPage && handleFormPageChange) {
            handleFormPageChange(e, { value: pageId });
          }
          scrollToSection(sectionId);
        }}
      >
        {label}{" "}
        <Label circular size="tiny" className="error">
          {count}
        </Label>
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
