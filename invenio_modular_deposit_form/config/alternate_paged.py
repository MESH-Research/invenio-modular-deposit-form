#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Alternate multi-page deposit layout (files-first step, seven main pages).

Compared to the package default
:data:`COMMON_FIELDS_DEFAULT_PAGED` in ``config.default``:

- **Files first**: upload + licenses on page ``1``.
- **Registry-only field components**: instance-specific component names are
  omitted or replaced (e.g. ``FileUploadComponent`` / ``TitlesComponent``).
- **Stock resource type vocabulary**: ``FIELDS_BY_TYPE`` keys match
  :data:`~invenio_modular_deposit_form.config.default.FIELDS_BY_TYPE_DEFAULT_PAGED`.
  Stock overrides that use page ``4`` in the default preset are remapped to
  page ``3`` (Details) to match this layout’s page ids.

To enable in your instance::

    from invenio_modular_deposit_form.config.alternate_paged import (
        COMMON_FIELDS_ALTERNATE_PAGED,
        FIELDS_BY_TYPE_ALTERNATE_PAGED,
    )

    MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_ALTERNATE_PAGED
    MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = FIELDS_BY_TYPE_ALTERNATE_PAGED
"""

import copy

from invenio_i18n import lazy_gettext as _

_LANG_FIELD_PLACEHOLDER = _("e.g., English, French, Swahili")
_LANG_FIELD_DESCRIPTION = _(
    "Search for the language(s) of the resource (e.g.,"
    ' "en", "fre", "Swahili"). Press enter to '
    "select each language."
)

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

_PAGED_FORM_LEFT_SIDEBAR_MENU = {
    "component": "FormLeftSidebar",
    "classnames": "default-layout",
    # Sidebar widths
    "computer": 3,
    "largeScreen": 3,
    "widescreen": 3,
    "subsections": [
        {
            "component": "FormSidebarPageMenu",
            "label": _("Steps"),
            "classnames": "computer widescreen large-monitor only",
        },
    ],
}

_PAGED_FORM_LEFT_SIDEBAR_EMPTY = {
    "component": "FormLeftSidebar",
    "classnames": "default-layout",
    # Sidebar widths
    "computer": 3,
    "largeScreen": 3,
    "widescreen": 3,
    "subsections": [
        {},
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

# Page ``3`` layouts: details-step overrides, submodule registry components only.
# Each constant is a full page dict; assign with ``copy.deepcopy`` so presets do not
# alias module-level objects.

_DATASET_DETAILS_PAGE = {
    "section": "4",
    "label": _("Dataset Details"),
    "component": "FormPage",
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": _("Dataset Details"),
            "icon": "table",
            "show_heading": True,
            "subsections": [
                {
                    "component": "FormRow",
                    "subsections": [
                        {
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": _("Record count"),
                            "placeholder": _("e.g. 1.4M rows (press 'enter' to add)"),
                            "description": "",
                        }
                    ],
                    "classnames": "equal width",
                },
            ],
        },
        {
            "section": "image_details",
            "component": "FormSection",
            "label": _("Dataset URL and Other Identifiers"),
            "show_heading": True,
            "subsections": [
                {
                    "section": "alternate_identifiers",
                    "label": None,
                    "component": "AlternateIdentifiersComponent",
                }
            ],
        },
        {
            "section": "image_details",
            "component": "FormSection",
            "label": _("Languages"),
            "show_heading": True,
            "subsections": [
                {
                    "section": "language",
                    "label": None,
                    "component": "LanguagesComponent",
                    "placeholder": _LANG_FIELD_PLACEHOLDER,
                    "description": _LANG_FIELD_DESCRIPTION,
                    "wrapped": True,
                },
            ],
        },
    ],
}

_IMAGE_DETAILS_PAGE = {
    "section": "4",
    "label": _("Image Details"),
    "component": "FormPage",
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": _("Image Details"),
            "icon": "picture",
            "show_heading": True,
            "subsections": [
                {
                    "component": "FormRow",
                    "subsections": [
                        {
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": "Dimensions",
                            "placeholder": _("e.g. 32 x 40 cm (press 'enter' to add)"),
                            "description": "",
                        },
                        {
                            "section": "publication_location",
                            "component": "PublicationLocationComponent",
                        },
                    ],
                    "classnames": "equal width",
                },
            ],
        },
        {
            "section": "alternate_identifiers",
            "label": "Image URL and Other Identifiers",
            "component": "AlternateIdentifiersComponent",
            "wrapped": True,
        },
        {
            "section": "language",
            "label": "Languages",
            "component": "LanguagesComponent",
            "placeholder": _LANG_FIELD_PLACEHOLDER,
            "description": _LANG_FIELD_DESCRIPTION,
            "wrapped": True,
        },
    ],
}

_VIDEO_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Media Details"),
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": "Media Details",
            "icon": "video",
            "show_heading": True,
            "subsections": [
                {
                    "component": "FormRow",
                    "subsections": [
                        {
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": "Duration",
                            "placeholder": _("e.g. 30 min (press 'enter' to add)"),
                            "description": "",
                        },
                        {
                            "section": "publication_location",
                            "component": "PublicationLocationComponent",
                        },
                    ],
                    "classnames": "equal width",
                },
            ],
        },
        {
            "section": "alternate_identifiers",
            "label": "Media URL and Other Identifiers",
            "component": "AlternateIdentifiersComponent",
            "wrapped": True,
        },
        {
            "section": "language",
            "label": "Languages",
            "component": "LanguagesComponent",
            "placeholder": _LANG_FIELD_PLACEHOLDER,
            "description": _LANG_FIELD_DESCRIPTION,
            "wrapped": True,
        },
    ],
}

_AUDIO_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Recording Details"),
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": "Recording Details",
            "icon": "headphones",
            "show_heading": True,
            "subsections": [
                {
                    "component": "FormRow",
                    "subsections": [
                        {
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": "Duration",
                            "placeholder": _("e.g. 30 min (press 'enter' to add)"),
                            "description": "",
                        },
                        {
                            "section": "publication_location",
                            "component": "PublicationLocationComponent",
                            "label": "Recording location",
                        },
                    ],
                    "classnames": "equal width",
                },
            ],
        },
        {
            "section": "alternate_identifiers",
            "label": "Recording URL and Other Identifiers",
            "component": "AlternateIdentifiersComponent",
            "wrapped": True,
        },
        {
            "section": "language",
            "label": "Languages",
            "component": "LanguagesComponent",
            "placeholder": _LANG_FIELD_PLACEHOLDER,
            "description": _LANG_FIELD_DESCRIPTION,
            "wrapped": True,
        },
    ],
}

_SOFTWARE_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Software Details"),
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": "Software Details",
            "icon": "group",
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
                            "section": "version",
                            "component": "VersionComponent",
                            "icon": "copy",
                            "description": "",
                        },
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
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": "Size",
                            "placeholder": _("e.g. 400 MB"),
                            "icon": "database",
                            "description": "",
                        },
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
        {
            "section": "alternate_identifiers",
            "label": "Package URL and other identifiers",
            "component": "AlternateIdentifiersComponent",
            "wrapped": True,
        },
        {
            "section": "language",
            "label": "Natural (Human) Languages",
            "component": "LanguagesComponent",
            "placeholder": _LANG_FIELD_PLACEHOLDER,
            "description": _LANG_FIELD_DESCRIPTION,
            "wrapped": True,
        },
    ],
}

_JOURNAL_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Journal Details"),
    "subsections": [
        {
            "section": "journal_details",
            "component": "FormSection",
            "show_heading": True,
            "icon": "newspaper outline",
            "label": _("Journal details"),
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
                        {
                            "section": "journal_pages",
                            "component": "SectionPagesComponent",
                        },
                        {
                            "section": "journal_issn",
                            "component": "JournalISSNComponent",
                        },
                    ],
                },
            ],
        },
    ],
}

_BOOK_IMPRINT_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Publication Details"),
    "subsections": [
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
    ],
}

_MEETING_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Conference details"),
    "subsections": [
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
    ],
}

_THESIS_DETAILS_PAGE = {
    "section": "4",
    "component": "FormPage",
    "label": _("Thesis details"),
    "subsections": [
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
    ],
}


_PAGED_FORM_PAGES_ALTERNATE_PAGED = {
    "section": "pages",
    "component": "FormPages",
    "classnames": "default-layout",
    "subsections": [
        {
            "section": "1",
            "label": _("Files and Rights"),
            "component": "FormPage",
            "subsections": [
                {
                    "section": "resource_type",
                    "label": "Resource Type",
                    "component": "FormSection",
                    "classnames": "basic",
                    "show_heading": True,
                    "subsections": [
                        {
                            "section": "resource_type",
                            "label": None,
                            "component": "ResourceTypeSelectorComponent",
                            "required": True,
                            "classnames": "basic",
                        },
                    ],
                },
                {
                    "section": "files",
                    "label": _("File Upload"),
                    "component": "FormSection",
                    "classnames": "basic",
                    "show_heading": True,
                    "subsections": [
                        {
                            "section": "file_upload",
                            "label": "",
                            "component": "FileUploadComponent",
                            "description": (
                                "Very large files (200MB and larger) should be uploaded "
                                "one at a time. Multiple smaller files may safely be "
                                "uploaded at once."
                            ),
                        },
                    ],
                },
                {
                    "section": "rights",
                    "label": _("Rights and Permissions"),
                    "component": "FormSection",
                    "classnames": "basic",
                    "show_heading": True,
                    "subsections": [
                        {
                            "section": "copyright",
                            "label": _("Copyright"),
                            "component": "CopyrightsComponent",
                            "classnames": "basic",
                        },
                        {
                            "section": "licenses",
                            "label": _("Licenses"),
                            "component": "LicensesComponent",
                            "classnames": "basic",
                        },
                    ],
                },
            ],
        },
        {
            "section": "2",
            "label": "Basics",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "pids",
                    "label": _("Digital Object Identifier"),
                    "component": "FormSection",
                    "classnames": "basic",
                    "show_heading": True,
                    "subsections": [
                        {
                            "section": "doi",
                            "fieldLabel": None,
                            "icon": "linkify",
                            "component": "DoiComponent",
                        },
                    ],
                },
                {
                    "section": "titles",
                    "label": _("Title"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "combined_titles",
                            "label": None,
                            "component": "TitlesComponent",
                            "icon": "book",
                        }
                    ],
                },
                {
                    "section": "dates",
                    "label": _("Dates"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "combined_dates",
                            "label": None,
                            "component": "CombinedDatesComponent",
                            "helpText": "",
                        },
                    ],
                },
                {
                    "section": "descriptions",
                    "label": _("Abstract and Descriptions"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "abstract",
                            "label": None,
                            "component": "AbstractComponent",
                        },
                    ],
                },
            ],
        },
        {
            "section": "3",
            "label": _("Contributors & Funding"),
            "component": "FormPage",
            "subsections": [
                {
                    "section": "creators",
                    "label": _("Primary Contributors"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "creators_field",
                            "label": None,
                            "component": "CreatorsComponent",
                            "addButtonLabel": "Add Contributor",
                            "modal": {
                                "addLabel": _("Add Contributor"),
                                "editLabel": _("Edit Contributor"),
                            },
                            "description": (
                                "These people will appear at the beginning of formatted "
                                "citations and at the top of the record's detail page."
                            ),
                        },
                    ],
                },
                {
                    "section": "contributors",
                    "label": _("Other Contributors"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "contributors",
                            "label": None,
                            "component": "CreatorsComponent",
                            "addButtonLabel": "Add Contributor",
                            "modal": {
                                "addLabel": _("Add Contributor"),
                                "editLabel": _("Edit Contributor"),
                            },
                            "description": (
                                "These people may appear later on in formatted citations, "
                                "depending on their role. They will be included in the full "
                                "contributors list on the record detail page."
                            ),
                        },
                    ],
                },
                {
                    "section": "funding",
                    "label": _("Funding and Awards"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "funding_field",
                            "label": None,
                            "component": "FundingComponent",
                        },
                    ],
                },
            ],
        },
        {
            "section": "4",
            "label": _("Details"),
            "component": "FormPage",
            "subsections": [
                {
                    "section": "language",
                    "label": _("Languages"),
                    "component": "LanguagesComponent",
                    "placeholder": _LANG_FIELD_PLACEHOLDER,
                    "description": _LANG_FIELD_DESCRIPTION,
                    "wrapped": True,
                },
                {
                    "section": "publisher",
                    "label": _("Publisher"),
                    "component": "PublisherComponent",
                    "description": "",
                },
                {
                    "section": "alternate_identifiers",
                    "label": _("URL and Other Identifiers"),
                    "icon": "linkify",
                    "component": "AlternateIdentifiersComponent",
                    "wrapped": True,
                },
            ],
        },
        {
            "section": "5",
            "label": "Make It Findable",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "communities",
                    "label": _("Community submission"),
                    "component": "FormPage",
                    "subsections": [
                        {
                            "section": "communities",
                            "label": None,
                            "component": "CommunitiesComponent",
                        },
                    ],
                },
                {
                    "section": "contributors",
                    "label": _("Subjects"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "subjects_field",
                            "label": None,
                            "component": "SubjectsComponent",
                            "description": (
                                "Search using full words and press enter to select. "
                                "(For best results, choose a subject category at right.)"
                            ),
                            "helpText": (
                                "These formal subject headings let people find "
                                "your work in subject searches."
                            ),
                            "placeholder": "e.g., Nelson Mandela, Genetics,Shakespeare",
                        },
                    ],
                },
                {
                    "section": "contributors",
                    "label": _("Related Works"),
                    "component": "FormSection",
                    "show_heading": True,
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "related_works",
                            "label": None,
                            "component": "RelatedWorksComponent",
                        },
                    ],
                },
            ],
        },
        # {
        #     "section": "6",
        #     "label": "Save & Publish",
        #     "component": "FormPage",
        #     "subsections": [
        #         {
        #             "section": "submit_actions",
        #             "label": "Publish",
        #             "component": "SubmissionComponent",
        #             "wrapped": False,
        #         },
        #         {
        #             "section": "access",
        #             "label": "Access",
        #             "component": "AccessRightsComponent",
        #             "wrapped": True,
        #         },
        #     ],
        # },
    ],
}


COMMON_FIELDS_ALTERNATE_PAGED = [
    _PAGED_FORM_HEADER_STEPPER_TOP,
    _PAGED_FORM_RIGHT_SIDEBAR,
    _PAGED_FORM_FOOTER,
    _PAGED_FORM_PAGES_ALTERNATE_PAGED,
]

FIELDS_BY_TYPE_ALTERNATE_PAGED = {
    "audio": {
        "4": copy.deepcopy(_AUDIO_DETAILS_PAGE),
    },
    "dataset": {
        "4": copy.deepcopy(_DATASET_DETAILS_PAGE),
    },
    "image": {
        "4": copy.deepcopy(_IMAGE_DETAILS_PAGE),
    },
    "image-figure": {
        "4": {
            "same_as": "image",
            "label": _("Figure details"),
        },
    },
    "image-plot": {
        "4": {
            "same_as": "image",
            "label": _("Plot details"),
        },
    },
    "image-drawing": {
        "4": {
            "same_as": "image",
            "label": _("Drawing details"),
        },
    },
    "image-diagram": {
        "4": {
            "same_as": "image",
            "label": _("Diagram details"),
        },
    },
    "image-photo": {
        "4": {
            "same_as": "image",
            "label": _("Photo details"),
        },
    },
    "image-other": {
        "4": {
            "same_as": "image",
            "label": _("Image details"),
        },
    },
    "publication-article": {
        "4": copy.deepcopy(_JOURNAL_DETAILS_PAGE),
    },
    "publication-book": {
        "4": copy.deepcopy(_BOOK_IMPRINT_DETAILS_PAGE),
    },
    "publication-journal": {
        "4": copy.deepcopy(_JOURNAL_DETAILS_PAGE),
    },
    "publication-thesis": {
        "4": copy.deepcopy(_THESIS_DETAILS_PAGE),
    },
    "software": {
        "4": copy.deepcopy(_SOFTWARE_DETAILS_PAGE),
    },
    "video": {
        "4": copy.deepcopy(_VIDEO_DETAILS_PAGE),
    },
}
