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
  object as yupObject,
  string as yupString,
  date as yupDate,
} from "yup";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import {
  getCreatorIdentifierSchemeIdsFromVocab,
  getLocationIdentifierSchemeIdsFromVocab,
  getRecordIdentifierSchemeIdsFromVocab,
  getVocabOptionValues,
  validIdentifierForScheme,
  validRecordIdentifierForScheme,
} from "./identifierSchemeValidators";
import { SCHEME_ID_TO_VALIDATOR } from "./validatorsForIds";
import {
  dateInSequence,
  edtfSingleDateValidator,
  edtfValidator,
  embargoConsistencyTest,
  isoDateStringValidator,
} from "./validatorsForDates.js";

addMethod(yupString, "edtf", edtfValidator);
addMethod(yupString, "edtfSingle", edtfSingleDateValidator);
addMethod(yupString, "isoDateString", isoDateStringValidator);
addMethod(yupString, "dateInSequence", dateInSequence);
for (const [schemeId, validatorFn] of Object.entries(SCHEME_ID_TO_VALIDATOR)) {
  addMethod(yupString, schemeId, validatorFn);
}

addMethod(yupString, "validIdentifierForScheme", validIdentifierForScheme);
addMethod(yupString, "validRecordIdentifierForScheme", validRecordIdentifierForScheme);

const DEFAULT_TITLE_MAX_LENGTH = 260;

const accessSchema = yupObject().shape({
  files: yupString()
    .oneOf(["public", "restricted"])
    .required(i18next.t("Missing a files access status.")),
  record: yupString()
    .oneOf(["public", "restricted"])
    .required(i18next.t("Missing a record access status.")),
  status: yupString(),
  embargo: yupObject()
    .shape({
      active: yupBoolean(),
      until: yupString().isoDateString(),
      reason: yupString(),
    })
    .test("embargo-consistency", embargoConsistencyTest),
});

// Per-PID shape: mirrors `invenio_rdm_records.services.schemas.pids.PIDSchema`
// (`identifier` + `provider` required when a scheme entry exists). `pids` itself
// may be `{}` or omit keys; only validate when `pids.doi` (etc.) is present.
const pidEntrySchema = yupObject().shape({
  provider: yupString().required(
    i18next.t("A provider is required for each persistent identifier.")
  ),
  identifier: yupString()
    .required(
      i18next.t("An identifier is required for each persistent identifier.")
    )
    .when("provider", {
      is: "external",
      then: (schema) =>
        schema.doi(
          i18next.t(
            "You must provide a valid DOI if you say that you already have one."
          )
        ),
      otherwise: (schema) =>
        schema.matches(/(?!\s).+/, {
          message: i18next.t("Identifier cannot be blank"),
        }),
    }),
  client: yupString(),
});

/**
 * Build the validation schema from deposit config.
 * Uses config.max_title_length, config.vocabularies.creators.identifiers.scheme,
 * config.vocabularies.metadata.identifiers.scheme (record identifiers, related,
 * references), config for location identifier schemes, and optional
 * config.vocabularies.metadata.dates.type (and titles.type) for oneOf.
 *
 * @param {Object} config - Deposit config (e.g. from Redux or merge_deposit_config payload)
 * @returns {import("yup").ObjectSchema}
 */
function buildValidationSchema(config = {}) {
  const titleMaxLength = Number(config.max_title_length) || DEFAULT_TITLE_MAX_LENGTH;
  const creatorSchemeIds = getCreatorIdentifierSchemeIdsFromVocab(config);
  const recordSchemeIds = getRecordIdentifierSchemeIdsFromVocab(config);
  const locationSchemeIds = getLocationIdentifierSchemeIdsFromVocab(config);
  const titleTypeValues = getVocabOptionValues(
    config?.vocabularies?.metadata?.titles?.type ?? config?.vocabularies?.titles?.type
  );
  const dateTypeValues = getVocabOptionValues(
    config?.vocabularies?.metadata?.dates?.type ?? config?.vocabularies?.dates?.type
  );

  const creatorIdentifiersShape = yupObject().shape({
    scheme: yupString().required(
      i18next.t("A scheme is required for each identifier")
    ),
    identifier: yupString()
      .required(i18next.t("A value is required for each identifier"))
      .validIdentifierForScheme(creatorSchemeIds)
      .matches(/(?!\s).+/, {
        disallowEmptyString: true,
        message: i18next.t("Identifier cannot be blank"),
      }),
  });

  const recordIdentifiersShape = yupObject().shape({
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
  });

  const locationIdentifiersShape = yupObject().shape({
    scheme: yupString().required(
      i18next.t("A scheme is required for each identifier")
    ),
    identifier: yupString()
      .required(i18next.t("A value is required for each identifier"))
      .validRecordIdentifierForScheme(locationSchemeIds)
      .matches(/(?!\s).+/, {
        disallowEmptyString: true,
        message: i18next.t("Identifier cannot be blank"),
      }),
  });

  /** Mirrors Invenio `ReferenceSchema` (scheme + optional identifier per `RDM_RECORDS_IDENTIFIERS_SCHEMES`). */
  const referenceEntryShape = yupObject().shape({
    reference: yupString().required(i18next.t("A reference is required")),
    scheme: yupString().test(
      "scheme-required-with-identifier",
      i18next.t("A scheme is required for each identifier"),
      function (value) {
        const ident = this.parent?.identifier;
        const hasId = ident != null && String(ident).trim() !== "";
        const hasScheme = value != null && String(value).trim() !== "";
        if (hasId && !hasScheme) return false;
        return true;
      }
    ),
    identifier: yupString().when("scheme", {
      is: (scheme) => scheme != null && String(scheme).trim() !== "",
      then: (schema) =>
        schema
          .required(i18next.t("A value is required for each identifier"))
          .validRecordIdentifierForScheme(recordSchemeIds)
          .matches(/(?!\s).+/, {
            disallowEmptyString: true,
            message: i18next.t("Identifier cannot be blank"),
          }),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const personOrOrgShape = yupObject().shape({
    type: yupString().required(i18next.t("A type is required")),
    family_name: yupString()
      .when("type", {
        is: "personal",
        then: (schema) =>
          schema
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
        then: (schema) =>
          schema
            .matches(/(?!\s).+/, i18next.t("Name cannot be blank"))
            .required(i18next.t("A name is required")),
      }),
    identifiers: yupArray().of(creatorIdentifiersShape),
  });

  const creatorContributorRowShape = yupObject().shape({
    affiliations: yupArray().of(
      yupObject()
        .shape({
          id: yupString(),
          name: yupString(),
        })
        .test(
          "id-or-name",
          i18next.t("An existing id or a free text name must be present."),
          (val) =>
            !val ||
            !!String(val?.id ?? "").trim() ||
            !!String(val?.name ?? "").trim()
        )
    ),
    person_or_org: personOrOrgShape,
    role: yupString().required(
      i18next.t("A role is required for each contributor")
    ),
  });

  const additionalTitleTypeSchema = titleTypeValues.length
    ? yupString().required(i18next.t("A type is required")).oneOf(titleTypeValues)
    : yupString().required(i18next.t("A type is required"));

  /** Mirrors `DateSchema` (`date` + `type` required); uses same `.edtf()` / `.dateInSequence()` as `publication_date`. */
  const additionalDateTypeSchema = dateTypeValues.length
    ? yupString()
        .required(i18next.t("A type is required for each date"))
        .oneOf(dateTypeValues)
    : yupString().required(i18next.t("A type is required for each date"));

  return yupObject().shape({
    access: accessSchema, 
    // Backend schema: `pids` is a dict of PID schemes (e.g. `pids: { doi: {...} }`).
    // Yup 0.32: `.optional()` on nested objects still validates missing keys; use `lazy`
    // so we only run `PIDSchema` when `pids.doi` is present (non-null).
    pids: yupObject()
      .shape({
        doi: yupLazy((value) =>
          value == null ? mixed().notRequired() : pidEntrySchema
        ),
      })
      .notRequired(),
    custom_fields: yupObject().shape({}),
    metadata: yupObject()
      .shape({
        creators: yupArray()
          .of(creatorContributorRowShape)
          .min(1, i18next.t("At least one contributor must be listed"))
          .required(i18next.t("At least one contributor must be listed")),
        contributors: yupArray().of(creatorContributorRowShape),
        identifiers: yupArray().of(recordIdentifiersShape),
        related_identifiers: yupArray().of(
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
            relation_type: yupString(),
            resource_type: yupString(),
          })
        ),
        locations: yupObject().shape({
          features: yupArray().of(
            yupObject().shape({
              geometry: mixed().nullable(),
              place: yupString(),
              identifiers: yupArray().of(locationIdentifiersShape),
              description: yupString(),
            })
          ),
        }),
        references: yupArray().of(referenceEntryShape),
        dates: yupArray().of(
          yupObject().shape({
            date: yupString()
              .edtf()
              .dateInSequence()
              .required(i18next.t("A date is required for each date entry")),
            type: additionalDateTypeSchema,
            description: yupString(),
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
      // Formik stores the vocabulary id string (see stock `ResourceTypeField` / SelectField).
      resource_type: yupString()
        .required(i18next.t("A resource type is required"))
        .matches(/(?!\s).+/, i18next.t("Resource type cannot be blank")),
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
