// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import { addMethod, array as yupArray, object as yupObject, string as yupString } from "yup";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { isbnValidator, issnValidator, urlValidator } from "./validatorsForIds";
import { edtfSingleDateValidator } from "./validatorsForDates.js";
import { validRecordIdentifierForScheme } from "./identifierSchemeValidators.js";

addMethod(yupString, "isURL", urlValidator);
addMethod(yupString, "isbn", isbnValidator);
addMethod(yupString, "issn", issnValidator);
addMethod(yupString, "edtfSingle", edtfSingleDateValidator);
addMethod(yupString, "validRecordIdentifierForScheme", validRecordIdentifierForScheme);

/**
 * Yup shape for `custom_fields`, aligned with InvenioRDM contrib custom fields.
 *
 * @param {string[]} recordSchemeIds - From deposit config (record identifier schemes);
 *   required for `meeting:meeting.identifiers` validation.
 * @returns {import("yup").ObjectSchema}
 */
function buildCustomFieldsSchema(recordSchemeIds) {
  return yupObject().shape({
    "code:codeRepository": yupString().isURL().notRequired(),
    "code:programmingLanguage": yupArray().of(yupString()).notRequired(),
    "code:developmentStatus": yupString().notRequired(),
    "imprint:imprint": yupObject()
      .shape({
        title: yupString().notRequired(),
        place: yupString().notRequired(),
        isbn: yupString().isbn().notRequired(),
        pages: yupString().notRequired(),
      })
      .notRequired(),
    "journal:journal": yupObject()
      .shape({
        title: yupString().notRequired(),
        volume: yupString().notRequired(),
        issue: yupString().notRequired(),
        pages: yupString().issn().notRequired(),
        issn: yupString().notRequired(),
      })
      .notRequired(),
    "thesis:thesis": yupObject()
      .shape({
        university: yupString().notRequired(),
        department: yupString().notRequired(),
        type: yupString().notRequired(),
        date_submitted: yupString().edtfSingle().notRequired(),
        date_defended: yupString().edtfSingle().notRequired(),
      })
      .notRequired(),
    "meeting:meeting": yupObject()
      .shape({
        title: yupString().notRequired(),
        acronym: yupString().notRequired(),
        dates: yupString().notRequired(),
        place: yupString().notRequired(),
        url: yupString().isURL().notRequired(),
        session: yupString().notRequired(),
        session_part: yupString().notRequired(),
        identifiers: yupArray()
          .of(
            yupObject().shape({
              scheme: yupString().required(
                i18next.t("A scheme is required for each identifier")
              ),
              identifier: yupString()
                .required(i18next.t("A value is required for each identifier"))
                .validRecordIdentifierForScheme(recordSchemeIds)
                .matches(/(?!\s).+/, {
                  disallowEmptyString: true,
                  message: i18next.t("Identifier cannot be blank"),
                }),
            })
          )
          .notRequired(),
      })
      .notRequired(),
  });
}

export { buildCustomFieldsSchema };
