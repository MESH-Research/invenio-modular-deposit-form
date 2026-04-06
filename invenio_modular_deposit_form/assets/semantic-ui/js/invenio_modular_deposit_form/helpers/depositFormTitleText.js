// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_modular_deposit_form/i18next";

export function makeSelectedCommunityLabel(selectedCommunity) {
  let selectedCommunityLabel = selectedCommunity?.metadata?.title;
  if (!!selectedCommunityLabel && !selectedCommunityLabel?.toLowerCase().includes("community")) {
    selectedCommunityLabel = `the "${selectedCommunityLabel}" community`;
  }
  return selectedCommunityLabel;
}

export function makeFormHeading(record) {
  const isNewVersionDraft = record?.status === "new_version_draft";
  const recordState =
    record?.id != null
      ? isNewVersionDraft
        ? i18next.t("New Version of ")
        : i18next.t("Updating ")
      : i18next.t("New ");
  const recordType = ["draft", "draft_with_review"].includes(record?.status)
    ? i18next.t("Draft Record")
    : i18next.t("Published Record");
  return `${recordState} ${recordType}`;
}
