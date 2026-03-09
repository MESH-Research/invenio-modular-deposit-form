#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_RESOURCE_TYPE = "publication-article"

INVENIO_MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP = True
"""When True, a full-width region above the form title shows the stock community 
banner (CommunityHeader) when the deposit state would show it (e.g. community 
selected or selectable)."""

INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS = [
    {
        "section": "top",
        "component": "FormPages",
        "subsections": [
            {
                "section": "page-1",
                "label": "Type & Title",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "resource_type",
                        "label": "Resource Type",
                        "component": "ResourceTypeComponent",
                    },
                    {
                        "section": "doi",
                        "label": "Digital Object Identifier",
                        "component": "DoiComponent",
                    },
                    {
                        "section": "combined_titles",
                        "label": "Title",
                        "component": "TitlesComponent",
                    },
                    {
                        "section": "combined_dates",
                        "label": "Dates",
                        "component": "CombinedDatesComponent",
                    },
                    {
                        "section": "abstract",
                        "label": "Description",
                        "component": "AbstractComponent",
                    },
                    {
                        "section": "additional_descriptions",
                        "label": "Additional descriptions",
                        "component": "AdditionalDescriptionComponent",
                    },
                    {
                        "section": "version",
                        "label": "Version",
                        "component": "VersionComponent",
                    },
                ],
            },
            {
                "section": "page-2",
                "label": "Submission Details",
                "subsections": [
                    {
                        "section": "publisher",
                        "label": "Publisher",
                        "component": "PublisherComponent",
                    },
                    {
                        "section": "language",
                        "label": "Language",
                        "component": "LanguagesComponent",
                    },
                    {
                        "section": "alternate_identifiers",
                        "label": "Alternate Identifiers",
                        "component": "AlternateIdentifiersComponent",
                    },
                    {
                        "section": "sizes",
                        "label": "Sizes",
                        "component": "SizesComponent",
                    },
                ],
            },
            {
                "section": "page-2-publication",
                "label": "Publication & other metadata",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "journal_title",
                        "label": "Journal title",
                        "component": "JournalTitleComponent",
                    },
                    {
                        "section": "journal_issn",
                        "label": "Journal ISSN",
                        "component": "JournalISSNComponent",
                    },
                    {
                        "section": "journal_volume",
                        "label": "Journal volume",
                        "component": "JournalVolumeComponent",
                    },
                    {
                        "section": "journal_issue",
                        "label": "Journal issue",
                        "component": "JournalIssueComponent",
                    },
                    {
                        "section": "journal_pages",
                        "label": "Article pages",
                        "component": "SectionPagesComponent",
                    },
                    {
                        "section": "imprint_title",
                        "label": "Book title",
                        "component": "BookTitleComponent",
                    },
                    {
                        "section": "imprint_isbn",
                        "label": "ISBN",
                        "component": "ISBNComponent",
                    },
                    {
                        "section": "imprint_place",
                        "label": "Publication location",
                        "component": "PublicationLocationComponent",
                    },
                    {
                        "section": "imprint_pages",
                        "label": "Total pages",
                        "component": "TotalPagesComponent",
                    },
                    {
                        "section": "meeting_title",
                        "label": "Meeting title",
                        "component": "MeetingTitleComponent",
                    },
                    {
                        "section": "meeting_acronym",
                        "label": "Meeting acronym",
                        "component": "MeetingAcronymComponent",
                    },
                    {
                        "section": "meeting_dates",
                        "label": "Meeting dates",
                        "component": "MeetingDatesComponent",
                    },
                    {
                        "section": "meeting_place",
                        "label": "Meeting place",
                        "component": "MeetingPlaceComponent",
                    },
                    {
                        "section": "meeting_session",
                        "label": "Meeting session",
                        "component": "MeetingSessionComponent",
                    },
                    {
                        "section": "meeting_session_part",
                        "label": "Meeting session part",
                        "component": "MeetingSessionPartComponent",
                    },
                    {
                        "section": "meeting_url",
                        "label": "Meeting URL",
                        "component": "MeetingURLComponent",
                    },
                    {
                        "section": "thesis_university",
                        "label": "University",
                        "component": "UniversityComponent",
                    },
                    {
                        "section": "thesis_department",
                        "label": "Department",
                        "component": "ThesisDepartmentComponent",
                    },
                    {
                        "section": "thesis_type",
                        "label": "Thesis type",
                        "component": "ThesisTypeComponent",
                    },
                    {
                        "section": "thesis_date_submitted",
                        "label": "Date submitted",
                        "component": "ThesisDateSubmittedComponent",
                    },
                    {
                        "section": "thesis_date_defended",
                        "label": "Date defended",
                        "component": "ThesisDateDefendedComponent",
                    },
                    {
                        "section": "code_development_status",
                        "label": "Development status",
                        "component": "CodeDevelopmentStatusComponent",
                    },
                    {
                        "section": "code_repository",
                        "label": "Code repository",
                        "component": "CodeRepositoryComponent",
                    },
                    {
                        "section": "code_programming_language",
                        "label": "Programming language",
                        "component": "CodeProgrammingLanguageComponent",
                    },
                ],
            },
            {
                "section": "page-3",
                "label": "Contributors & Funding",
                "subsections": [
                    {
                        "section": "creators",
                        "label": "Creators",
                        "component": "CreatorsComponent",
                    },
                    {
                        "section": "contributors",
                        "label": "Contributors",
                        "component": "ContributorsComponent",
                    },
                    {
                        "section": "funding",
                        "label": "Funding",
                        "component": "FundingComponent",
                    },
                ],
            },
            {
                "section": "page-4",
                "label": "Make It Findable",
                "subsections": [
                    {
                        "section": "subjects_keywords",
                        "label": "Subjects",
                        "component": "SubjectsComponent",
                    },
                    {
                        "section": "related_works",
                        "label": "Related Works",
                        "component": "RelatedWorksComponent",
                    },
                ],
            },
            {
                "section": "page-5",
                "label": "Access",
                "subsections": [
                    {
                        "section": "communities",
                        "label": "Communities",
                        "component": "CommunitiesComponent",
                    },
                    {
                        "section": "access",
                        "label": "Access",
                        "component": "AccessComponent",
                    },
                ],
            },
            {
                "section": "page-6",
                "label": "Files",
                "subsections": [
                    {
                        "section": "file_upload",
                        "label": "Files Upload",
                        "component": "FileUploadComponent",
                    },
                    {
                        "section": "licenses",
                        "label": "Licenses",
                        "component": "LicensesComponent",
                    },
                    {
                        "section": "copyright",
                        "label": "Copyright",
                        "component": "CopyrightsComponent",
                    },
                ],
            },
            {
                "section": "page-7",
                "label": "Publish",
                "subsections": [
                    {
                        "section": "submit_actions",
                        "label": "Publish",
                        "component": "SubmissionComponent",
                    },
                ],
            },
        ],
    }
]

# Keys must match resource type IDs from invenio-rdm-records default vocabulary
# (invenio_rdm_records/fixtures/data/vocabularies/resource_types.yaml).
# Omit resource types you are not customizing; missing keys fall back to common layout.
INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = {}

# Keys must match resource type IDs from your instance's resource_types vocabulary.
# Omit resource types you are not customizing; missing keys use default labels/icons/etc.
INVENIO_MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS = {
    "publication-article": {"metadata.title": "Article title"},
    "publication-book": {"metadata.title": "Book title"},
    "publication-section": {"metadata.title": "Chapter/section title"},
    "dataset": {"metadata.title": "Dataset title"},
    "software": {"metadata.title": "Software name"},
    "software-computationalnotebook": {"metadata.title": "Notebook name"},
}

INVENIO_MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES = {}

INVENIO_MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES = {
    "audio": {"metadata.creators.role": None}
}

INVENIO_MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS = {}
