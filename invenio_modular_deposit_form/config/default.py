#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""A form layout configuration emulating the default InvenioRDM form, but with pages.

To use this layout, import it into your instance's invenio.cfg file and assign it as the
value for the common fields layout:

````
from invenio_modular_deposit_form.config.default import COMMON_FIELDS_DEFAULT_PAGED

MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
````

For the same multi-page body without a left sidebar and with a **top stepper on all
viewport sizes** (not only mobile/tablet), use
:data:`COMMON_FIELDS_DEFAULT_PAGED_TOP_STEPPER`.

To use the non-paged version, use COMMON_FIELD_DEFAULT_UNPAGED instead.
"""

_PAGED_FORM_HEADER_STEPPER_MOBILE_TABLET = {
    "component": "FormHeader",
    "classnames": "default-layout",
    "subsections": [
        {"component": "FormStepper", "classnames": "mobile tablet only"},
    ],
}

_PAGED_FORM_HEADER_STEPPER_TOP = {
    "component": "FormHeader",
    "classnames": "default-layout",
    "subsections": [{"component": "FormStepper"}],
}

_PAGED_FORM_LEFT_SIDEBAR = {
    "component": "FormLeftSidebar",
    "classnames": "default-layout",
    # Sidebar widths: 2 (widescreen), 3 (largeScreen), 3 (computer)
    "computer": 3,
    "largeScreen": 3,
    "widescreen": 2,
    "subsections": [
        {
            "component": "FormSidebarPageMenu",
            "classnames": "computer widescreen large-monitor only",
        },
    ],
}

_PAGED_FORM_RIGHT_SIDEBAR = {
    "component": "FormRightSidebar",
    "classnames": "default-layout",
    # Sidebar widths: 4 (widescreen), 4 (largeScreen), 5 (computer)
    "mobile": 16,
    "tablet": 16,
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
}

_PAGED_FORM_FOOTER = {
    "component": "FormFooter",
    "classnames": "basic default-layout",
    "subsections": [
        {"component": "FormPageNavigationBar"},
    ],
}

_PAGED_FORM_PAGES = {
    "section": "pages",
    "component": "FormPages",
    "classnames": "default-layout",
    "subsections": [
        {
            "section": "1",
            "label": "Files",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "files",
                    "label": "Files",
                    "component": "FormSection",
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "file_upload",
                            "label": "Files Upload",
                            "component": "FileUploadComponent",
                            "show_heading": True,
                        },
                    ],
                }
            ],
        },
        {
            "section": "2",
            "label": "Basic Information",
            "subsections": [
                {
                    "section": "basic-info",
                    "label": "Basic Information",
                    "component": "FormSection",
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "doi",
                            "label": "Digital Object Identifier",
                            "component": "DoiComponent",
                        },
                        {
                            "section": "resource_type",
                            "label": "Resource Type",
                            "component": "ResourceTypeComponent",
                        },
                        {
                            "section": "combined_titles",
                            "label": "Title",
                            "component": "TitlesComponent",
                        },
                        {
                            "section": "publication_date",
                            "label": "Publication Date",
                            "component": "PublicationDateComponent",
                        },
                        {
                            "section": "creators",
                            "label": "Creators",
                            "component": "CreatorsComponent",
                        },
                        {
                            "section": "abstract",
                            "label": "Description",
                            "component": "AbstractComponent",
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
        {
            "section": "3",
            "label": "Recommended",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "recommended",
                    "label": "Recommended",
                    "component": "FormSection",
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "contributors",
                            "label": "Contributors",
                            "component": "ContributorsComponent",
                        },
                        {
                            "section": "subjects_keywords",
                            "label": "Subjects",
                            "component": "SubjectsComponent",
                        },
                        {
                            "section": "language",
                            "label": "Language",
                            "component": "LanguagesComponent",
                        },
                        {
                            "section": "additional_dates",
                            "label": "Dates",
                            "component": "AdditionalDatesComponent",
                        },
                        {
                            "section": "version",
                            "label": "Version",
                            "component": "VersionComponent",
                        },
                        {
                            "section": "publisher",
                            "label": "Publisher",
                            "component": "PublisherComponent",
                        },
                    ],
                },
            ],
        },
        {
            "section": "4",
            "label": "Additional",
            "component": "FormPage",
            "subsections": [],
        },
        {
            "section": "5",
            "label": "Funding and Related",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "related",
                    "label": "Funding and Related",
                    "component": "FormSection",
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "funding",
                            "label": "Funding",
                            "component": "FundingComponent",
                        },
                        {
                            "section": "alternate_identifiers",
                            "label": "Alternate Identifiers",
                            "component": "AlternateIdentifiersComponent",
                        },
                        {
                            "section": "related_works",
                            "label": "Related Works",
                            "component": "RelatedWorksComponent",
                        },
                    ],
                },
            ],
        },
    ],
}

COMMON_FIELDS_DEFAULT_PAGED = [
    _PAGED_FORM_HEADER_STEPPER_MOBILE_TABLET,
    _PAGED_FORM_LEFT_SIDEBAR,
    _PAGED_FORM_RIGHT_SIDEBAR,
    _PAGED_FORM_FOOTER,
    _PAGED_FORM_PAGES,
]

COMMON_FIELDS_DEFAULT_PAGED_TOP_STEPPER = [
    _PAGED_FORM_HEADER_STEPPER_TOP,
    _PAGED_FORM_RIGHT_SIDEBAR,
    _PAGED_FORM_FOOTER,
    _PAGED_FORM_PAGES,
]

COMMON_FIELDS_DEFAULT_SINGLE = [
    {
        "component": "FormHeader",
        "classnames": "default-layout",
        "subsections": [
            {"component": "FormStepper", "classnames": "mobile tablet only"},
        ],
    },
    {
        "component": "FormRightSidebar",
        "classnames": "default-layout",
        # Sidebar widths: 4 (widescreen), 4 (largeScreen), 5 (computer)
        "mobile": 16,
        "tablet": 16,
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
        "section": "pages",
        "component": "FormPages",
        "classnames": "default-layout",
        "subsections": [
            {
                "section": "1",
                "label": "Files",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "files",
                        "label": "Files",
                        "component": "FormSection",
                        "show_heading": True,
                        "collapsible": True,
                        "classnames": "basic",
                        "subsections": [
                            {
                                "section": "file_upload",
                                "label": "Files Upload",
                                "component": "FileUploadComponent",
                                "show_heading": True,
                            },
                        ],
                    },
                    {
                        "section": "basic-info",
                        "label": "Basic Information",
                        "component": "FormSection",
                        "show_heading": True,
                        "collapsible": True,
                        "classnames": "basic",
                        "subsections": [
                            {
                                "section": "doi",
                                "label": "Digital Object Identifier",
                                "component": "DoiComponent",
                            },
                            {
                                "section": "resource_type",
                                "label": "Resource Type",
                                "component": "ResourceTypeComponent",
                            },
                            {
                                "section": "combined_titles",
                                "label": "Title",
                                "component": "TitlesComponent",
                            },
                            {
                                "section": "publication_date",
                                "label": "Publication Date",
                                "component": "PublicationDateComponent",
                            },
                            {
                                "section": "creators",
                                "label": "Creators",
                                "component": "CreatorsComponent",
                            },
                            {
                                "section": "abstract",
                                "label": "Description",
                                "component": "AbstractComponent",
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
                        "section": "recommended",
                        "label": "Recommended Information",
                        "component": "FormSection",
                        "show_heading": True,
                        "collapsible": True,
                        "classnames": "basic",
                        "subsections": [
                            {
                                "section": "contributors",
                                "label": "Contributors",
                                "component": "ContributorsComponent",
                            },
                            {
                                "section": "subjects_keywords",
                                "label": "Subjects",
                                "component": "SubjectsComponent",
                            },
                            {
                                "section": "language",
                                "label": "Language",
                                "component": "LanguagesComponent",
                            },
                            {
                                "section": "additional_dates",
                                "label": "Dates",
                                "component": "AdditionalDatesComponent",
                            },
                            {
                                "section": "version",
                                "label": "Version",
                                "component": "VersionComponent",
                            },
                            {
                                "section": "publisher",
                                "label": "Publisher",
                                "component": "PublisherComponent",
                            },
                        ],
                    },
                    {
                        "section": "related",
                        "label": "Funding and Related",
                        "component": "FormSection",
                        "show_heading": True,
                        "collapsible": True,
                        "classnames": "basic",
                        "subsections": [
                            {
                                "section": "funding",
                                "label": "Funding",
                                "component": "FundingComponent",
                            },
                            {
                                "section": "alternate_identifiers",
                                "label": "Alternate Identifiers",
                                "component": "AlternateIdentifiersComponent",
                            },
                            {
                                "section": "related_works",
                                "label": "Related Works",
                                "component": "RelatedWorksComponent",
                            },
                        ],
                    },
                ],
            },
        ],
    },
]

# --- Page "4" (Additional): per-resource-type custom fields ---
# Canonical layouts once; reuse via ``same_as`` (``useCurrentResourceTypeFields``).
# Component names match ``componentsRegistry.js``.

_JOURNAL_PAGE_4 = [
    {
        "section": "journal_details",
        "component": "FormSection",
        "show_heading": True,
        "icon": "newspaper outline",
        "label": "Journal details",
        "subsections": [
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "journal_title",
                        "component": "JournalTitleComponent",
                        "label": "Journal title",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "journal_volume",
                        "component": "JournalVolumeComponent",
                    },
                    {
                        "section": "journal_issue",
                        "component": "JournalIssueComponent",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {"section": "journal_pages", "component": "SectionPagesComponent"},
                    {"section": "journal_issn", "component": "JournalISSNComponent"},
                ],
            },
        ],
    },
]

_BOOK_IMPRINT_PAGE_4 = [
    {
        "section": "publication_details",
        "show_heading": True,
        "icon": "file",
        "label": "Publication Details",
        "component": "FormSection",
        "subsections": [
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "book_title",
                        "component": "BookTitleComponent",
                        "label": "Book Title",
                        "icon": "book",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "location",
                        "component": "PublicationLocationComponent",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {"section": "book_pages", "component": "TotalPagesComponent"},
                    {"section": "isbn", "component": "ISBNComponent"},
                ],
            },
        ],
    },
]

_MEETING_PAGE_4 = [
    {
        "section": "conference_details",
        "component": "FormSection",
        "show_heading": True,
        "icon": "calendar",
        "label": "Conference details",
        "subsections": [
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "meeting_title",
                        "component": "MeetingTitleComponent",
                        "label": "Event title",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "meeting_acronym",
                        "component": "MeetingAcronymComponent",
                        "label": "Acronym",
                    },
                    {
                        "section": "meeting_dates",
                        "component": "MeetingDatesComponent",
                        "label": "Dates",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "meeting_place",
                        "component": "MeetingPlaceComponent",
                        "label": "Location",
                    },
                    {
                        "section": "meeting_url",
                        "component": "MeetingURLComponent",
                        "label": "Website",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "meeting_session",
                        "component": "MeetingSessionComponent",
                    },
                    {
                        "section": "meeting_session_part",
                        "component": "MeetingSessionPartComponent",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "meeting_identifiers",
                        "component": "MeetingIdentifiersComponent",
                        "label": "Conference identifiers",
                        "icon": "barcode",
                    },
                ],
            },
        ],
    },
]

_THESIS_PAGE_4 = [
    {
        "section": "thesis_details",
        "component": "FormSection",
        "show_heading": True,
        "icon": "graduation",
        "label": "Thesis details",
        "subsections": [
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "thesis_university",
                        "component": "UniversityComponent",
                    },
                    {
                        "section": "thesis_department",
                        "component": "ThesisDepartmentComponent",
                    },
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {"section": "thesis_type", "component": "ThesisTypeComponent"},
                ],
            },
            {
                "component": "FormRow",
                "classnames": "equal width",
                "subsections": [
                    {
                        "section": "thesis_date_submitted",
                        "component": "ThesisDateSubmittedComponent",
                    },
                    {
                        "section": "thesis_date_defended",
                        "component": "ThesisDateDefendedComponent",
                    },
                ],
            },
        ],
    },
]

_SOFTWARE_PAGE_4 = [
    {
        "section": "software_details",
        "component": "FormSection",
        "label": "Software details",
        "icon": "code",
        "show_heading": True,
        "subsections": [
            {
                "component": "FormRow",
                "subsections": [
                    {
                        "section": "code_repository",
                        "component": "CodeRepositoryComponent",
                        "icon": "github",
                    },
                ],
                "classnames": "equal width",
            },
            {
                "component": "FormRow",
                "subsections": [
                    {
                        "section": "development_status",
                        "component": "CodeDevelopmentStatusComponent",
                        "icon": "heartbeat",
                        "placeholder": "",
                    },
                ],
                "classnames": "equal width",
            },
            {
                "component": "FormRow",
                "subsections": [
                    {
                        "section": "programming_language",
                        "component": "CodeProgrammingLanguageComponent",
                        "icon": "code",
                        "label": "Programming languages",
                        "placeholder": "e.g., Python, JavaScript, R",
                    },
                ],
                "classnames": "equal width",
            },
        ],
    },
]

FIELDS_BY_TYPE_DEFAULT_PAGED = {
    "publication": {},
    "publication-annotationcollection": {},
    "publication-book": {"4": _BOOK_IMPRINT_PAGE_4},
    "publication-section": {"4": [{"same_as": "publication-book"}]},
    "publication-conferencepaper": {"4": _MEETING_PAGE_4},
    "publication-conferenceproceeding": {
        "4": [{"same_as": "publication-conferencepaper"}],
    },
    "publication-datamanagementplan": {"4": [{"same_as": "publication-book"}]},
    "publication-journal": {"4": _JOURNAL_PAGE_4},
    "publication-article": {"4": [{"same_as": "publication-journal"}]},
    "publication-patent": {},
    "publication-peerreview": {"4": [{"same_as": "publication-journal"}]},
    "publication-preprint": {"4": [{"same_as": "publication-journal"}]},
    "publication-deliverable": {"4": [{"same_as": "publication-book"}]},
    "publication-milestone": {"4": [{"same_as": "publication-book"}]},
    "publication-proposal": {"4": [{"same_as": "publication-book"}]},
    "publication-report": {"4": [{"same_as": "publication-book"}]},
    "publication-softwaredocumentation": {"4": [{"same_as": "publication-book"}]},
    "publication-taxonomictreatment": {"4": [{"same_as": "publication-journal"}]},
    "publication-technicalnote": {"4": [{"same_as": "publication-book"}]},
    "publication-thesis": {"4": _THESIS_PAGE_4},
    "publication-workingpaper": {"4": [{"same_as": "publication-journal"}]},
    "publication-datapaper": {"4": [{"same_as": "publication-journal"}]},
    "publication-dissertation": {"4": [{"same_as": "publication-thesis"}]},
    "publication-standard": {"4": [{"same_as": "publication-book"}]},
    "publication-other": {},
    "poster": {"4": [{"same_as": "publication-conferencepaper"}]},
    "presentation": {"4": [{"same_as": "publication-conferencepaper"}]},
    "event": {"4": [{"same_as": "publication-conferencepaper"}]},
    "dataset": {},
    "image": {},
    "image-figure": {},
    "image-plot": {},
    "image-drawing": {},
    "image-diagram": {},
    "image-photo": {},
    "image-other": {},
    "model": {},
    "video": {},
    "audio": {},
    "software": {"4": _SOFTWARE_PAGE_4},
    "lesson": {"4": [{"same_as": "software"}]},
    "software-computationalnotebook": {"4": [{"same_as": "software"}]},
    "other": {},
    "physicalobject": {},
    "workflow": {},
}
