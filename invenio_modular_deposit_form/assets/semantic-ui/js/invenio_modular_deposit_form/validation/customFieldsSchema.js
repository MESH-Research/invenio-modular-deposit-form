// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or
// modify it under the terms of the MIT License; see LICENSE file for more details.

import {
  addMethod,
  array as yupArray,
  boolean as yupBoolean,
  lazy as yupLazy,
  mixed,
  number as yupNumber,
  object as yupObject,
  string as yupString,
  date as yupDate,
} from "yup";
import { isbnValidator, urlValidator } from "./validatorsForIds";

addMethod(yupString, "isURL", urlValidator);
addMethod(yupString, "isbn", isbnValidator);

// Imprint shapes mirror invenio_rdm_records.contrib.imprint.custom_fields.ImprintCF
// (SanitizedUnicode subfields; ISBN validated when non-empty).
const imprintNestedShape = {
  title: yupString().notRequired(),
  isbn: yupString().isbn().notRequired(),
  pages: yupString().notRequired(),
  place: yupString().notRequired(),
  edition: yupString().notRequired(),
};

const customFieldsSchema = yupObject().shape({
  "code:codeRepository": yupString().isURL().notRequired(),
  "code:programmingLanguage": yupArray().of(yupString()).notRequired(),
  "code:developmentStatus": yupString().notRequired(),
  // Single-field imprint widgets (IMPRINT_CUSTOM_FIELDS_UI in imprint_fields.py)
  "imprint:imprint.title": yupString().notRequired(),
  "imprint:imprint.place": yupString().notRequired(),
  "imprint:imprint.isbn": yupString().isbn().notRequired(),
  "imprint:imprint.pages": yupString().notRequired(),
  // Stock nested imprint object (IMPRINT_CUSTOM_FIELDS_UI single-block Imprint widget)
  "imprint:imprint": yupObject().shape(imprintNestedShape).notRequired(),
});

export { customFieldsSchema };
