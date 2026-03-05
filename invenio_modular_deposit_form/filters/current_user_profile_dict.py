#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Jinja filter that returns the current user's profile as a dict for the deposit template.

Uses invenio_userprofiles.api.current_userprofile (core InvenioRDM). For anonymous
users or when the profile has no user_profile data, returns a dict with id and
schema fields set to empty string.

Use in templates like: {{ "" | current_user_profile_dict }}
"""

from flask import current_app
from invenio_userprofiles.api import current_userprofile


def current_user_profile_dict(value):
    """Return the current user profile as a dict (id + ACCOUNTS_USER_PROFILE_SCHEMA fields).

    The value argument is unused but required for Jinja filter syntax.
    For anonymous users or when profile data is missing, returns a dict with
    id "" and empty strings for each profile field.
    """
    result = {"id": ""}
    schema = current_app.config.get("ACCOUNTS_USER_PROFILE_SCHEMA")
    if schema and getattr(schema, "fields", None):
        for field in schema.fields.keys():
            result[field] = ""

    profile = current_userprofile
    if profile is None:
        return result
    result["id"] = str(profile.id) if getattr(profile, "id", None) else ""
    user_profile_data = getattr(profile, "user_profile", None)
    if not user_profile_data:
        return result
    if schema and getattr(schema, "fields", None):
        for field in schema.fields.keys():
            result[field] = user_profile_data.get(field, "") or ""
    return result
