// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { RESOURCE_TYPE_FAMILY_EDGES } from "../constants";

/**
 * Family token for a resource type id: segment before the first `-`, or the
 * whole id when unhyphenated (`publication-article` → `publication`,
 * `poster` → `poster`).
 *
 * @param {string} typeId
 * @returns {string}
 */
function resourceTypeFamily(typeId) {
  if (!typeId || typeof typeId !== "string") return "";
  const dash = typeId.indexOf("-");
  return dash === -1 ? typeId : typeId.slice(0, dash);
}

/**
 * @param {ReadonlyArray<readonly [string, string]>} edges
 * @returns {Map<string, Set<string>>}
 */
function buildFamilyAdjacency(edges) {
  const adj = new Map();
  for (const pair of edges ?? []) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const [a, b] = pair;
    if (!a || !b || a === b) continue;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  }
  return adj;
}

const DEFAULT_FAMILY_ADJACENCY = buildFamilyAdjacency(RESOURCE_TYPE_FAMILY_EDGES);

/**
 * BFS hop distance between two family tokens over the proximity graph.
 * Same family → `0`; unreachable → `Infinity`.
 *
 * @param {string} fromFamily
 * @param {string} toFamily
 * @param {Map<string, Set<string>>} [adjacency]
 * @returns {number}
 */
function familyDistance(fromFamily, toFamily, adjacency = DEFAULT_FAMILY_ADJACENCY) {
  if (!fromFamily || !toFamily) return Number.POSITIVE_INFINITY;
  if (fromFamily === toFamily) return 0;
  const adj = adjacency ?? DEFAULT_FAMILY_ADJACENCY;
  const queue = [fromFamily];
  const dist = new Map([[fromFamily, 0]]);
  while (queue.length > 0) {
    const node = queue.shift();
    const d = dist.get(node);
    for (const next of adj.get(node) ?? []) {
      if (dist.has(next)) continue;
      const nextDist = d + 1;
      if (next === toFamily) return nextDist;
      dist.set(next, nextDist);
      queue.push(next);
    }
  }
  return Number.POSITIVE_INFINITY;
}

/**
 * Proximity distance from the current resource type to a candidate.
 * Same hyphen-prefix family → `0`; else BFS over {@link RESOURCE_TYPE_FAMILY_EDGES}.
 *
 * @param {string} currentTypeId
 * @param {string} candidateTypeId
 * @param {Map<string, Set<string>>} [adjacency]
 * @returns {number}
 */
function resourceTypeProximityDistance(
  currentTypeId,
  candidateTypeId,
  adjacency = DEFAULT_FAMILY_ADJACENCY
) {
  return familyDistance(
    resourceTypeFamily(currentTypeId),
    resourceTypeFamily(candidateTypeId),
    adjacency
  );
}

/**
 * Pick up to `maxCount` items evenly spaced across an already-ordered array.
 *
 * @template T
 * @param {T[]} orderedItems
 * @param {number} maxCount
 * @returns {T[]}
 */
function scatterSample(orderedItems, maxCount) {
  const items = Array.isArray(orderedItems) ? orderedItems : [];
  const limit = Math.max(0, Math.floor(maxCount));
  if (limit === 0 || items.length === 0) return [];
  if (items.length <= limit) return [...items];
  if (limit === 1) {
    return [items[Math.floor((items.length - 1) / 2)]];
  }
  const picked = [];
  const seen = new Set();
  for (let i = 0; i < limit; i++) {
    const index = Math.round((i * (items.length - 1)) / (limit - 1));
    if (seen.has(index)) continue;
    seen.add(index);
    picked.push(items[index]);
  }
  return picked;
}

/**
 * Rank covering resource types by proximity to `currentTypeId`, then take up to
 * `maxSuggestions` filling nearest distance bands first. Within a band, sort by
 * `getLabel`; if a band has more types than remaining slots, scatter-sample it.
 *
 * @param {string} currentTypeId
 * @param {string[]} candidateTypeIds
 * @param {{
 *   getLabel?: (typeId: string) => string,
 *   maxSuggestions?: number,
 *   edges?: ReadonlyArray<readonly [string, string]>,
 * }} [options]
 * @returns {string[]}
 */
function rankAndSampleByProximity(currentTypeId, candidateTypeIds, options = {}) {
  const {
    getLabel = (typeId) => typeId,
    maxSuggestions = 5,
    edges,
  } = options;
  const candidates = Array.isArray(candidateTypeIds) ? candidateTypeIds : [];
  if (candidates.length === 0 || maxSuggestions <= 0) return [];

  const adjacency =
    edges != null ? buildFamilyAdjacency(edges) : DEFAULT_FAMILY_ADJACENCY;

  /** @type {Map<number, string[]>} */
  const bands = new Map();
  for (const typeId of candidates) {
    if (!typeId) continue;
    const dist = resourceTypeProximityDistance(currentTypeId, typeId, adjacency);
    const key = Number.isFinite(dist) ? dist : Number.POSITIVE_INFINITY;
    if (!bands.has(key)) bands.set(key, []);
    bands.get(key).push(typeId);
  }

  const sortedDistances = [...bands.keys()].sort((a, b) => a - b);
  const result = [];
  for (const dist of sortedDistances) {
    const remaining = maxSuggestions - result.length;
    if (remaining <= 0) break;
    const band = bands.get(dist).sort((a, b) =>
      String(getLabel(a)).localeCompare(String(getLabel(b)), undefined, {
        sensitivity: "base",
      })
    );
    if (band.length <= remaining) {
      result.push(...band);
    } else {
      result.push(...scatterSample(band, remaining));
    }
  }
  return result;
}

export {
  buildFamilyAdjacency,
  familyDistance,
  rankAndSampleByProximity,
  resourceTypeFamily,
  resourceTypeProximityDistance,
};
