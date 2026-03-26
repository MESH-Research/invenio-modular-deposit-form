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
import { urlValidator } from "./validatorsForIds";

addMethod(yupString, "isURL", urlValidator);

customFieldsSchema = yupObject.shape({
  "code:codeRepository": yupString().isURL().notRequired(),
  "code:programmingLanguage": yupArray()
    .of(
      yupObject.shape({
        id: yupString().required(),
      })
    )
    .notRequired(),
  "code:developmentStatus": yupArray()
    .of(
      yupObject.shape({
        id: yupString().required(),
      })
    )
    .nullable(),
});

export { customFieldsSchema };
