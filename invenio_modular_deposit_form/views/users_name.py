#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""API view to update a user's local name-parts override.

Writes ``user_profile["name_parts_local"]`` (a JSON string of the form
``{"first": <given>, "last": <family>}``) for an authenticated user.

The ``name_parts_local`` field is the user-controlled local override of the
remote-synced ``name_parts`` field; updating it preserves the user's chosen
given/family split across remote re-syncs.

After the profile write commits, this view also runs a **synchronous** Names
vocabulary upsert via ``current_names_sync_service`` so creator lookup
reflects the new split immediately. ``NamesSyncService`` already prefers
``name_parts_local`` over ``name_parts``.

Authorization: the caller must either be the target user or hold the
``administration-access`` action.

CSRF: relies on Invenio's global ``CSRFProtectMiddleware``; no per-view
exemption.

Non-2xx responses use Flask ``abort()``; Invenio-REST's app-level handlers
turn those into JSON ``{"status", "message"}`` bodies.
"""

from __future__ import annotations

import json
from typing import Any

from flask import Blueprint, Flask, abort, current_app, request
from flask.views import MethodView
from flask_login import current_user
from invenio_access.utils import get_identity
from invenio_accounts.proxies import current_accounts
from invenio_administration.permissions import administration_permission
from invenio_remote_user_data_kcworks.proxies import current_names_sync_service

MAX_NAME_PART_LENGTH = 255


def _coerce_name_part(raw: Any, *, field: str, allow_empty: bool) -> str:
    """Validate and normalize a single name-part string.

    Args:
        raw: Incoming value from the JSON body.
        field: Field name, used in error messages.
        allow_empty: When False, an empty (post-strip) value raises BadRequest.

    Returns:
        The stripped string.

    Raises:
        werkzeug.exceptions.BadRequest: If the value is not a string, exceeds
            the length cap, or is empty when ``allow_empty`` is False.
    """
    if not isinstance(raw, str):
        abort(400, description=f"'{field}' must be a string.")
    value = raw.strip()
    if len(value) > MAX_NAME_PART_LENGTH:
        abort(
            400,
            description=(
                f"'{field}' exceeds the maximum length of "
                f"{MAX_NAME_PART_LENGTH} characters."
            ),
        )
    if not value and not allow_empty:
        abort(400, description=f"'{field}' is required.")
    return value


class UserNameView(MethodView):
    """Update ``user_profile['name_parts_local']`` for a given user."""

    view_name = "modular_deposit_form_user_name"

    def post(self, user_id: int):
        """Handle ``POST /users/<user_id>/name``.

        Body: ``{"family_name": str, "given_name": str}``.

        Args:
            user_id: ID of the user whose ``name_parts_local`` will be set.

        Returns:
            A dict ``{"name_parts_local": {"first": <given>, "last": <family>},
            "names_synced": <bool>}`` (Flask serializes it as JSON 200).
            ``names_synced`` is ``True`` when a Names vocabulary record was
            created or updated; ``False`` when sync was skipped (e.g.
            insufficient profile data).

        Raises:
            werkzeug.exceptions.HTTPException: Via ``abort()`` for auth,
                validation, not-found, and Names-sync failures. Invenio-REST
                serializes these as JSON error responses.
        """
        if not current_user.is_authenticated:
            abort(401)

        is_self = int(current_user.id) == int(user_id)
        is_admin = administration_permission.allows(get_identity(current_user))
        if not (is_self or is_admin):
            abort(
                403,
                description=(
                    "You may only update your own name, unless you are an "
                    "administrator."
                ),
            )

        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            abort(400, description="Request body must be a JSON object.")

        family = _coerce_name_part(
            body.get("family_name", ""), field="family_name", allow_empty=False
        )
        given = _coerce_name_part(
            body.get("given_name", ""), field="given_name", allow_empty=True
        )

        target_user = current_accounts.datastore.get_user_by_id(user_id)
        if target_user is None:
            abort(404, description=f"User {user_id} not found.")

        try:
            existing_profile = dict(target_user.user_profile or {})
        except (TypeError, ValueError):
            current_app.logger.warning(
                "user_profile for user %s was not a mapping; resetting.",
                user_id,
            )
            existing_profile = {}

        new_parts = {"first": given, "last": family}
        existing_profile["name_parts_local"] = json.dumps(new_parts)
        target_user.user_profile = existing_profile
        current_accounts.datastore.commit()

        # Re-read so Names sync sees the committed profile blob.
        synced_user = current_accounts.datastore.get_user_by_id(user_id) or target_user
        try:
            names_record = current_names_sync_service.upsert_name_for_user(
                synced_user
            )
        except Exception:
            current_app.logger.exception(
                "Names sync failed after name_parts_local update for user %s",
                user_id,
            )
            abort(
                500,
                description=(
                    "Your name was saved on your profile, but updating the "
                    "Names vocabulary failed. Please try again or contact "
                    "an administrator."
                ),
            )

        return {
            "name_parts_local": new_parts,
            "names_synced": names_record is not None,
        }


def create_api_blueprint(app: Flask) -> Blueprint:
    """Create the modular-deposit-form API blueprint.

    Mounted by ``invenio_base.api_blueprints``; the API app prepends
    ``/api`` so the effective URL is ``/api/modular-deposit-form/...``.

    Args:
        app: The Flask app the blueprint will be registered on (unused, but
            required by the ``invenio_base.api_blueprints`` factory contract).

    Returns:
        The configured :class:`flask.Blueprint`.
    """
    blueprint = Blueprint(
        "invenio_modular_deposit_form_api",
        __name__,
        url_prefix="/modular-deposit-form",
    )

    blueprint.add_url_rule(
        "/users/<int:user_id>/name",
        view_func=UserNameView.as_view(UserNameView.view_name),
        methods=["POST"],
    )

    return blueprint
