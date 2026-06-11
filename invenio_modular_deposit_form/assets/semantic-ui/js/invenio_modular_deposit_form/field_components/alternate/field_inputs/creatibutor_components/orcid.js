// This file is part of Invenio-Modular-Deposit-Form
// Copyright (C) 2024-2025 Mesh Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see the LICENSE file for more details.
//
// Browser-direct ORCID Public API integration for the inline creatibutors family-name
// picker. Used as the `mergeExtraSource` of `RemoteSelectField` so ORCID hits are merged
// into the local `/api/names` autocomplete results without a backend proxy.
//
// Why browser-direct: ORCID's `expanded-search/` endpoint is open (no auth) and serves
// permissive CORS headers, so a proxy adds latency without value. Anonymous read quota is
// 25k requests/day per IP and our typical deposit-form traffic is well under that. See
// `docs/.../orcid-integration.md` (TODO) for the full policy / scale analysis.
//
// Result mapping: each ORCID hit becomes a Names-vocabulary-shaped record carrying
// `family_name`, `given_name`, `identifiers: [{scheme:"orcid", ...}]`, and `affiliations`,
// so the existing `onPersonSearchChange` autofill handler in `CreatibutorsInlineForm.js`
// copies all of it straight into `metadata.<creators|contributors>[i].person_or_org` —
// from there it serializes with the saved draft and is available server-side for cited-stub
// creation.
//
// De-dup: any ORCID hit whose iD is already present on a local Names hit is dropped so the
// dropdown doesn't show the same person twice (local row wins because it preserves the
// existing Names id and may carry richer `affiliations` from past sync).

import axios from "axios";

const ORCID_EXPANDED_SEARCH_URL = "https://pub.orcid.org/v3.0/expanded-search/";
const MIN_QUERY_LENGTH = 4;
const ORCID_PAGE_SIZE = 10;

// Strip any `https://[sandbox.]orcid.org/` prefix and trim, leaving the bare iD for
// case-insensitive comparison against local-hit identifiers.
const normalizeOrcid = (raw) => {
  if (!raw) return "";
  return String(raw)
    .trim()
    .replace(/^https?:\/\/(?:sandbox\.)?orcid\.org\//i, "");
};

// `expanded-search` returns `institution-name` as either an array of strings or omitted.
const toInstitutionList = (raw) => {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return [raw];
  return [];
};

// Map one `expanded-result` entry into the Names-vocabulary record shape that
// `AffiliationsSuggestions` (the dropdown serializer) and `onPersonSearchChange`
// (the autofill handler) both expect.
//
// `name` precedence: ORCID's `credit-name` (the researcher's chosen citation form,
// which correctly handles particles like "van der", suffixes, mononyms, and
// non-Western name ordering) > naive `"family, given"` composition > bare ORCID
// iD. The KCWorks server-side `KCWorksPersonOrOrganizationSchema` preserves this
// `name` end-to-end instead of re-clobbering it on draft save.
export function orcidHitToNameRecord(hit) {
  const family = hit?.["family-names"] ?? "";
  const given = hit?.["given-names"] ?? "";
  const orcid = hit?.["orcid-id"] ?? "";
  const creditName = (hit?.["credit-name"] ?? "").trim();
  const institutions = toInstitutionList(hit?.["institution-name"]);
  const fullName =
    creditName || [family, given].filter(Boolean).join(", ") || orcid;
  return {
    id: `orcid:${orcid}`,
    name: fullName,
    given_name: given,
    family_name: family,
    identifiers: orcid ? [{ scheme: "orcid", identifier: orcid }] : [],
    affiliations: institutions.map((n) => ({ name: n })),
  };
}

// `RemoteSelectField` `mergeExtraSource` contract: receives a *promise* of local hits and
// the (preSearchChange-normalized) query, returns a promise of extra hits to merge into the
// dropdown after local hits have already painted. Soft-fails: any error returns `[]` so the
// local list is never lost.
export function fetchOrcidPersonSuggestions(localHitsPromise, query) {
  const q = (query || "").trim();
  if (q.length < MIN_QUERY_LENGTH) return Promise.resolve([]);

  const orcidPromise = axios
    .get(ORCID_EXPANDED_SEARCH_URL, {
      params: { q, rows: ORCID_PAGE_SIZE, start: 0 },
      headers: { Accept: "application/json" },
    })
    .then((resp) => resp?.data?.["expanded-result"] ?? [])
    .catch((e) => {
      console.warn("ORCID expanded-search failed:", e);
      return [];
    });

  return Promise.all([localHitsPromise, orcidPromise]).then(
    ([localHits, orcidHits]) => {
      const localOrcids = new Set(
        (localHits ?? []).flatMap((h) =>
          (h.identifiers ?? [])
            .filter((i) => (i.scheme || "").toLowerCase() === "orcid")
            .map((i) => normalizeOrcid(i.identifier))
            .filter(Boolean)
        )
      );
      return orcidHits
        .filter((hit) => {
          const id = normalizeOrcid(hit?.["orcid-id"]);
          return id && !localOrcids.has(id);
        })
        .map(orcidHitToNameRecord);
    }
  );
}
