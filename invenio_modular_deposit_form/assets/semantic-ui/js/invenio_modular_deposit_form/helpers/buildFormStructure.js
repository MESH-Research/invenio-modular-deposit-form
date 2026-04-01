/**
 * Builds a flat array of section entries for FormFeedback from config.common_fields and config.fields_by_type.
 * Each entry: { pageId, sectionId, pageLabel, sectionLabel, fields, resourceTypes }.
 * pageLabel is the common FormPage label when present, else pageId (type-specific stepper labels
 * live on form UI state `resolvedFormPages`, used by FormFeedbackSummary).
 * resourceTypes is an array of resource type ids that include this section in their overrides (empty for base-only).
 */

import { flattenWrappers } from "../utils";

function getFieldPathsForSubsection(subsection, registry) {
  if (!subsection) return [];
  if (
    (subsection.component === "FormSection" ||
      subsection.component === "SectionWrapper") &&
    Array.isArray(subsection.subsections)
  ) {
    const flat = flattenWrappers({ subsections: subsection.subsections });
    return flat.reduce(
      (acc, item) => acc.concat(Array.isArray(registry?.[item.component]?.[1]) ? registry[item.component][1] : []),
      []
    );
  }
  const paths = registry?.[subsection.component]?.[1];
  return Array.isArray(paths) ? [...paths] : [];
}

function fieldsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/**
 * Inherits subsection list from another type via `same_as` (no own `subsections` key on this row).
 */
function inheritsSubsectionsViaSameAs(pageVal) {
  if (pageVal == null || typeof pageVal !== "object" || Array.isArray(pageVal)) return false;
  if (typeof pageVal.same_as !== "string" || pageVal.same_as.trim() === "") return false;
  return !Object.prototype.hasOwnProperty.call(pageVal, "subsections");
}

/**
 * For each `same_as`-only page, append this resource type to every section row on that page that
 * already lists the `same_as` target in `resourceTypes`. Repeats until stable so chains work in any
 * `fields_by_type` key order.
 */
function appendResourceTypesForSameAsOnlyPages(sections, fieldsByType) {
  const byType = fieldsByType ?? {};
  let changed = true;
  while (changed) {
    changed = false;
    for (const [resourceTypeId, typePageConfigs] of Object.entries(byType)) {
      if (!typePageConfigs || typeof typePageConfigs !== "object") continue;
      for (const [pageId, pageVal] of Object.entries(typePageConfigs)) {
        if (!inheritsSubsectionsViaSameAs(pageVal)) continue;
        const target = pageVal.same_as.trim();
        if (target === "") continue;
        for (const entry of sections) {
          if (entry.pageId !== pageId) continue;
          if (!entry.resourceTypes.includes(target)) continue;
          if (!entry.resourceTypes.includes(resourceTypeId)) {
            entry.resourceTypes.push(resourceTypeId);
            changed = true;
          }
        }
      }
    }
  }
}

function sectionEntriesForSubsections(subsections, registry, pageId, pageLabel, resourceTypeId = null) {
  const resourceTypes = resourceTypeId != null ? [resourceTypeId] : [];
  const out = [];
  for (const sub of subsections ?? []) {
    const sectionId = sub.section;
    out.push({
      pageId,
      sectionId,
      pageLabel,
      sectionLabel: sub.label ?? sectionId,
      fields: getFieldPathsForSubsection(sub, registry),
      resourceTypes: [...resourceTypes],
    });
  }
  return out;
}

function buildFormSections(commonFields, fieldsByType, registry) {
  const sections = [];
  const registrySafe = registry ?? {};
  const formPages = Array.isArray(commonFields)
    ? (commonFields.find((item) => item.component === "FormPages")?.subsections ?? [])
    : [];
  for (const page of formPages) {
    sections.push(
      ...sectionEntriesForSubsections(
        page?.subsections,
        registrySafe,
        page.section,
        page?.label ?? page.section
      )
    );
  }
  const byType = fieldsByType ?? {};
  for (const [resourceTypeId, typePageConfigs] of Object.entries(byType)) {
    if (!typePageConfigs || typeof typePageConfigs !== "object") continue;
    for (const [pageId, pageVal] of Object.entries(typePageConfigs)) {
      if (!pageVal || typeof pageVal !== "object" || Array.isArray(pageVal)) continue;
      if (inheritsSubsectionsViaSameAs(pageVal)) continue;
      const subsectionList = Array.isArray(pageVal.subsections) ? pageVal.subsections : null;
      if (!Array.isArray(subsectionList) || subsectionList.length === 0) continue;
      const pageMeta = formPages.find((p) => p.section === pageId);
      const pageLabel = pageMeta?.label ?? pageId;
      const newEntries = sectionEntriesForSubsections(
        subsectionList,
        registrySafe,
        pageId,
        pageLabel,
        resourceTypeId
      );
      for (const entry of newEntries) {
        const existing = sections.find(
          (s) => s.pageId === entry.pageId && s.sectionId === entry.sectionId && fieldsEqual(s.fields, entry.fields)
        );
        if (existing) {
          if (!existing.resourceTypes.includes(entry.resourceTypes[0])) {
            existing.resourceTypes.push(entry.resourceTypes[0]);
          }
        } else {
          sections.push(entry);
        }
      }
    }
  }
  appendResourceTypesForSameAsOnlyPages(sections, byType);
  return sections;
}

export { buildFormSections };
