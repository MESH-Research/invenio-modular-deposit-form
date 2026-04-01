#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

from invenio_i18n import lazy_gettext as _
from invenio_rdm_records.contrib.codemeta import (
    CODEMETA_CUSTOM_FIELDS,
    CODEMETA_NAMESPACE,
)
from invenio_rdm_records.contrib.imprint import (
    IMPRINT_CUSTOM_FIELDS,
    IMPRINT_NAMESPACE,
)
from invenio_rdm_records.contrib.journal import (
    JOURNAL_CUSTOM_FIELDS,
    JOURNAL_NAMESPACE,
)
from invenio_rdm_records.contrib.meeting import (
    MEETING_CUSTOM_FIELDS,
    MEETING_NAMESPACE,
)
from invenio_rdm_records.contrib.thesis import (
    THESIS_CUSTOM_FIELDS,
    THESIS_NAMESPACE,
)

from ..custom_field_ui.codemeta_fields import (
    CODEMETA_CUSTOM_FIELDS_UI,
)
from ..custom_field_ui.imprint_fields import (
    IMPRINT_CUSTOM_FIELDS_UI,
)
from ..custom_field_ui.journal_fields import (
    JOURNAL_CUSTOM_FIELDS_UI,
)
from ..custom_field_ui.meeting_fields import (
    MEETING_CUSTOM_FIELDS_UI,
)
from ..custom_field_ui.thesis_fields import (
    THESIS_CUSTOM_FIELDS_UI,
)
from .default import COMMON_FIELDS_DEFAULT_PAGED, FIELDS_BY_TYPE_DEFAULT_PAGED

MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION = False

MODULAR_DEPOSIT_FORM_DEFAULT_RESOURCE_TYPE = "publication-article"

MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP = True
"""When True, a full-width region above the form title shows the stock community 
banner (CommunityHeader) when the deposit state would show it (e.g. community 
selected or selectable)."""

MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
"""Basic page and field layout for the deposit form. Other presets are included 
in this package's config/ folder. If you wish to use an alternate default, or 
to create a custom layout, override this variable in your instance invenio.cfg
with your preferred layout.
"""

MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = FIELDS_BY_TYPE_DEFAULT_PAGED
"""Page and field layout overrides for specific resource types. Other presets are included 
in this package's config/ folder along with the matching 'COMMON_FIELDS' layouts. If you 
wish to use an alternate preset, or to create a custom set of resource type layout overrides, 
override this variable in your instance invenio.cfg.

Keys must match resource type IDs from your instance's resource type vocabulary. The presets
in this package assume the invenio-rdm-records default vocabulary
(invenio_rdm_records/fixtures/data/vocabularies/resource_types.yaml).

Only include overrides for the pages you wish to be changed for each resource type. Pages 
defined in your COMMON_FIELDS layout that aren't overridden in your overrides for a resource 
type will fall back to the default layout when that type is selected. 

If you do provide an override for a given page, your override will replace that page's 
COMMON_FIELDS layout entirely.

Omit resource types you are not customizing; missing resource types fall back to COMMON_FIELDS layout.

Per-page values are ``{"subsections": [...], "label"?: str}``; keys match each FormPage
``section`` in ``MODULAR_DEPOSIT_FORM_COMMON_FIELDS``.
"""

MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS = {
    "publication-article": {"metadata.title": _("Article title")},
    "publication-book": {"metadata.title": _("Book title")},
    "publication-section": {"metadata.title": _("Chapter/section title")},
    "dataset": {"metadata.title": _("Dataset title")},
    "software": {"metadata.title": _("Software name")},
    "software-computationalnotebook": {"metadata.title": _("Notebook name")},
}
"""Field label modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
readable labels.
"""

MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS = {}
"""Field placeholder modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
placeholder values.
"""

MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS = {}
"""Field description modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
description values.
"""

MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {}
"""Field label icon modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
icon name strings (matching semantic-ui fontawesome icon names).
"""

MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS = {}
"""Field help text modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
help text values.
"""

MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES = {
    "doi": {
        "field_label": "Digital Object Identifier",
        "pid_placeholder": _("Copy/paste your existing DOI here..."),
        "btn_label_discard_pid": _("Discard the reserved DOI."),
        "btn_label_get_pid": _("Get a DOI now!"),
        "managed_help_text": _(
            "Reserve a DOI by pressing the button "
            "(so it can be included in files prior to upload). "
            "The DOI is registered when your upload is published."
        ),
        "reserved_help_text": _(
            "Reserve a DOI by pressing the button "
            "(so it can be included in files prior to upload). "
            "The DOI is registered when your upload is published."
        ),
        "unmanaged_help_text": _(
            "Only enter a DOI if you have already registered one "
            "with a DOI provider. If you have not registered one "
            "we will register a DOI for you when your upload is published."
        ),
    }
}

MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES = {}
"""Field default value modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
default values.
"""

MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES = {}

MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS = {}

RDM_NAMESPACES = {
    **CODEMETA_NAMESPACE,
    **JOURNAL_NAMESPACE,
    **IMPRINT_NAMESPACE,
    **MEETING_NAMESPACE,
    **THESIS_NAMESPACE,
}

RDM_CUSTOM_FIELDS = [
    *CODEMETA_CUSTOM_FIELDS,
    *JOURNAL_CUSTOM_FIELDS,
    *IMPRINT_CUSTOM_FIELDS,
    *MEETING_CUSTOM_FIELDS,
    *THESIS_CUSTOM_FIELDS,
]

RDM_CUSTOM_FIELDS_UI = [
    CODEMETA_CUSTOM_FIELDS_UI,
    JOURNAL_CUSTOM_FIELDS_UI,
    IMPRINT_CUSTOM_FIELDS_UI,
    MEETING_CUSTOM_FIELDS_UI,
    THESIS_CUSTOM_FIELDS_UI,
]
