import i18next from "i18next";

// FIXME: The untranslated fallback values are a hack until translations are available
const readableFieldLabels = {
  "files.enabled": i18next.t("Files") || "Files",
  "custom_fields.kcr:ai_usage.ai_used": i18next.t("AI used") || "AI used",
  "custom_fields.kcr:ai_usage.description": i18next.t("AI used") || "AI used",
  "metadata.resource_type": i18next.t("Resource type") || "Resource type",
  "metadata.title": i18next.t("Title") || "Title",
  "metadata.additional_titles": i18next.t("Additional titles") || "Additional titles",
  "metadata.publication_date": i18next.t("Publication date") || "Publication date",
  "metadata.creators": i18next.t("Creators/Contributors") || "Creators/Contributors",
  "metadata.contributors": i18next.t("Creators/Contributors") || "Creators/Contributors",
  "metadata.description": i18next.t("Abstract/Description") || "Abstract/Description",
  "metadata.additional_descriptions": i18next.t("Additional descriptions") || "Additional descriptions",
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
  "pids": i18next.t("DOI") || "DOI",
};

export { readableFieldLabels };
