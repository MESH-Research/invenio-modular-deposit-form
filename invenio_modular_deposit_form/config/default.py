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

INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
````

To use the non-paged version, use COMMON_FIELD_DEFAULT_UNPAGED instead.
"""

COMMON_FIELDS_DEFAULT_PAGED = [
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
            {"component": "FormPageNavigationBar"},
        ],
    },
    {
        "section": "pages",
        "component": "FormPages",
        "subsections": [
            {
                "section": "1",
                "label": "Files",
                "component": "FormPage",
                "classnames": "basic",
                "subsections": [
                    {
                        "section": "files",
                        "label": "Files",
                        "component": "FormSection",
                        "subsections": [
                            {
                                "section": "file_upload",
                                "label": "Files Upload",
                                "component": "FileUploadComponent",
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
                "label": "Recommended Information",
                "component": "FormPage",
                "classnames": "basic",
                "subsections": [
                    {
                        "section": "recommended",
                        "label": "Recommended Information",
                        "component": "FormSection",
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
