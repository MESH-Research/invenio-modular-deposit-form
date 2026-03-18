#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Jinja filter that merges stock forms_config with this extension's config for deposits-config.

Use in templates so the single hidden input name=\"deposits-config\" carries both
the view's forms_config and our MODULAR_DEPOSIT_FORM_* (and related) keys.
"""

from flask import current_app


# Map Flask config key -> key in merged JSON (snake_case for React unpacking)
_CONFIG_KEYS = [
    ("MODULAR_DEPOSIT_FORM_COMMON_FIELDS", "common_fields"),
    ("MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE", "fields_by_type"),
    ("MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS", "label_modifications"),
    (
        "MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS",
        "placeholder_modifications",
    ),
    (
        "MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS",
        "description_modifications",
    ),
    ("MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS", "icon_modifications"),
    ("MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS", "help_text_modifications"),
    ("MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES", "default_field_values"),
    ("MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES", "priority_field_values"),
    ("MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS", "extra_required_fields"),
    ("MODULAR_DEPOSIT_FORM_DEFAULT_RESOURCE_TYPE", "default_resource_type"),
    ("MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES", "pids_config_overrides"),
    ("MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP", "show_community_banner_at_top"),
    ("RDM_RECORDS_PERMISSIONS_PER_FIELD", "permissions_per_field"),
]


def merge_deposit_config(forms_config, extra=None):
    """Merge stock forms_config with this extension's config for the deposits-config payload.

    Args:
        forms_config: The dict from the view (get_form_config(...)), or None.
        extra: Optional dict with keys to merge last, e.g. current_user_profile,
               previewable_extensions (so they can be injected from template filters).

    Returns:
        A single dict suitable for the hidden input name=\"deposits-config\".
    """
    base = dict(forms_config) if forms_config else {}
    for config_key, payload_key in _CONFIG_KEYS:
        value = current_app.config.get(config_key)
        if value is not None:
            base[payload_key] = value

    # Validation: max title length and identifier schemes for dynamic schema
    base["max_title_length"] = current_app.config.get("RDM_RECORDS_MAX_TITLE_LENGTH", 260)
    personorg_schemes = current_app.config.get("RDM_RECORDS_PERSONORG_SCHEMES", {})
    if personorg_schemes:
        base.setdefault("vocabularies", {})
        base["vocabularies"].setdefault("metadata", {})
        base["vocabularies"]["metadata"].setdefault("creators", {})
        base["vocabularies"]["metadata"]["creators"]["identifiers"] = {
            "scheme": [
                {"id": k, "title_l10n": str(v.get("label", k))}
                for k, v in personorg_schemes.items()
            ]
        }
    record_identifiers_schemes = current_app.config.get("RDM_RECORDS_IDENTIFIERS_SCHEMES", {})
    if record_identifiers_schemes:
        base.setdefault("vocabularies", {})
        base["vocabularies"].setdefault("metadata", {})
        base["vocabularies"]["metadata"].setdefault("identifiers", {})
        base["vocabularies"]["metadata"]["identifiers"]["scheme"] = [
            {"id": k, "title_l10n": str(v.get("label", k))}
            for k, v in record_identifiers_schemes.items()
        ]

    if extra:
        base.update(extra)
    return base
