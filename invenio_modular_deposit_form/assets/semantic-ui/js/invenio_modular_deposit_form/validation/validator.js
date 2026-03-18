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
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import {
  buildCreatorIdentifierChain,
  buildRecordIdentifierChain,
  getCreatorIdentifierSchemeIdsFromVocab,
  getRecordIdentifierSchemeIdsFromVocab,
  getVocabOptionValues,
} from "./identifierSchemeValidators";
import { SCHEME_ID_TO_VALIDATOR } from "./validatorsForIds";
import {
  dateInSequence,
  edtfValidator,
} from "./validatorsForDates.js";

addMethod(yupString, "edtf", edtfValidator);
addMethod(yupString, "dateInSequence", dateInSequence);
for (const [schemeId, validatorFn] of Object.entries(SCHEME_ID_TO_VALIDATOR)) {
  addMethod(yupString, schemeId, validatorFn);
}

const DEFAULT_TITLE_MAX_LENGTH = 260;

const accessSchema = yupObject().shape({
  files: yupString().oneOf(["public", "restricted"]),
  record: yupString().oneOf(["public", "restricted"]),
  status: yupString(),
  embargo: yupObject().shape({
    active: yupBoolean(),
    until: yupString().edtf().dateInSequence(),
    reason: yupString()
  })
})

// Helper schema for individual PID entries
// NOTE: We don't make it required in the client-side schema since 
// a PID may only be reserved and added on submission
const pidEntrySchema = yupObject().shape({
  identifier: yupString().when("provider", {
    is: "external",
    then: (schema) => schema
      .doi()
      .required(i18next.t("You must provide a valid DOI if you say that you already have one.")),
  }),
  provider: yupString(),
  client: yupString(),
});

/**
 * Build the validation schema from deposit config.
 * Uses config.max_title_length, config.vocabularies.creators.identifiers.scheme,
 * config.vocabularies.metadata.identifiers.scheme (record/related identifiers),
 * and optional config.vocabularies.dates.type / titles.type for oneOf.
 *
 * @param {Object} config - Deposit config (e.g. from Redux or merge_deposit_config payload)
 * @returns {import("yup").ObjectSchema}
 */
function buildValidationSchema(config = {}) {
  const titleMaxLength = Number(config.max_title_length) || DEFAULT_TITLE_MAX_LENGTH;
  const creatorSchemeIds = getCreatorIdentifierSchemeIdsFromVocab(config);
  const recordSchemeIds = getRecordIdentifierSchemeIdsFromVocab(config);
  const titleTypeValues = getVocabOptionValues(
    config?.vocabularies?.metadata?.titles?.type ?? config?.vocabularies?.titles?.type
  );

  const creatorIdentifiersShape = yupObject().shape({
    scheme: yupString().required(
      i18next.t("A scheme is required for each identifier")
    ),
    identifier: buildCreatorIdentifierChain(
      yupString().required(i18next.t("A value is required for each identifier")),
      creatorSchemeIds,
      yupString
    ).matches(/(?!\s).+/, {
      disallowEmptyString: true,
      message: i18next.t("Identifier cannot be blank"),
    }),
  });

  const recordIdentifiersShape = yupObject().shape({
    scheme: yupString().required(
      i18next.t("A scheme is required for each identifier")
    ),
    identifier: buildRecordIdentifierChain(
      yupString().required(i18next.t("A value is required for each identifier")),
      recordSchemeIds,
      yupString
    ).matches(/(?!\s).+/, {
      disallowEmptyString: true,
      message: i18next.t("Identifier cannot be blank"),
    }),
  });

  const additionalTitleTypeSchema = titleTypeValues.length
    ? yupString().required(i18next.t("A type is required")).oneOf(titleTypeValues)
    : yupString().required(i18next.t("A type is required"));

  return yupObject().shape({
    access: accessSchema, 
    // Backend schema: `pids` is a dict of PID schemes (e.g. `pids: { doi: {...} }`).
    // Allow empty `{}` while validating `pids.doi.*` when present.
    pids: yupObject()
      .shape({doi: pidEntrySchema})
      .default({})
      .notRequired(),
    custom_fields: yupObject().shape({}),
    metadata: yupObject()
      .shape({
        creators: yupArray()
          .of(
            yupObject().shape({
              affiliations: yupArray().of(
                yupObject()
                  .shape({
                    id: yupString(),
                    name: yupString(),
                  })
                  .test(
                    "id-or-name",
                    i18next.t("An existing id or a free text name must be present."),
                    (val) => !val || !!String(val?.id ?? "").trim() || !!String(val?.name ?? "").trim()
                  )
              ),
              person_or_org: yupObject().shape({
                type: yupString().required(i18next.t("A type is required")),
                family_name: yupString()
                  .when("type", {
                    is: "personal",
                    then: yupString()
                      .matches(/(?!\s).+/, i18next.t("Family name cannot be blank"))
                      .required(i18next.t("A family name is required")),
                  }),
                given_name: yupString().matches(/(?!\s).+/, {
                  disallowEmptyString: true,
                  message: i18next.t("Given name cannot be spaces only"),
                }),
                name: yupString()
                  .when("type", {
                    is: "organizational",
                    then: yupString()
                      .matches(/(?!\s).+/, i18next.t("Name cannot be blank"))
                      .required(i18next.t("A name is required")),
                  }),
                identifiers: yupArray().of(creatorIdentifiersShape),
              }),
              role: yupString().required(
                i18next.t("A role is required for each contributor")
              ),
            })
          )
          .min(1, i18next.t("At least one contributor must be listed"))
          .required(i18next.t("At least one contributor must be listed")),
        identifiers: yupArray().of(recordIdentifiersShape),
        related_identifiers: yupArray().of(
          yupObject().shape({
            scheme: yupString().required(
              i18next.t("A scheme is required for each identifier")
            ),
            identifier: buildRecordIdentifierChain(
              yupString().required(i18next.t("A value is required for each identifier")),
              recordSchemeIds,
              yupString
            ).matches(/(?!\s).+/, {
              disallowEmptyString: true,
              message: i18next.t("Identifier cannot be blank"),
            }),
            relation_type: yupString(),
            resource_type: yupString(),
          })
        ),
      publisher: yupString(),
      // Publisher is not required in form validation because a default value is set
      // in the form before submission.
      publication_date: yupString()
          .edtf()
          .dateInSequence()
          .required(i18next.t("A publication date is required")),
      title: yupString()
        .matches(/(?!\s).+/, i18next.t("Title cannot be blank"))
        .min(1, i18next.t("Title must be at least 1 character"))
        .max(titleMaxLength, i18next.t("Title must be at most {{count}} characters", { count: titleMaxLength }))
        .required(i18next.t("A title is required")),
      additional_titles: yupArray().of(
        yupObject().shape({
          title: yupString()
            .matches(/(?!\s).+/, i18next.t("Title cannot be blank"))
            .min(1, i18next.t("Title must be at least 1 character"))
            .max(titleMaxLength, i18next.t("Title must be at most {{count}} characters", { count: titleMaxLength }))
            .required(i18next.t("A title is required")),
          type: additionalTitleTypeSchema,
          lang: mixed().test("lang-format", i18next.t("Invalid language format"), function (value) {
            if (!value) return true;
            if (typeof value === 'string') return true;
            if (typeof value === 'object' && value.id && value.title_l10n) return true;
            return false;
          }),
        })
      ),
      resource_type: yupString().required(i18next.t("A resource type is required")),
      description: yupString(),
      additional_descriptions: yupArray().of(
        yupObject().shape({
          description: yupString()
            .matches(/(?!\s).+/, i18next.t("Description cannot be blank"))
            .required(i18next.t("Provide a description or remove this item")),
          type: yupString().required(
            i18next.t("A type is required for each additional description")
          ),
          lang: mixed().test("lang-format", i18next.t("Invalid language format"), function (value) {
            if (!value) return true;
            if (typeof value === 'string') return true;
            if (typeof value === 'object' && value.id && value.title_l10n) return true;
            return false;
          }),
        })
      ),
    })
    .required(i18next.t("Some metadata is required")),
  });
}

export default buildValidationSchema;
