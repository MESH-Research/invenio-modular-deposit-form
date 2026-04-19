#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""UI configuration for thesis custom fields (single-field widgets).

These helpers mirror the default invenio-rdm-records thesis custom field,
but expose separate UI entries for each subfield so you can use the
single-field components in the modular form layout.
"""

from invenio_i18n import lazy_gettext as _

THESIS_CUSTOM_FIELDS_UI = {
    "section": _("Thesis"),
    "fields": [
        {
            "field": "thesis:thesis.university",
            "ui_widget": "Input",
            "props": {
                "label": _("Awarding university"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "thesis:thesis.department",
            "ui_widget": "Input",
            "props": {
                "label": _("Awarding department"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "thesis:thesis.type",
            "ui_widget": "Input",
            "props": {
                "label": _("Thesis type"),
                "placeholder": _("PhD"),
                "description": _(
                    "The type of thesis (e.g. Masters, PhD, Engineers, Bachelors)"
                ),
            },
        },
        {
            "field": "thesis:thesis.date_submitted",
            "ui_widget": "Input",
            "props": {
                "label": _("Submission date"),
                "placeholder": "",
                "description": _("Submission date in YYYY-MM-DD format."),
            },
        },
        {
            "field": "thesis:thesis.date_defended",
            "ui_widget": "Input",
            "props": {
                "label": _("Defense date"),
                "placeholder": "",
                "description": _("Defense date in YYYY-MM-DD format."),
            },
        },
    ],
}
