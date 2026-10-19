import i18next from "i18next";

// FIXME: The untranslated fallback values are a hack until translations are available.
// Core metadata / access / PID paths (not in custom_fields.ui). Custom-field paths
// prefer labels from deposit config `custom_fields.ui` when that array is passed to
// `getReadableFieldLabel`; the custom_fields.* entries below remain as fallback.
const readableFieldLabels = {
  "files.enabled": i18next.t("Files") || "Files",
  "metadata.resource_type": i18next.t("Resource type") || "Resource type",
  "metadata.title": i18next.t("Title") || "Title",
  "metadata.additional_titles": i18next.t("Additional titles") || "Additional titles",
  "metadata.publication_date": i18next.t("Publication date") || "Publication date",
  "metadata.creators": i18next.t("Creators/Contributors") || "Creators/Contributors",
  "metadata.contributors": i18next.t("Creators/Contributors") || "Creators/Contributors",
  "metadata.description": i18next.t("Abstract/Description") || "Abstract/Description",
  "metadata.additional_descriptions":
    i18next.t("Additional descriptions") || "Additional descriptions",
  "metadata.rights": i18next.t("Licenses") || "Licenses",
  "metadata.languages": i18next.t("Languages") || "Languages",
  "metadata.dates": i18next.t("Dates") || "Dates",
  "metadata.funding": i18next.t("Funding") || "Funding",
  "metadata.version": i18next.t("Version") || "Version",
  "metadata.publisher": i18next.t("Publisher") || "Publisher",
  "metadata.related_identifiers": i18next.t("Related works") || "Related works",
  "metadata.references": i18next.t("References") || "References",
  "metadata.identifiers": i18next.t("Alternate identifiers") || "Alternate identifiers",
  "metadata.subjects": i18next.t("Keywords and subjects") || "Keywords and subjects",
  "access.embargo.until": i18next.t("Embargo until") || "Embargo until",
  "pids.doi": i18next.t("DOI") || "DOI",
  pids: i18next.t("DOI") || "DOI",
  "custom_fields.journal:journal": i18next.t("Journal") || "Journal",
  "custom_fields.journal:journal.title": i18next.t("Journal title") || "Journal title",
  "custom_fields.journal:journal.issn": i18next.t("Journal ISSN") || "Journal ISSN",
  "custom_fields.journal:journal.volume": i18next.t("Journal volume") || "Journal volume",
  "custom_fields.journal:journal.issue": i18next.t("Journal issue") || "Journal issue",
  "custom_fields.journal:journal.pages": i18next.t("Journal pages") || "Journal pages",
  "custom_fields.imprint:imprint": i18next.t("Imprint") || "Imprint",
  "custom_fields.imprint:imprint.title": i18next.t("Book title") || "Book title",
  "custom_fields.imprint:imprint.isbn": i18next.t("ISBN") || "ISBN",
  "custom_fields.imprint:imprint.place": i18next.t("Place of publication") || "Place of publication",
  "custom_fields.imprint:imprint.pages": i18next.t("Total pages") || "Total pages",
  "custom_fields.meeting:meeting": i18next.t("Meeting") || "Meeting",
  "custom_fields.meeting:meeting.title": i18next.t("Meeting title") || "Meeting title",
  "custom_fields.meeting:meeting.acronym": i18next.t("Meeting acronym") || "Meeting acronym",
  "custom_fields.meeting:meeting.dates": i18next.t("Meeting dates") || "Meeting dates",
  "custom_fields.meeting:meeting.place": i18next.t("Meeting place") || "Meeting place",
  "custom_fields.meeting:meeting.session": i18next.t("Meeting session") || "Meeting session",
  "custom_fields.meeting:meeting.session_part":
    i18next.t("Meeting session part") || "Meeting session part",
  "custom_fields.meeting:meeting.url": i18next.t("Meeting URL") || "Meeting URL",
  "custom_fields.meeting:meeting.identifiers":
    i18next.t("Meeting identifiers") || "Meeting identifiers",
  "custom_fields.thesis:thesis": i18next.t("Thesis") || "Thesis",
  "custom_fields.thesis:thesis.university": i18next.t("University") || "University",
  "custom_fields.thesis:thesis.department": i18next.t("Department") || "Department",
  "custom_fields.thesis:thesis.type": i18next.t("Thesis type") || "Thesis type",
  "custom_fields.thesis:thesis.date_submitted":
    i18next.t("Date submitted") || "Date submitted",
  "custom_fields.thesis:thesis.date_defended":
    i18next.t("Date defended") || "Date defended",
  "custom_fields.code:developmentStatus":
    i18next.t("Development status") || "Development status",
  "custom_fields.code:codeRepository": i18next.t("Code repository") || "Code repository",
  "custom_fields.code:programmingLanguage":
    i18next.t("Programming language") || "Programming language",
};

const CUSTOM_FIELDS_PREFIX = "custom_fields.";

/**
 * Look up a label from deposit `custom_fields.ui` for a Formik path.
 *
 * Supports top-level UI field entries (`kcr:publication_url`) and compound
 * widgets whose subfield labels live under `props.<subfield>.label`
 * (`journal:journal` + `title` → `props.title.label`).
 *
 * @param {string} fieldPath - Full Formik path (usually `custom_fields.…`)
 * @param {Array<{fields?: Array}>|null|undefined} customFieldsUI
 * @returns {string|null}
 */
function getLabelFromCustomFieldsUI(fieldPath, customFieldsUI) {
  if (!Array.isArray(customFieldsUI) || !fieldPath?.startsWith(CUSTOM_FIELDS_PREFIX)) {
    return null;
  }
  const relative = fieldPath.slice(CUSTOM_FIELDS_PREFIX.length);
  if (!relative) return null;

  const fields = customFieldsUI.flatMap((section) => section?.fields ?? []);
  if (!fields.length) return null;

  let candidate = relative;
  let nestedPath = "";
  while (candidate) {
    const cfg = fields.find((f) => f?.field === candidate);
    if (cfg) {
      if (!nestedPath) {
        const label = cfg.props?.label;
        return label != null && String(label).trim() !== "" ? String(label) : null;
      }
      const parts = nestedPath.split(".");
      let node = cfg.props;
      for (const part of parts) {
        if (node == null || typeof node !== "object") {
          node = null;
          break;
        }
        node = node[part];
      }
      if (
        node &&
        typeof node === "object" &&
        node.label != null &&
        String(node.label).trim() !== ""
      ) {
        return String(node.label);
      }
      const parentLabel = cfg.props?.label;
      return parentLabel != null && String(parentLabel).trim() !== ""
        ? String(parentLabel)
        : null;
    }
    const lastDot = candidate.lastIndexOf(".");
    if (lastDot === -1) break;
    const stripped = candidate.slice(lastDot + 1);
    nestedPath = nestedPath ? `${stripped}.${nestedPath}` : stripped;
    candidate = candidate.slice(0, lastDot);
  }
  return null;
}

/**
 * Resolve a human-readable label for a Formik field path.
 *
 * Order per path segment (full path, then ancestors so
 * `metadata.creators.0.name` → Creators):
 *
 * 1. `custom_fields.ui` when provided (instance labels, including site `kcr:*`)
 * 2. Static `readableFieldLabels` map (core metadata + fallbacks)
 * 3. Raw `fieldPath`
 *
 * @param {string} fieldPath
 * @param {Array<{fields?: Array}>|null|undefined} [customFieldsUI] -
 *   `deposit.config.custom_fields.ui`
 * @returns {string}
 */
function getReadableFieldLabel(fieldPath, customFieldsUI) {
  if (!fieldPath || typeof fieldPath !== "string") return fieldPath ?? "";
  let path = fieldPath;
  while (path) {
    const fromUi = getLabelFromCustomFieldsUI(path, customFieldsUI);
    if (fromUi) return fromUi;
    const label = readableFieldLabels[path];
    if (label) return label;
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1) break;
    path = path.slice(0, lastDot);
  }
  return fieldPath;
}

export { getLabelFromCustomFieldsUI, getReadableFieldLabel, readableFieldLabels };
