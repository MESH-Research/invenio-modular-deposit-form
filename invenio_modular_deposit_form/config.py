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
        "component": "FormHeader",
        "subsections": [
            {"component": "FormStepper", "classnames": "mobile tablet only"},
        ],
    },
    {
        "component": "FormLeftSidebar",
        # Sidebar widths: 2 (widescreen), 3 (largeScreen), 3 (computer)
        "computer": 3,
        "largeScreen": 3,
        "widescreen": 2,
        "subsections": [
            # Visibility class: use "large-monitor" (hyphen) for invenio-theme; width props use largeScreen (camelCase)
            {
                "component": "FormSidebarPageMenu",
                "classnames": "computer widescreen large-monitor only",
            },
        ],
    },
    {
        "component": "FormRightSidebar",
        # Sidebar widths: 4 (widescreen), 4 (largeScreen), 5 (computer)
        "computer": 5,
        "largeScreen": 4,
        "widescreen": 4,
        "subsections": [
            {
                "section": "form_feedback",
                "component": "FormFeedbackComponent",
            },
            {
                "section": "submit_actions",
                "label": "Publish",
                "component": "SubmissionComponent",
            },
            {
                "section": "access",
                "label": "Visibility",
                "component": "AccessRightsComponent",
            },
        ],
    },
    {
        "component": "FormFooter",
        "subsections": [
            {"component": "FormPageNavigationFooter"},
        ],
    },
    {
        "section": "pages",
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
                        "component": "SectionWrapper",
                        "show_heading": True,
                        "subsections": [
                            {
                                "section": "publication_date",
                                "label": "Publication Date",
                                "component": "PublicationDateComponent",
                            },
                            {
                                "section": "other_dates",
                                "label": "Additional Dates",
                                "component": "AdditionalDatesComponent",
                                "show_heading": False,
                            },
                        ],
                    },
                    {
                        "section": "abstract",
                        "label": "Description",
                        "component": "AbstractComponent",
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
                "section": "page-3",
                "label": "Publication & other metadata",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "journal",
                        "label": "Journal",
                        "component": "CombinedJournalComponent",
                    },
                    {
                        "section": "imprint",
                        "label": "Book / Report / Conference proceedings",
                        "component": "CombinedImprintComponent",
                    },
                    {
                        "section": "meeting",
                        "label": "Conference",
                        "component": "CombinedMeetingComponent",
                    },
                    {
                        "section": "thesis",
                        "label": "Thesis",
                        "component": "CombinedThesisComponent",
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
                "section": "page-4",
                "label": "Contributors & Funding",
                "component": "FormPage",
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
                "section": "page-5",
                "label": "Make It Findable",
                "component": "FormPage",
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
                "section": "page-6",
                "label": "Access",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "communities",
                        "label": "Communities",
                        "component": "CommunitiesComponent",
                    },
                ],
            },
            {
                "section": "page-7",
                "label": "Files",
                "component": "FormPage",
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
        ],
    },
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
