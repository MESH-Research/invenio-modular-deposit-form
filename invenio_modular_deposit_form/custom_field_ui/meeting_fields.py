#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.
"""UI configuration for meeting (conference) custom fields (single-field widgets).

These helpers mirror the default invenio-rdm-records meeting custom field,
but expose separate UI entries for each subfield so you can use the
single-field components (MeetingTitleComponent, MeetingAcronymComponent,
MeetingDatesComponent, MeetingPlaceComponent, MeetingURLComponent,
MeetingSessionComponent, MeetingSessionPartComponent) in the modular form
layout.
"""

from invenio_i18n import lazy_gettext as _

MEETING_CUSTOM_FIELDS_UI = {
    "section": _("Conference"),
    "fields": [
        {
            "field": "meeting:meeting.title",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Event title"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "meeting:meeting.acronym",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Acronym"),
                "placeholder": "",
                "description": "",
            },
        },
        {
            "field": "meeting:meeting.dates",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Dates"),
                "placeholder": _("e.g. 21-22 November 2022."),
                "description": "",
                "icon": "calendar",
            },
        },
        {
            "field": "meeting:meeting.place",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Location"),
                "placeholder": "",
                "description": "",
                "icon": "map marker alternate",
            },
        },
        {
            "field": "meeting:meeting.url",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Event URL"),
                "placeholder": "",
                "description": "",
                "icon": "linkify",
            },
        },
        {
            "field": "meeting:meeting.session",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Session"),
                "placeholder": _("e.g. VI"),
                "description": "",
            },
        },
        {
            "field": "meeting:meeting.session_part",
            "ui_widget": "TextField",
            "template": "meeting.html",
            "props": {
                "label": _("Session part"),
                "placeholder": _("e.g. 1"),
                "description": "",
            },
        },
    ],
}

