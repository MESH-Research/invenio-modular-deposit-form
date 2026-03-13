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
import React, { Component } from "react";
import { Label } from "semantic-ui-react";
import PropTypes from "prop-types";

function fieldMatches(errorPath, fieldPath) {
  return (
    errorPath === fieldPath ||
    errorPath.startsWith(fieldPath + ".") ||
    fieldPath.startsWith(errorPath + ".")
  );
}

export class FormFeedbackSummary extends Component {
  constructor(props) {
    super(props);
    this.sectionsConfig = props.sectionsConfig || [];
  }

  getAllErrPaths = (obj, prev = "") => {
    const result = [];
    for (let k in obj) {
      let path = prev + (prev ? "." : "") + k;
      if (typeof obj[k] == "string" || obj[k].severity !== undefined) {
        result.push(path);
      } else if (typeof obj[k] == "object") {
        result.push(...this.getAllErrPaths(obj[k], path));
      }
    }
    return result;
  };

  getErrorSections(errors) {
    const errorSections = new Map();
    const orderedSections = [];
    const paths = this.getAllErrPaths(errors);
    const sectionsConfig = Array.isArray(this.sectionsConfig) ? this.sectionsConfig : [];
    const currentResourceType = this.props.currentResourceType;

    paths.forEach((path) => {
      const matches = sectionsConfig.filter((section) =>
        (section.fields || []).some((field) => fieldMatches(path, field))
      );
      if (matches.length === 0) return;
      const entry =
        currentResourceType && matches.length > 1
          ? matches.find((s) => (s.resourceTypes || []).includes(currentResourceType)) ?? matches[0]
          : matches[0];
      const sectionKey = `${entry.pageId}\0${entry.sectionId}`;
      if (!errorSections.has(sectionKey)) {
        orderedSections.push(sectionKey);
        errorSections.set(sectionKey, {
          pageId: entry.pageId,
          sectionId: entry.sectionId,
          pageLabel: entry.pageLabel ?? entry.pageId,
          sectionLabel: entry.sectionLabel ?? entry.sectionId,
          count: 0,
        });
      }
      const rec = errorSections.get(sectionKey);
      rec.count += 1;
    });

    return { orderedSections, errorSections };
  }

  render() {
    const { errors } = this.props;
    const { orderedSections, errorSections } = this.getErrorSections(errors);
    if (_isEmpty(orderedSections)) {
      return null;
    }

    const pageIds = new Set(orderedSections.map((key) => errorSections.get(key).pageId));
    const multiPage = pageIds.size > 1;

    return orderedSections.map((sectionKey) => {
      const { pageId, sectionId, pageLabel, sectionLabel, count } = errorSections.get(sectionKey);
      const href = multiPage
        ? `?depositFormPage=${encodeURIComponent(pageId)}#${encodeURIComponent(sectionId)}`
        : `#${sectionId}`;
      const label = multiPage ? `${pageLabel} / ${sectionLabel}` : sectionLabel;
      return (
        <a key={sectionKey} className="pl-5 comma-separated" href={href}>
          {label}{" "}
          <Label circular size="tiny">
            {count}
          </Label>
        </a>
      );
    });
  }
}

FormFeedbackSummary.propTypes = {
  sectionsConfig: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  currentResourceType: PropTypes.string,
};
