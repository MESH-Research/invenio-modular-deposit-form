// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

/** Single-date EDTF segment (no `/` range). Matches backend ISODateString-style single values. */
const EDTF_SINGLE_REGEX = /^\d{4}(?:-\d{2})?(?:-\d{2})?$/;

/** Full EDTF: one segment or two segments separated by `/` (interval). */
const EDTF_RANGE_REGEX =
  /^\d{4}(?:-\d{2})?(?:-\d{2})?(?:\/\d{4}(?:-\d{2})?(?:-\d{2})?)?$/;

/** Full ISO 8601 calendar date only (matches backend `ISODateString` / `EmbargoSchema.until`). */
const ISO_YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse and validate one EDTF date segment (year, year-month, or full date).
 * Calendar checks use UTC (consistent with ISO date semantics).
 *
 * @param {string} segment - trimmed, no `/`
 * @returns {{ yi: number, mo: number, da: number } | null}
 */
function parseEdtfSingleSegment(segment) {
  if (segment == null || segment === "") return null;
  if (segment.includes("/")) return null;
  if (!EDTF_SINGLE_REGEX.test(segment)) return null;
  const [y, m, d] = segment.split("-");
  const yi = parseInt(y, 10);
  if (Number.isNaN(yi) || yi > 2999) return null;
  const mo = m ? parseInt(m, 10) : 1;
  const da = d ? parseInt(d, 10) : 1;
  if (m) {
    if (Number.isNaN(mo) || mo < 1 || mo > 12) return null;
  }
  if (d) {
    if (Number.isNaN(da) || da < 1) return null;
    const daysInMonth = new Date(Date.UTC(yi, mo, 0)).getUTCDate();
    if (da > daysInMonth) return null;
  }
  return { yi, mo, da };
}

/**
 * Parse a strict `YYYY-MM-DD` string. Rejects year- or year-month-only values.
 *
 * @param {string} s - trimmed
 * @returns {{ yi: number, mo: number, da: number } | null}
 */
function parseIsoYyyyMmDd(s) {
  if (s == null || s === "") return null;
  if (!ISO_YYYY_MM_DD_REGEX.test(s)) return null;
  const [y, m, d] = s.split("-");
  const yi = parseInt(y, 10);
  const mo = parseInt(m, 10);
  const da = parseInt(d, 10);
  if (Number.isNaN(yi) || yi > 2999) return null;
  if (Number.isNaN(mo) || mo < 1 || mo > 12) return null;
  if (Number.isNaN(da) || da < 1) return null;
  const daysInMonth = new Date(Date.UTC(yi, mo, 0)).getUTCDate();
  if (da > daysInMonth) return null;
  return { yi, mo, da };
}

/**
 * Yup string test: optional empty; otherwise must be `YYYY-MM-DD` (backend `ISODateString`).
 */
function isoDateStringValidator(
  message = i18next.t("Invalid ISO date (use YYYY-MM-DD).")
) {
  return this.test("iso-date-string", message, (value) => {
    if (value == null || value === "") return true;
    return parseIsoYyyyMmDd(String(value).trim()) !== null;
  });
}

/**
 * Object-level test mirroring `EmbargoSchema.validate_embargo`.
 * `until` is already validated as `YYYY-MM-DD` by `.isoDateString()` on the same shape.
 *
 * Use as: `yupObject().shape({ ... }).test("embargo-consistency", embargoConsistencyTest)`.
 */
function embargoConsistencyTest(value) {
  if (!value) return true;
  const { active, until } = value;
  const untilDate = until
    ? new Date(`${String(until).trim()}T00:00:00.000Z`)
    : null;
  const now = new Date();

  if (active === true) {
    if (
      !until ||
      !untilDate ||
      Number.isNaN(untilDate.getTime()) ||
      untilDate <= now
    ) {
      return this.createError({
        path: `${this.path}.until`,
        message: i18next.t("Embargo end date must be set to a future date."),
      });
    }
  } else if (active === false) {
    if (
      until &&
      untilDate &&
      !Number.isNaN(untilDate.getTime()) &&
      untilDate > now
    ) {
      return this.createError({
        path: `${this.path}.until`,
        message: i18next.t("Embargo end date must be unset or in the past."),
      });
    }
  }
  return true;
}

function validateEdtfSingleDateString(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (v.includes("/")) return false;
  return parseEdtfSingleSegment(v) !== null;
}

/**
 * UTC milliseconds at start of day for a single EDTF date string (year, year-month, or full date).
 * Used to compare with `Date.now()` the same way `arrow.get(...)` vs `arrow.utcnow()` does for ISO dates.
 *
 * @param {string} value
 * @returns {number | null}
 */
function edtfSingleDateStartUtcMs(value) {
  if (value == null) return null;
  const s = String(value).trim();
  const parsed = parseEdtfSingleSegment(s);
  if (!parsed) return null;
  const { yi, mo, da } = parsed;
  return Date.UTC(yi, mo - 1, da);
}

function edtfValidator(message = i18next.t("Date must be formatted like YYYY-MM-DD (ranges like YYYY-MM-DD/YYY-MM-DD)")) {
  return this.test("edtf", message, (value) => {
    if (!value) return true;
    const s = String(value).trim();
    if (!EDTF_RANGE_REGEX.test(s)) return false;
    const segments = s.split("/");
    for (const part of segments) {
      if (parseEdtfSingleSegment(part) === null) return false;
    }
    return true;
  });
}

/**
 * EDTF-like single date only (no interval/range with `/`). Same calendar rules as {@link edtfValidator}
 * for each segment, but rejects ranges.
 */
function edtfSingleDateValidator(
  message = i18next.t("Date must be formatted like YYYY-MM-DD (single date only, no range)")
) {
  return this.test("edtf-single", message, (value) => {
    if (value == null || value === "") return true;
    return validateEdtfSingleDateString(value);
  });
}

function dateInSequence() {
  return this.test("dateInSequence", function (value) {
    const { createError } = this;
    let outOfSequence = false;

    if (value) {
      const dateParts = value.split("/");
      if (dateParts?.length > 1) {
        const aDate = new Date(dateParts[0]);
        const bDate = new Date(dateParts[1]);
        if (aDate > bDate) {
          outOfSequence = true;
        }
      }
    }
    return (
      outOfSequence === false ||
      createError({ message: i18next.t("End date must be after start date") })
    );
  });
}

export {
  dateInSequence,
  edtfSingleDateStartUtcMs,
  edtfSingleDateValidator,
  edtfValidator,
  embargoConsistencyTest,
  isoDateStringValidator,
};
