#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Jinja filter for previewable file extensions (used by the deposit template)."""


def previewable_extensions(value):
    """Return the list of previewable file extensions for use in templates.

    Uses invenio_previewer when available (provided by invenio-app-rdm).
    The value argument is unused but required for Jinja filter syntax.

    Use in templates like: {{ "" | previewable_extensions }}
    """
    try:
        from invenio_previewer.proxies import current_previewer

        return list(current_previewer.previewable_extensions)
    except Exception:
        return []
