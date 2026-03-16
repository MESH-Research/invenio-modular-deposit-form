/**
 * Helpers for errors that lie in section fields only visible under another resource type.
 * Uses section error paths from formUIState (sectionErrorsFlagged) and visible fields from
 * formSectionFields for the current resource type.
 */

import { fieldMatches } from "../utils";

/**
 * From this section's error paths (from sectionErrorsByKey) and the section's visible fields
 * for the current resource type (from sectionsConfig), get paths that are in the section
 * but not visible for the current type ("hidden"), and a minimum set of resource type ids
 * to switch to in order to see them.
 *
 * @param {string} pageId
 * @param {string} sectionId
 * @param {string[]} sectionErrorPaths - error paths already attributed to this section (e.g. sectionErrors.error_fields)
 * @param {Array} sectionsConfig - formSectionFields from buildFormSections
 * @param {string} currentResourceType
 * @returns {{ hiddenPaths: string[], minResourceTypes: string[] }}
 */
function getHiddenErrorsInSection(pageId, sectionId, sectionErrorPaths, sectionsConfig, currentResourceType) {
  const config = Array.isArray(sectionsConfig) ? sectionsConfig : [];
  const paths = Array.isArray(sectionErrorPaths) ? sectionErrorPaths : [];
  const sectionEntries = config.filter(
    (e) => (e.pageId ?? "") === pageId && (e.sectionId ?? "") === sectionId
  );
  if (sectionEntries.length === 0 || paths.length === 0) return { hiddenPaths: [], minResourceTypes: [] };

  const currentEntry =
    currentResourceType && sectionEntries.length > 1
      ? sectionEntries.find((s) => (s.resourceTypes || []).includes(currentResourceType)) ?? sectionEntries[0]
      : sectionEntries[0];
  const currentFields = currentEntry.fields ?? [];

  const hiddenPaths = paths.filter(
    (path) => !currentFields.some((f) => fieldMatches(path, f))
  );
  if (hiddenPaths.length === 0) return { hiddenPaths: [], minResourceTypes: [] };

  const minResourceTypes = minResourceTypesToCoverHiddenPaths(
    hiddenPaths,
    sectionEntries,
    currentEntry
  );
  return { hiddenPaths, minResourceTypes };
}

/**
 * Greedy set cover: minimum set of resource types such that every hidden path is covered.
 * Each section entry has resourceTypes: the list of type ids that use that entry's fields.
 * We build type -> paths by iterating entries and adding each entry's covered paths to
 * every type in its resourceTypes, then run greedy set cover.
 *
 * @param {string[]} hiddenPaths
 * @param {Array} sectionEntries - all entries for this (pageId, sectionId)
 * @param {Object} currentEntry - the entry for current resource type (excluded from cover)
 * @returns {string[]} resource type ids to suggest
 */
function minResourceTypesToCoverHiddenPaths(hiddenPaths, sectionEntries, currentEntry) {
  const otherEntries = sectionEntries.filter((e) => e !== currentEntry);
  if (otherEntries.length === 0) return [];

  const typeToPaths = new Map();
  for (const entry of otherEntries) {
    const fields = entry.fields ?? [];
    const covered = hiddenPaths.filter((p) =>
      fields.some((f) => fieldMatches(p, f))
    );
    if (covered.length === 0) continue;
    const types = entry.resourceTypes ?? [];
    for (const typeId of types) {
      if (!typeId) continue;
      if (!typeToPaths.has(typeId)) typeToPaths.set(typeId, new Set());
      covered.forEach((p) => typeToPaths.get(typeId).add(p));
    }
  }

  const uncovered = new Set(hiddenPaths);
  const result = [];
  while (uncovered.size > 0) {
    let bestType = null;
    let bestCount = 0;
    for (const [typeId, paths] of typeToPaths) {
      if (result.includes(typeId)) continue;
      let count = 0;
      for (const p of paths) {
        if (uncovered.has(p)) count += 1;
      }
      if (count > bestCount) {
        bestCount = count;
        bestType = typeId;
      }
    }
    if (!bestType) break;
    result.push(bestType);
    typeToPaths.get(bestType).forEach((p) => uncovered.delete(p));
  }
  return result;
}

export { getHiddenErrorsInSection, minResourceTypesToCoverHiddenPaths };
