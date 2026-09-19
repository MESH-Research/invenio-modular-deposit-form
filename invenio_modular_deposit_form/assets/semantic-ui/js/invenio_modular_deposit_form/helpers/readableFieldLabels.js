import i18next from "i18next";

// FIXME: The untranslated fallback values are a hack until translations are available
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

/**
 * Resolve a human-readable label for a Formik field path.
 * Tries the full path, then ancestors (so `metadata.creators.0.name` → Creators).
 *
 * @param {string} fieldPath
 * @returns {string}
 */
function getReadableFieldLabel(fieldPath) {
  if (!fieldPath || typeof fieldPath !== "string") return fieldPath ?? "";
  let path = fieldPath;
  while (path) {
    const label = readableFieldLabels[path];
    if (label) return label;
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1) break;
    path = path.slice(0, lastDot);
  }
  return fieldPath;
}

export { getReadableFieldLabel, readableFieldLabels };
