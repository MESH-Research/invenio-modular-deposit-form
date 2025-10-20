#
# Copyright (C) 2023 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

from flask import Blueprint
from invenio_i18n import gettext as _

from . import config


def create_blueprint(app):
    """Blueprint for the routes and resources provided by Invenio-App-RDM."""
    blueprint = Blueprint(
        "invenio_modular_deposit_form",
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    return blueprint


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
        app.extensions["invenio-modular-deposit-form"] = self

    def init_config(self, app):
        """Initialize configuration."""
        # Use theme's base template if theme is installed
        if "BASE_TEMPLATE" in app.config:
            app.config.setdefault(
                "INVENIO_MODULAR_DEPOSIT_FORM_BASE_TEMPLATE",
                app.config["BASE_TEMPLATE"],
            )
        for k in dir(config):
            if k.startswith("INVENIO_MODULAR_DEPOSIT_FORM_"):
                app.config.setdefault(k, getattr(config, k))
