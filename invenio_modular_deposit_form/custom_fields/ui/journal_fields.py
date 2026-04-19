#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.
"""Metadata field UI configuration for journal (single-field widgets).

These helpers mirror the default invenio-rdm-records journal custom field,
but expose separate UI entries for each subfield so you can use the
single-field components (JournalTitleComponent, JournalISSNComponent, etc.)
in the modular form layout.
"""

from invenio_i18n import lazy_gettext as _

JOURNAL_CUSTOM_FIELDS_UI = {
    "section": _("Journal"),
    "fields": [
        {
            "field": "journal:journal.title",
            "ui_widget": "Input",  # "JournalTitleField",
            "template": "journal.html",
            "props": {
                "label": _("Journal Title"),
                "placeholder": "",
                "description": _(
                    "Title of the journal in which the article was published"
                ),
            },
        },
        {
            "field": "journal:journal.volume",
            "ui_widget": "Input",  # "JournalVolumeField",
            "template": "journal.html",
            "props": {
                "label": _("Volume"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "journal:journal.issue",
            "ui_widget": "Input",  # "JournalIssueField",
            "template": "journal.html",
            "props": {
                "label": _("Issue"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "journal:journal.pages",
            "ui_widget": "Input",  # "JournalPagesField",
            "template": "journal.html",
            "props": {
                "label": _("Pages"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "journal:journal.issn",
            "ui_widget": "Input",  # "JournalISSNField",
            "template": "journal.html",
            "props": {
                "label": _("ISSN"),
                "placeholder": "",
                "description": _("International Standard Serial Number"),
            },
        },
    ],
}
