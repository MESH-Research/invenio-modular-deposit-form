/**
 * Builds a flat array of section entries for FormFeedback from config.common_fields and config.fields_by_type.
 * Each entry: { pageId, sectionId, pageLabel, sectionLabel, fields, resourceTypes }.
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
  for (const [resourceTypeId, typeConfig] of Object.entries(byType)) {
    if (!typeConfig || typeof typeConfig !== "object") continue;
    for (const [pageId, subsectionList] of Object.entries(typeConfig)) {
      if (!Array.isArray(subsectionList)) continue;
      const pageLabel = formPages.find((p) => p.section === pageId)?.label ?? pageId;
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
  return sections;
}

export { buildFormSections };
