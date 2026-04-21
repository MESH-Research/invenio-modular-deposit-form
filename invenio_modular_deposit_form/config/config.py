#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

import copy

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
from invenio_vocabularies.services.custom_fields import VocabularyCF

from ..custom_fields.safe_vocabulary import SafeVocabularyCF
from ..custom_fields.ui.codemeta_fields import (
    CODEMETA_CUSTOM_FIELDS_UI,
)
from ..custom_fields.ui.imprint_fields import (
    IMPRINT_CUSTOM_FIELDS_UI,
)
from ..custom_fields.ui.journal_fields import (
    JOURNAL_CUSTOM_FIELDS_UI,
)
from ..custom_fields.ui.meeting_fields import (
    MEETING_CUSTOM_FIELDS_UI,
)
from ..custom_fields.ui.thesis_fields import (
    THESIS_CUSTOM_FIELDS_UI,
)
from .default import COMMON_FIELDS_DEFAULT_PAGED, FIELDS_BY_TYPE_DEFAULT_PAGED
from .alternate_paged import (
    COMMON_FIELDS_ALTERNATE_PAGED,
    FIELDS_BY_TYPE_ALTERNATE_PAGED,
)

MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION = True
"""When True, the validator.js validation schema will be used to validate 
form field values prior to form submission. Whe False, form errors will 
only be displayed after the form is submitted. (You must rebuild assets 
for a change in this value to take effect.)"""

MODULAR_DEPOSIT_FORM_USE_CONFIRM_MODAL = False
"""When True, a confirm modal will be displayed when a user tries to leave a 
form page with a current error. When False, the errors on the page will be 
flagged on page exit but no modal confirmation will be required."""

MODULAR_DEPOSIT_FORM_PRIORITY_RESOURCE_TYPES: tuple[str, ...] = (
    "publication-article",
    "publication-peerreview",
    "publication-book",
    "publication-section",
    "lesson",
)
"""Ordered vocabulary ids for ``ResourceTypeSelectorField`` shortcut buttons.

Only the **first five** entries are shown as buttons (plus a fixed “Other…” control
that opens the full vocabulary select). Additional ids in the tuple or in an
instance override are ignored for the button row; list more-specific types first.
"""

MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP = True
"""When True, a full-width region above the form title shows the stock community 
banner (CommunityHeader) when the deposit state would show it (e.g. community 
selected or selectable)."""

MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_ALTERNATE_PAGED
"""Basic page and field layout for the deposit form. Other presets are included 
in this package's config/ folder. If you wish to use an alternate default, or 
to create a custom layout, override this variable in your instance invenio.cfg
with your preferred layout.
"""

MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = FIELDS_BY_TYPE_ALTERNATE_PAGED
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
    "audio": {
        "metadata.title": _("Recording Title"),
        "custom_fields.kcr:publication_url": _("Project URL"),
    },
    "video": {
        "metadata.title": _("Recording Title"),
        "custom_fields.kcr:publication_url": _("Project URL"),
    },
    "dataset": {
        "metadata.title": _("Dataset Title"),
        "custom_fields.kcr:publication_url": _("Project URL"),
    },
    "image": {
        "metadata.title": _("Image Title"),
        "custom_fields.imprint:imprint.place": _("Location"),
        "custom_fields.kcr:publication_url": _("Project URL"),
    },
    "image-figure": {"metadata.title": _("Figure Title")},
    "image-plot": {"metadata.title": _("Chart Title")},
    "image-drawing": {"metadata.title": _("Artwork Title")},
    "image-diagram": {"metadata.title": _("Diagram Title")},
    "image-photo": {
        "metadata.title": _("Photograph Title"),
        "custom_fields.imprint:imprint.place": _("Location"),
        "custom_fields.kcr:publication_url": _("Project URL"),
    },
    "image-other": {
        "metadata.title": _("Image Title"),
        "custom_fields.kcr:publication_url": _("Project URL"),
    },
    "lesson": {"metadata.title": _("Resource Title")},
    "presentation": {"metadata.title": _("Presentation Title")},
    "poster": {"metadata.title": _("Poster Title")},
    "software": {"metadata.title": _("Software Name")},
    "software-computationalnotebook": {
        "metadata.title": _("Notebook Name"),
        "metadata.identifiers": _("Notebook URLs and Other Identifiers"),
    },
    "publication-article": {
        "metadata.title": _("Article Title"),
        "custom_fields.journal:journal.pages": _("Article pages"),
    },
    "publication-book": {"metadata.title": _("Monograph Title")},
    "publication-section": {"metadata.title": _("Chapter/Section Title")},
    "publication-conferencepaper": {"metadata.title": _("Paper Title")},
    "publication-conferenceproceeding": {
        "metadata.title": _("Proceedings Title"),
        "metadata.identifiers": _("Proceedings URL and Other Identifiers"),
    },
    "publication-datamanagementplan": {
        "metadata.title": _("Plan Title"),
        "metadata.identifiers": _("Plan URLs and Other Identifiers"),
    },
    "publication-softwaredocumentation": {
        "metadata.title": _("Documentation Title"),
        "metadata.identifiers": _("Documentation URLs and Other Identifiers"),
    },
    "publication-preprint": {"metadata.title": _("Preprint Title")},
    "publication-report": {
        "metadata.title": _("Report Title"),
        "custom_fields.imprint:imprint.pages": _("Total report pages"),
    },
    "publication-peerreview": {
        "metadata.title": _("Review Title"),
        "custom_fields.journal:journal.title": _("Magazine/periodical title"),
        "custom_fields.journal:journal.pages": _("Review pages"),
        "metadata.identifiers": _("Review URLs and Other Identifiers"),
    },
    "publication-thesis": {"metadata.title": _("Thesis/Dissertation Title")},
    "publication-workingpaper": {
        "metadata.title": _("Working Paper Title"),
        "metadata.identifiers": _("Working Paper URLs and Other Identifiers"),
    },
    "publication-standard": {
        "metadata.title": _("Standard Title"),
        "metadata.identifiers": _("Standard URLs and Other Identifiers"),
    },
    "event": {"metadata.title": _("Event Title")},
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
            "This DOI has been reserved for the current record. "
            "It will be registered when your upload is published, "
            "and it will not change unless you discard it here."
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


def _harden_vocabulary_cfs(fields):
    """Replace each VocabularyCF with a SafeVocabularyCF carrying the same state.

    Stock ``VocabularyCF.options()`` raises ``NoResultFound`` when its
    referenced vocabulary type isn't loaded in the database, which various
    invenio_app_rdm blueprint-scoped error handlers convert directly to a
    themed 404 (taking down e.g. ``/uploads/new``). ``SafeVocabularyCF``
    swallows that exception, logs at WARNING, and renders an empty options
    list so the form stays usable. See ``SafeVocabularyCF`` for details.

    Implementation: shallow-copies each VocabularyCF instance and reassigns
    its ``__class__`` to ``SafeVocabularyCF``. This is safe because the
    subclass adds no new instance state; only ``options()`` is overridden.
    The shallow copy avoids mutating the upstream
    ``invenio_rdm_records.contrib.*.CUSTOM_FIELDS`` lists in place — other
    importers of those lists keep the stock VocabularyCF behaviour.

    Args:
        fields: An iterable of custom field instances.

    Returns:
        A new list containing the (possibly hardened) custom field
        instances in the original order. Non-VocabularyCF entries pass
        through unchanged.
    """
    out = []
    for cf in fields:
        if isinstance(cf, VocabularyCF) and not isinstance(cf, SafeVocabularyCF):
            new_cf = copy.copy(cf)
            new_cf.__class__ = SafeVocabularyCF
            out.append(new_cf)
        else:
            out.append(cf)
    return out


RDM_NAMESPACES = {
    **CODEMETA_NAMESPACE,
    **JOURNAL_NAMESPACE,
    **IMPRINT_NAMESPACE,
    **MEETING_NAMESPACE,
    **THESIS_NAMESPACE,
}

# TODO: Submit a PR to invenio-vocabularies adding a constructor option
# (e.g. ``missing_vocab_ok=True``) to ``VocabularyCF`` so the ``options()``
# fallback below can be removed. Once that lands upstream and we pin a
# version that includes it, drop ``_harden_vocabulary_cfs`` and
# ``SafeVocabularyCF`` and let the upstream contrib lists flow through
# unchanged.
RDM_CUSTOM_FIELDS = [
    *_harden_vocabulary_cfs(CODEMETA_CUSTOM_FIELDS),
    *_harden_vocabulary_cfs(JOURNAL_CUSTOM_FIELDS),
    *_harden_vocabulary_cfs(IMPRINT_CUSTOM_FIELDS),
    *_harden_vocabulary_cfs(MEETING_CUSTOM_FIELDS),
    *_harden_vocabulary_cfs(THESIS_CUSTOM_FIELDS),
]

RDM_CUSTOM_FIELDS_UI = [
    CODEMETA_CUSTOM_FIELDS_UI,
    JOURNAL_CUSTOM_FIELDS_UI,
    IMPRINT_CUSTOM_FIELDS_UI,
    MEETING_CUSTOM_FIELDS_UI,
    THESIS_CUSTOM_FIELDS_UI,
]
