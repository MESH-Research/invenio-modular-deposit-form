#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

from ./default.py import COMMON_FIELDS_DEFAULT_PAGED

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_RESOURCE_TYPE = "publication-article"

INVENIO_MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP = True
"""When True, a full-width region above the form title shows the stock community 
banner (CommunityHeader) when the deposit state would show it (e.g. community 
selected or selectable)."""

INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
"""Basic page and field layout for the deposit form. Other presets are included 
in this package's config/ folder. If you wish to use an alternate default, or 
to create a custom layout, override this variable in your instance invenio.cfg
with your preferred layout.
"""

INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = {}
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
"""

INVENIO_MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS = {
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

INVENIO_MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS = {}
"""Field placeholder modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
placeholder values.
"""

INVENIO_MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS = {}
"""Field description modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
description values.
"""

INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {}
"""Field label icon modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
icon name strings (matching semantic-ui fontawesome icon names).
"""

INVENIO_MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS = {}
"""Field help text modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
help text values.
"""

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES = {}
"""Field default value modifications by resource type. Keys must match resource type IDs from your 
instance's resource_types vocabulary. Values map dot-separated metadata field paths to 
default values.
"""

INVENIO_MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES = {}

INVENIO_MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS = {}
