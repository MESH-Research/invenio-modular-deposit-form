// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

function edtfValidator(message = i18next.t("Invalid EDTF format")) {
  return this.test('edtf', message, value => {
    if (!value) return true;
    const edtfRegex = /^\d{4}(?:-\d{2})?(?:-\d{2})?(?:\/\d{4}(?:-\d{2})?(?:-\d{2})?)?$/;
    if (!edtfRegex.test(value)) return false;
    // Reject impossible month/day
    const startPart = value.split("/")[0];
    const [y, m, d] = startPart.split("-");
    const month = m ? parseInt(m, 10) : null;
    const day = d ? parseInt(d, 10) : null;
    if (month && (month < 1 || month > 12)) return false;
    if (day) {
      const daysInMonth = new Date(parseInt(y,10), month, 0).getDate();
      if (day < 1 || day > daysInMonth) return false;
    }
    if (parseInt(y,10) > 2999) return false;
    return true;
  });
}

function dateInSequence() {
  return this.test("dateInSequence", function (value) {
    const { path, createError } = this;
    let outOfSequence = false;

    if (!!value) {
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
};

export {
  edtfValidator,
  dateInSequence,
}
