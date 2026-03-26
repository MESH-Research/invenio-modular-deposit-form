#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.
"""Custom fields UI configuration for codemeta metadata (single-field widgets).

These helpers mirror the default invenio-rdm-records codemeta custom fields,
but are provided here so instances can easily import them into
RDM_CUSTOM_FIELDS_UI when using the modular form's codemeta components.
"""

from invenio_i18n import lazy_gettext as _

CODEMETA_CUSTOM_FIELDS_UI = {
    "section": _("Software"),
    "fields": [
        {
            "field": "code:codeRepository",
            "ui_widget": "TextField",
            "props": {
                "label": "Repository URL",
                "icon": "linkify",
                "description": "URL or link where the code repository is hosted.",
            },
        },
        {
            "field": "code:programmingLanguage",
            "ui_widget": "AutocompleteDropdown",
            "props": {
                "label": "Programming language",
                "icon": "code",
                "description": "Repository's programming language.",
                "placeholder": "Python ...",
                "search": True,
                "multiple": True,
                "clearable": True,
            },
        },
        {
            "field": "code:developmentStatus",
            "ui_widget": "Dropdown",
            "props": {
                "label": "Development status",
                "placeholder": "",
                "icon": "heartbeat",
                "description": "Repository current status",
                "search": False,
                "multiple": False,
                "clearable": True,
            },
        },
    ],
}
