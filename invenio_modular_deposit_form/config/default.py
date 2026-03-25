#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""
A form layout configuration emulating the default InvenioRDM form, but with pages.

To use this layout, import it into your instance's invenio.cfg file and assign it as the
value for the common fields layout:

````
from invenio_modular_deposit_form.config.default import COMMON_FIELDS_DEFAULT_PAGED

MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
````

To use the non-paged version, use COMMON_FIELD_DEFAULT_UNPAGED instead.
"""

COMMON_FIELDS_DEFAULT_PAGED = [
    {
        "component": "FormHeader",
        "classnames": "default-layout",
        "subsections": [
            {"component": "FormStepper", "classnames": "mobile tablet only"},
        ],
    },
    {
        "component": "FormLeftSidebar",
        "classnames": "default-layout",
        # Sidebar widths: 2 (widescreen), 3 (largeScreen), 3 (computer)
        "computer": 3,
        "largeScreen": 3,
        "widescreen": 2,
        "subsections": [
            # Visibility class: use "large-monitor" (hyphen) for class name equivalent to
            # "largeScreen" width prop
            {
                "component": "FormSidebarPageMenu",
                "classnames": "computer widescreen large-monitor only",
            },
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
        "component": "FormFooter",
        "classnames": "basic default-layout",
        "subsections": [
            {"component": "FormPageNavigationBar"},
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
    },
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

FIELDS_BY_TYPE_DEFAULT_PAGED = {
    "publication": {},
    "publication-annotationcollection": {},
    "publication-book": {
        "4": [
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
                                "section": "publisher",
                                "component": "PublisherComponent",
                            },
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
                            {
                                "section": "book_pages",
                                "component": "TotalPagesComponent",
                                "classnames": "eight wide",
                            },
                            {
                                "section": "isbn",
                                "component": "ISBNComponent",
                                "classnames": "six wide",
                            },
                        ],
                    },
                ],
            },
        ]
    },
    "publication-section": {},
    "publication-conferencepaper": {},
    "publication-conferenceproceeding": {},
    "publication-datamanagementplan": {},
    "publication-journal": {},
    "publication-article": {},
    "publication-patent": {},
    "publication-peerreview": {},
    "publication-preprint": {},
    "publication-deliverable": {},
    "publication-milestone": {},
    "publication-proposal": {},
    "publication-report": {},
    "publication-softwaredocumentation": {},
    "publication-taxonomictreatment": {},
    "publication-technicalnote": {},
    "publication-thesis": {},
    "publication-workingpaper": {},
    "publication-datapaper": {},
    "publication-dissertation": {},
    "publication-standard": {},
    "publication-other": {},
    "poster": {},
    "presentation": {},
    "event": {},
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
    "software": {},
    "lesson": {},
    "software-computationalnotebook": {},
    "other": {},
    "physicalobject": {},
    "workflow": {},
}
