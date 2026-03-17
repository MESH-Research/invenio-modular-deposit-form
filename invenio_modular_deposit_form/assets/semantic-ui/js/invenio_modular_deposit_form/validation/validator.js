// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research.
//
// Invenio Modular Deposit Form is free software; you can redistribute and/or 
// modify it under the terms of the MIT License; see LICENSE file for more details.

import {
  addMethod,
  array as yupArray,
  boolean as yupBoolean,
  mixed,
  object as yupObject,
  string as yupString,
  date as yupDate,
} from "yup";

import {
  gndValidator,
  isniValidator,
  orcidValidator,
  rorValidator,
} from "./validatorsForIds";

import {
  dateInSequence,
  edtfValidator,
} from "./validatorsForDates.js";

addMethod(yupString, "edtf", edtfValidator);

addMethod(yupString, "ror", rorValidator);

addMethod(yupString, "gnd", gndValidator);

addMethod(yupString, "orcid", orcidValidator);

addMethod(yupString, "isni", isniValidator);

addMethod(yupString, "dateInSequence", dateInSequence);

// Must match RDM_RECORDS_MAX_TITLE_LENGTH in invenio.cfg (metadata validation)
const TITLE_MAX_LENGTH = 260;

const validationSchema = yupObject().shape({
  access: yupObject().shape({}),
  custom_fields: yupObject().shape({
  }),
  metadata: yupObject()
    .shape({
      creators: yupArray()
        .of(
          yupObject().shape({
            affiliations: yupArray().of(
              yupObject().shape({
                name: yupString()
                  .matches(/(?!\s).+/, "Affiliation cannot be blank")
                  .required("An affiliation is required"),
              })
            ),
            person_or_org: yupObject().shape({
              type: yupString().required("A type is required"),
              family_name: yupString()
                .when("type", {
                  is: "personal",
                  then: yupString()
                    .matches(/(?!\s).+/, "Family name cannot be blank")
                    .required("A family name is required"),
                }),
              given_name: yupString().matches(/(?!\s).+/, {
                disallowEmptyString: true,
                message: "Given name cannot be spaces only",
              }),
              name: yupString()
                .when("type", {
                  is: "organizational",
                  then: yupString()
                    .matches(/(?!\s).+/, "Name cannot be blank")
                    .required("A name is required"),
                }),
              identifiers: yupArray().of(
                yupObject().shape({
                  scheme: yupString().required(
                    "A scheme is required for each identifier"
                  ),
                  identifier: yupString()
                    .required("A value is required for each identifier")
                    .when("scheme", {
                      is: "url",
                      then: yupString()
                        .url("Must be a valid URL (e.g. https://example.com)")
                        .required("You must provide a URL or remove this row"),
                    })
                    .when("scheme", {
                      is: "orcid",
                      then: yupString()
                        .orcid(
                          "Must be a valid ORCID id (e.g., 0000-0001-2345-6789)"
                        )
                        .required(
                          "You must provide an ORCID id or remove this row"
                        ),
                    })
                    .when("scheme", {
                      is: "isni",
                      then: yupString()
                        .isni(
                          "Must be a valid ISNI id (e.g., 0000-0001-2345-6789)"
                        )
                        .required(
                          "You must provide an ISNI id or remove this row"
                        ),
                    })
                    .when("scheme", {
                      is: "gnd",
                      then: yupString()
                        .gnd("Must be a valid GND id (e.g., gnd:118627813)")
                        .required(
                          "You must provide a GND id or remove this row"
                        ),
                    })
                    .when("scheme", {
                      is: "ror",
                      then: yupString()
                        .ror("Must be a valid ROR id (e.g., 03rjyp183)")
                        .required(
                          "You must provide a GND id or remove this row"
                        ),
                    })
                    .matches(/(?!\s).+/, {
                      disallowEmptyString: true,
                      message: "Identifier cannot be blank",
                    }),
                })
              ),
            }),
            role: yupString().required(
              "A role is required for each contributor"
            ),
          })
        )
        .min(1, "At least one contributor must be listed")
        .required("At least one contributor must be listed"),
      identifiers: yupArray().of(
        yupObject().shape({
          scheme: yupString().required(
            "An scheme is required for each identifier"
          ),
          identifier: yupString()
            .when("scheme", {
              is: "url",
              then: yupString()
                .url("Must be a valid URL (e.g. https://example.com)")
                .required("You must provide a URL or remove this item"),
            })
            .when("scheme", {
              is: "isni",
              then: yupString()
                .isni(
                  "Must be a valid ISNI id (e.g., 0000-0001-2345-6789)"
                )
                .required(
                  "You must provide an ISNI id or remove this row"
                ),
            })
            .matches(/(?!\s).+/, {
              disallowEmptyString: true,
              message: "Identifier cannot be blank",
            })
            .required("You must provide an identifier or remove this row"),
        })
      ),
      publisher: yupString(),
      // Publisher is not required in form validation because a default value is set
      // in the form before submission.
      publication_date: yupString()
          .edtf()
          .dateInSequence()
          .required("A publication date is required"),
      title: yupString()
        .matches(/(?!\s).+/, "Title cannot be blank")
        .min(1, "Title must be at least 1 character")
        .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`)
        .required("A title is required"),
      additional_titles: yupArray().of(
        yupObject().shape({
          title: yupString()
            .matches(/(?!\s).+/, "Title cannot be blank")
            .min(1, "Title must be at least 1 character")
            .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`)
            .required("A title is required"),
          type: yupString().required("A type is required"),
          lang: mixed().test('lang-format', 'Invalid language format', function(value) {
            if (!value) return true;
            if (typeof value === 'string') return true;
            if (typeof value === 'object' && value.id && value.title_l10n) return true;
            return false;
          }),
        })
      ),
      resource_type: yupString().required("A resource type is required"),
      description: yupString(),
      additional_descriptions: yupArray().of(
        yupObject().shape({
          description: yupString()
            .matches(/(?!\s).+/, "Description cannot be blank")
            .required("Provide a description or remove this item"),
          type: yupString().required(
            "A type is required for each additional description"
          ),
          lang: mixed().test('lang-format', 'Invalid language format', function(value) {
            if (!value) return true;
            if (typeof value === 'string') return true;
            if (typeof value === 'object' && value.id && value.title_l10n) return true;
            return false;
          }),
        })
      ),
    })
    .required("Some metadata is required"),
});

export { validationSchema};
