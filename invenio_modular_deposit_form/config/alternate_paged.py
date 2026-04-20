#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Alternate multi-page deposit layout.

- **Stock resource type vocabulary**: ``FIELDS_BY_TYPE`` keys match
  :data:`~invenio_modular_deposit_form.config.default.FIELDS_BY_TYPE_DEFAULT_PAGED`.

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

_PAGED_FORM_TITLE = {
    "component": "FormTitle",
    "classnames": "default-layout",
    "subsections": [
        {
            "component": "FormTitle",
            "mobile": 16,
            "tablet": 16,
            "computer": 16,
            "largeScreen": 16,
            "widescreen": 16,
        },
    ],
}

_PAGED_FORM_HEADER_STEPPER_MOBILE_TABLET = {
    "component": "FormHeader",
    "classnames": "default-layout",
    "subsections": [
        {"component": "FormStepper", "classnames": "mobile tablet only"},
    ],
}

_PAGED_FORM_HEADER_STEPPER_TOP = {
    "component": "FormHeader",
    "subsections": [
        {
            "component": "SpacerColumn",
            "largeScreen": 1,
            "widescreen": 2,
            "only": "large screen",
        },
        {
            "component": "FormStepper",
            "classnames": "column tablet mobile only",
            "mobile": 16,
            "tablet": 16,
        },
        {
            "component": "FormStepper",
            "classnames": "column computer-only-strict",
            "computer": 11,
        },
        {
            "component": "SpacerColumn",
            "computer": 5,
            "largeScreen": 4,
            "widescreen": 4,
            "only": "computer",
        },
    ],
}


_PAGED_FORM_LEFT_SIDEBAR_MENU = {
    "component": "FormLeftSidebar",
    "classnames": "default-layout",
    # Sidebar widths (zeroed at mobile/tablet/computer via `only: large screen`)
    "computer": 3,
    "largeScreen": 3,
    "widescreen": 3,
    "only": "large screen",
    "subsections": [
        {
            "component": "FormSidebarPageMenu",
            "label": _("Steps"),
            "classnames": "widescreen large-monitor only",
        },
    ],
}

_PAGED_FORM_LEFT_SIDEBAR_EMPTY = {
    "component": "FormLeftSidebar",
    "classnames": "default-layout",
    "largeScreen": 1,
    "widescreen": 2,
    "only": "large screen",
    "subsections": [
        {},
    ],
}

_PAGED_FORM_RIGHT_SIDEBAR = {
    "component": "FormRightSidebar",
    "classnames": "default-layout",
    # Sidebar widths: 4 (widescreen), 4 (largeScreen), 5 (computer)
    # Hidden at mobile/tablet (zeroed via setZeroWidths from `only`); the
    # save/access/feedback components also appear on the tablet/mobile-only
    # "Save & Publish" form page (section "6") in the page menu/stepper.
    "computer": 5,
    "largeScreen": 4,
    "widescreen": 4,
    "only": "computer",
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

# Top-level languages row (FormPage auto-wraps in FormSection; no extra FormSection wrapper).
_LANGUAGE_SECTION = {
    "section": "language_section",
    "label": _("Languages"),
    "component": "LanguagesComponent",
    "classnames": "basic prominent-field-label",
    "placeholder": _("e.g., English, French, Swahili"),
    "description": _(
        "Search for the language(s) of the resource (e.g.,"
        ' "en", "fre", "Swahili"). Press enter to '
        "select each language."
    ),
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
            "section": "alternate_identifiers",
            "label": _("Dataset URL and Other Identifiers"),
            "component": "AlternateIdentifiersComponent",
            "classnames": "basic prominent-field-label",
        },
        _LANGUAGE_SECTION,
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
            "classnames": "basic prominent-field-label",
        },
        _LANGUAGE_SECTION,
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
            "classnames": "basic prominent-field-label",
        },
        _LANGUAGE_SECTION,
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
            "label": _("Recording Details"),
            "icon": "headphones",
            "show_heading": True,
            "subsections": [
                {
                    "component": "FormRow",
                    "subsections": [
                        {
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": _("Duration"),
                            "placeholder": _("e.g. 30 min (press 'enter' to add)"),
                            "description": "",
                        },
                        {
                            "section": "publication_location",
                            "component": "PublicationLocationComponent",
                            "label": _("Recording location"),
                        },
                    ],
                    "classnames": "equal width",
                },
            ],
        },
        {
            "section": "alternate_identifiers",
            "label": _("Recording URL and Other Identifiers"),
            "component": "AlternateIdentifiersComponent",
            "classnames": "basic prominent-field-label",
        },
        _LANGUAGE_SECTION,
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
            "label": _("Software Details"),
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
                            "label": _("Size"),
                            "placeholder": _("e.g. 400 MB"),
                            "icon": "database",
                            "description": "",
                        },
                        {
                            "section": "programming_language",
                            "component": "CodeProgrammingLanguageComponent",
                            "icon": "code",
                            "label": _("Programming languages"),
                            "placeholder": _("e.g., Python, JavaScript, R"),
                        },
                    ],
                    "classnames": "equal width",
                },
            ],
        },
        {
            "section": "alternate_identifiers",
            "label": _("Package URL and other identifiers"),
            "component": "AlternateIdentifiersComponent",
            "classnames": "basic prominent-field-label",
        },
        _LANGUAGE_SECTION,
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
                            "label": _("Journal title"),
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
            "label": _("Publication Details"),
            "component": "FormSection",
            "subsections": [
                {
                    "component": "FormRow",
                    "classnames": "equal width",
                    "subsections": [
                        {
                            "section": "book_title",
                            "component": "BookTitleComponent",
                            "label": _("Book Title"),
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
            "label": _("Conference details"),
            "subsections": [
                {
                    "component": "FormRow",
                    "classnames": "equal width",
                    "subsections": [
                        {
                            "section": "meeting_title",
                            "component": "MeetingTitleComponent",
                            "label": _("Event title"),
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
                            "label": _("Acronym"),
                        },
                        {
                            "section": "meeting_dates",
                            "component": "MeetingDatesComponent",
                            "label": _("Dates"),
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
                            "label": _("Location"),
                        },
                        {
                            "section": "meeting_url",
                            "component": "MeetingURLComponent",
                            "label": _("Website"),
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
                            "label": _("Conference identifiers"),
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
            "label": _("Thesis Details"),
            "classnames": "basic",
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
                    "label": _("Resource Type"),
                    "component": "ResourceTypeSelectorComponent",
                    "required": True,
                    "classnames": "basic prominent-field-label",
                },
                {
                    "section": "files",
                    "label": _("File Upload"),
                    "component": "FileUploadComponent",
                    "classnames": "basic prominent-field-label",
                    "description": _(
                        "Very large files (200MB and larger) should be uploaded "
                        "one at a time. Multiple smaller files may safely be "
                        "uploaded at once."
                    ),
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
            "label": _("Basics"),
            "component": "FormPage",
            "subsections": [
                {
                    "section": "pids",
                    "label": _("Digital Object Identifier"),
                    "icon": "linkify",
                    "component": "DoiComponent",
                    "classnames": "basic prominent-field-label",
                },
                {
                    "section": "titles",
                    "label": _("Title"),
                    "component": "TitlesComponent",
                    "icon": "book",
                    "classnames": "basic prominent-field-label",
                },
                {
                    "section": "dates",
                    "label": _("Dates"),
                    "component": "CombinedDatesComponent",
                    "classnames": "basic prominent-field-label",
                    "helpText": "",
                },
                {
                    "section": "descriptions",
                    "label": _("Abstract and Descriptions"),
                    "component": "AbstractComponent",
                    "classnames": "basic prominent-field-label",
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
                    "component": "CreatorsComponentFlat",
                    "classnames": "basic prominent-field-label",
                    "addButtonLabel": _("Add Contributor"),
                    "modal": {
                        "addLabel": _("Add Contributor"),
                        "editLabel": _("Edit Contributor"),
                    },
                    "description": _(
                        "These people will appear at the beginning of formatted "
                        "citations and at the top of the record's detail page."
                    ),
                },
                {
                    "section": "contributors",
                    "label": _("Other Contributors"),
                    "component": "ContributorsComponentFlat",
                    "classnames": "basic prominent-field-label",
                    "addButtonLabel": "Add Contributor",
                    "modal": {
                        "addLabel": _("Add Contributor"),
                        "editLabel": _("Edit Contributor"),
                    },
                    "description": _(
                        "These people may appear later on in formatted citations, "
                        "depending on their role. They will be included in the full "
                        "contributors list on the record detail page."
                    ),
                },
                {
                    "section": "funding",
                    "label": _("Funding and Awards"),
                    "component": "FundingComponent",
                    "classnames": "basic prominent-field-label",
                },
            ],
        },
        {
            "section": "4",
            "label": _("Details"),
            "component": "FormPage",
            "subsections": [
                _LANGUAGE_SECTION,
                {
                    "section": "publisher",
                    "label": _("Publisher"),
                    "component": "PublisherComponent",
                    "classnames": "basic prominent-field-label",
                },
                {
                    "section": "alternate_identifiers",
                    "label": _("URL and Other Identifiers"),
                    "icon": "linkify",
                    "component": "AlternateIdentifiersComponent",
                    "classnames": "basic prominent-field-label",
                },
            ],
        },
        {
            "section": "5",
            "label": _("Make It Findable"),
            "component": "FormPage",
            "subsections": [
                {
                    "section": "communities",
                    "label": _("Community submission"),
                    "component": "CommunitiesComponent",
                    "classnames": "basic prominent-field-label",
                },
                {
                    "section": "subjects",
                    "label": _("Subjects"),
                    "component": "SubjectsComponent",
                    "classnames": "basic prominent-field-label",
                    "description": _(
                        "Search using full words and press enter to select. "
                        "(For best results, choose a subject category at right.)"
                    ),
                    "helpText": _(
                        "These formal subject headings let people find "
                        "your work in subject searches."
                    ),
                    "placeholder": _("e.g., Nelson Mandela, Genetics,Shakespeare"),
                },
                {
                    "section": "related_works_section",
                    "label": _("Related Works"),
                    "component": "RelatedWorksComponent",
                    "classnames": "basic prominent-field-label",
                },
            ],
        },
        {
            "section": "6",
            "label": _("Save & Publish"),
            "component": "FormPage",
            # Menu/stepper item only at tablet/mobile (the same components
            # appear in the right sidebar at computer+ widths). The page
            # itself stays navigable at all widths so hard links still work.
            "menuItemClasses": "tablet mobile only",
            "subsections": [
                {
                    "section": "form_feedback",
                    "component": "FormFeedbackComponent",
                    "wrapped": False,
                },
                {
                    "section": "submit_actions",
                    "label": _("Publish"),
                    "component": "SubmissionComponent",
                    "wrapped": False,
                },
                {
                    "section": "access",
                    "label": _("Visibility"),
                    "component": "AccessRightsComponent",
                    "wrapped": False,
                },
            ],
        },
    ],
}


COMMON_FIELDS_ALTERNATE_PAGED = [
    _PAGED_FORM_TITLE,
    _PAGED_FORM_HEADER_STEPPER_TOP,
    _PAGED_FORM_LEFT_SIDEBAR_MENU,
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
            "label": _("Figure Details"),
        },
    },
    "image-plot": {
        "4": {
            "same_as": "image",
            "label": _("Plot Details"),
        },
    },
    "image-drawing": {
        "4": {
            "same_as": "image",
            "label": _("Drawing Details"),
        },
    },
    "image-diagram": {
        "4": {
            "same_as": "image",
            "label": _("Diagram Details"),
        },
    },
    "image-photo": {
        "4": {
            "same_as": "image",
            "label": _("Photo Details"),
        },
    },
    "image-other": {
        "4": {
            "same_as": "image",
            "label": _("Image Details"),
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
