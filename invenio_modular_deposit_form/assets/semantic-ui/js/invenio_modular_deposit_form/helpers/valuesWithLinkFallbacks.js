// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

/**
 * Return Formik draft values with `links` filled from server-side fallbacks when missing.
 *
 * Formik can lose `links` after localStorage recovery or other client-only resets while
 * Redux or the page-load snapshot still has them. Deposit API thunks (save, reserve PID,
 * discard PID) read `links` from the values object passed in, not from Redux directly.
 *
 * Fallback order when Formik `links` are missing or unusable:
 * 1. `recordLinks` — live Redux `state.deposit.record.links`
 * 2. `initialValuesLinks` — Formik `initialValues.links` (server embed on page load)
 *
 * @param {object} values - Formik values for the draft
 * @param {object} [options]
 * @param {object} [options.recordLinks] - Links from Redux deposit record
 * @param {object} [options.initialValuesLinks] - Links from Formik initial values
 * @returns {object} Draft values, shallow-copied with resolved `links` when needed
 */
export function valuesWithLinkFallbacks(
  values,
  { recordLinks, initialValuesLinks } = {}
) {
  function hasUsableDraftLinks(links) {
    return Boolean(links && typeof links === "object" && links.self);
  }

  if (!values || typeof values !== "object") {
    return values;
  }

  if (hasUsableDraftLinks(values.links)) {
    return values;
  }

  const links =
    (hasUsableDraftLinks(recordLinks) && recordLinks) ||
    (hasUsableDraftLinks(initialValuesLinks) && initialValuesLinks) ||
    values.links ||
    recordLinks ||
    initialValuesLinks;

  if (links === values.links) {
    return values;
  }

  return { ...values, links };
}
