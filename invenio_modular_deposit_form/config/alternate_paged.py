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

from .default import (
    _PAGED_FORM_FOOTER,
    _PAGED_FORM_HEADER_STEPPER_MOBILE_TABLET,
    _PAGED_FORM_LEFT_SIDEBAR,
    _PAGED_FORM_RIGHT_SIDEBAR,
    FIELDS_BY_TYPE_DEFAULT_PAGED,
)

_LANG_FIELD_PLACEHOLDER = "e.g., English, French, Swahili"
_LANG_FIELD_DESCRIPTION = (
    "Search for the language(s) of the resource (e.g.,"
    ' "en", "fre", "Swahili"). Press enter to '
    "select each language."
)

# Page ``3`` layouts: details-step overrides, submodule registry components only.
# Each constant is a full page dict; assign with ``copy.deepcopy`` so presets do not
# alias module-level objects.

_DATASET_DETAILS_PAGE_3 = {
    "label": "Dataset Details",
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": "Dataset Details",
            "icon": "table",
            "show_heading": True,
            "subsections": [
                {
                    "component": "FormRow",
                    "subsections": [
                        {
                            "section": "sizes",
                            "component": "SizesComponent",
                            "label": "Record count",
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
            "label": "Dataset URL and Other Identifiers",
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

_IMAGE_DETAILS_PAGE_3 = {
    "label": "Image Details",
    "subsections": [
        {
            "section": "image_details",
            "component": "FormSection",
            "label": "Image Details",
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

_VIDEO_DETAILS_PAGE_3 = {
    "label": "Media Details",
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

_AUDIO_DETAILS_PAGE_3 = {
    "label": "Recording Details",
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

_SOFTWARE_DETAILS_PAGE_3 = {
    "label": "Software Details",
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


_PAGED_FORM_PAGES_ALTERNATE_PAGED = {
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
                    "label": "Files and Rights",
                    "component": "FormSection",
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "resource_type",
                            "label": "Resource Type",
                            "component": "ResourceTypeSelectorComponent",
                            "required": True,
                            "classnames": "basic",
                        },
                        {
                            "section": "file_upload",
                            "label": "Upload Files",
                            "component": "FileUploadComponent",
                            "classnames": "basic",
                            "show_heading": True,
                            "description": (
                                "Very large files (200MB and larger) should be uploaded "
                                "one at a time. Multiple smaller files may safely be "
                                "uploaded at once."
                            ),
                        },
                        {
                            "section": "copyright",
                            "label": "Copyright",
                            "component": "CopyrightsComponent",
                            "classnames": "basic",
                        },
                        {
                            "section": "licenses",
                            "label": "Licenses",
                            "component": "LicensesComponent",
                            "classnames": "basic",
                        },
                    ],
                },
            ],
        },
        {
            "section": "2",
            "label": "Type & Title",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "basic",
                    "label": "Basics",
                    "component": "FormSection",
                    "classnames": "basic",
                    "subsections": [
                        {
                            "section": "doi",
                            "label": "Digital Object Identifier",
                            "icon": "linkify",
                            "component": "DoiComponent",
                        },
                        {
                            "section": "combined_titles",
                            "label": "Title",
                            "component": "TitlesComponent",
                            "icon": "book",
                        },
                        {
                            "section": "combined_dates",
                            "label": "Dates",
                            "component": "CombinedDatesComponent",
                            "helpText": "",
                        },
                        {
                            "section": "abstract",
                            "label": "Abstract or Description",
                            "component": "AbstractComponent",
                        },
                    ],
                },
            ],
        },
        {
            "section": "3",
            "label": "Details",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "publisher",
                    "label": "Publisher",
                    "component": "PublisherComponent",
                    "wrapped": True,
                    "description": "",
                },
                {
                    "section": "language",
                    "label": "Languages",
                    "component": "LanguagesComponent",
                    "placeholder": _LANG_FIELD_PLACEHOLDER,
                    "description": _LANG_FIELD_DESCRIPTION,
                    "wrapped": True,
                },
                {
                    "section": "alternate_identifiers",
                    "label": "URL and Other Identifiers",
                    "icon": "linkify",
                    "component": "AlternateIdentifiersComponent",
                    "wrapped": True,
                },
            ],
        },
        {
            "section": "4",
            "label": "Contributors & Funding",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "creators",
                    "label": "Creators and Contributors",
                    "component": "CreatorsComponent",
                    "wrapped": True,
                    "addButtonLabel": "Add Contributor",
                    "modal": {
                        "addLabel": _("Add Contributor"),
                        "editLabel": _("Edit Contributor"),
                    },
                },
            ],
        },
        {
            "section": "5",
            "label": "Make It Findable",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "subjects",
                    "label": "Subjects",
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
                    "wrapped": True,
                },
                {
                    "section": "related_works",
                    "label": "Related Works",
                    "component": "RelatedWorksComponent",
                    "wrapped": True,
                },
            ],
        },
        {
            "section": "6",
            "label": "Collections & Access",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "communities",
                    "label": "Collection submission",
                    "component": "CommunitiesComponent",
                    "wrapped": True,
                },
                {
                    "section": "access",
                    "label": "Access",
                    "component": "AccessRightsComponent",
                    "wrapped": True,
                },
            ],
        },
        {
            "section": "7",
            "label": "Save & Publish",
            "component": "FormPage",
            "subsections": [
                {
                    "section": "submit_actions",
                    "label": "Publish",
                    "component": "SubmissionComponent",
                    "wrapped": False,
                },
            ],
        },
    ],
}


COMMON_FIELDS_ALTERNATE_PAGED = [
    _PAGED_FORM_HEADER_STEPPER_MOBILE_TABLET,
    _PAGED_FORM_LEFT_SIDEBAR,
    _PAGED_FORM_RIGHT_SIDEBAR,
    _PAGED_FORM_FOOTER,
    _PAGED_FORM_PAGES_ALTERNATE_PAGED,
]


def _remap_fields_by_type_page_keys(fields_by_type, old_key: str, new_key: str):
    """Deep copy with page ids renamed (stock page ``4`` maps to page ``3`` here).

    Returns:
        New dict keyed by resource type id.
    """
    out = {}
    for res_type, cfg in fields_by_type.items():
        if cfg is None or not isinstance(cfg, dict):
            out[res_type] = copy.deepcopy(cfg)
            continue
        new_cfg = {}
        for page_key, page_val in cfg.items():
            mapped_key = new_key if page_key == old_key else page_key
            new_cfg[mapped_key] = copy.deepcopy(page_val)
        out[res_type] = new_cfg
    return out


FIELDS_BY_TYPE_ALTERNATE_PAGED = _remap_fields_by_type_page_keys(
    FIELDS_BY_TYPE_DEFAULT_PAGED,
    "4",
    "3",
)

# Publication / poster / presentation / lesson entries need no further changes.

FIELDS_BY_TYPE_ALTERNATE_PAGED["dataset"] = {
    "3": copy.deepcopy(_DATASET_DETAILS_PAGE_3),
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image"] = {
    "3": copy.deepcopy(_IMAGE_DETAILS_PAGE_3),
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image-figure"] = {
    "3": {
        "same_as": "image",
        "label": "Figure details",
    },
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image-plot"] = {
    "3": {
        "same_as": "image",
        "label": "Plot details",
    },
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image-drawing"] = {
    "3": {
        "same_as": "image",
        "label": "Drawing details",
    },
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image-diagram"] = {
    "3": {
        "same_as": "image",
        "label": "Diagram details",
    },
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image-photo"] = {
    "3": {
        "same_as": "image",
        "label": "Photo details",
    },
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["image-other"] = {
    "3": {
        "same_as": "image",
        "label": "Other image details",
    },
}

FIELDS_BY_TYPE_ALTERNATE_PAGED["video"] = {
    "3": copy.deepcopy(_VIDEO_DETAILS_PAGE_3),
}
FIELDS_BY_TYPE_ALTERNATE_PAGED["audio"] = {
    "3": copy.deepcopy(_AUDIO_DETAILS_PAGE_3),
}

FIELDS_BY_TYPE_ALTERNATE_PAGED["software"] = {
    "3": copy.deepcopy(_SOFTWARE_DETAILS_PAGE_3),
}
