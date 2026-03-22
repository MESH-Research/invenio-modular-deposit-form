#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

from flask import Blueprint
from invenio_i18n import gettext as _

from . import config
from .filters import (
    current_user_profile_dict,
    merge_deposit_config,
    previewable_extensions,
)


def create_blueprint(app):
    """Blueprint for the routes and resources provided by Invenio-App-RDM."""
    blueprint = Blueprint(
        "invenio_modular_deposit_form",
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    return blueprint


def _apply_package_custom_fields_if_still_empty(app):
    """Apply this package's RDM custom field defaults only when config is still []."""
    if app.config.get("RDM_CUSTOM_FIELDS") == []:
        app.config["RDM_CUSTOM_FIELDS"] = config.RDM_CUSTOM_FIELDS
    if app.config.get("RDM_CUSTOM_FIELDS_UI") == []:
        app.config["RDM_CUSTOM_FIELDS_UI"] = config.RDM_CUSTOM_FIELDS_UI


def finalize_app(app):
    """Late pass after ``invenio_base.finalize_app`` (all extensions + instance cfg).

    If something left ``RDM_CUSTOM_FIELDS*`` as ``[]``, apply this package's defaults.
    Non-empty values from ``invenio.cfg`` are left unchanged.
    """
    _apply_package_custom_fields_if_still_empty(app)


def api_finalize_app(app):
    """Same hook for the API Flask application."""
    _apply_package_custom_fields_if_still_empty(app)


class InvenioModularDepositForm:
    """Invenio Modular Deposit Form extension."""

    def __init__(self, app=None):
        """Extension initialization."""
        # TODO: This is an example of translation string with comment. Please
        # remove it.
        # NOTE: This is a note to a translator.
        _("A translation string")
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Flask application initialization."""
        self.init_config(app)
        app.add_template_filter(previewable_extensions)
        app.add_template_filter(current_user_profile_dict)
        app.add_template_filter(merge_deposit_config)
        app.extensions["invenio-modular-deposit-form"] = self

    def init_config(self, app):
        """Initialize configuration.

        ``RDM_CUSTOM_FIELDS`` / ``RDM_CUSTOM_FIELDS_UI`` defaults are applied in
        :func:`finalize_app` so they run after the full config stack; see that
        function and :func:`_apply_package_custom_fields_if_still_empty`.
        """
        app.config["APP_RDM_DEPOSIT_FORM_TEMPLATE"] = (
            "invenio_modular_deposit_form/deposit.html"
        )
        for k in dir(config):
            if k.startswith("MODULAR_DEPOSIT_FORM_"):
                app.config.setdefault(k, getattr(config, k))
            elif k.startswith("RDM_NAMESPACES_"):
                app.config.setdefault(k, getattr(config, k))
