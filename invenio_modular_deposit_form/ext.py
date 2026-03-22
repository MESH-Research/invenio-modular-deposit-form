#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

from flask import Blueprint
from invenio_i18n import gettext as _
from invenio_rdm_records.config import RDM_CUSTOM_FIELDS as _RDM_RECORDS_CUSTOM_FIELDS
from invenio_rdm_records.config import RDM_CUSTOM_FIELDS_UI as _RDM_RECORDS_CUSTOM_FIELDS_UI

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

        ``invenio_rdm_records`` registers ``RDM_CUSTOM_FIELDS`` and
        ``RDM_CUSTOM_FIELDS_UI`` first (defaults are empty lists). A plain
        ``setdefault`` here would never apply this package's defaults, so
        ``load_custom_fields()`` in the deposit view would keep returning empty
        ``ui`` even in a "vanilla" install. When the app still has the stock
        empty lists, replace them with our defaults; if the instance overrides
        them in ``invenio.cfg``, leave those values in place.
        """
        app.config["APP_RDM_DEPOSIT_FORM_TEMPLATE"] = (
            "invenio_modular_deposit_form/deposit.html"
        )
        for k in dir(config):
            if k.startswith("MODULAR_DEPOSIT_FORM_"):
                app.config.setdefault(k, getattr(config, k))
            elif k.startswith("RDM_CUSTOM_FIELDS"):
                value = getattr(config, k)
                if k == "RDM_CUSTOM_FIELDS" and app.config.get(
                    "RDM_CUSTOM_FIELDS"
                ) == _RDM_RECORDS_CUSTOM_FIELDS:
                    app.config["RDM_CUSTOM_FIELDS"] = value
                elif k == "RDM_CUSTOM_FIELDS_UI" and app.config.get(
                    "RDM_CUSTOM_FIELDS_UI"
                ) == _RDM_RECORDS_CUSTOM_FIELDS_UI:
                    app.config["RDM_CUSTOM_FIELDS_UI"] = value
                else:
                    app.config.setdefault(k, value)
            elif k.startswith("RDM_NAMESPACES_"):
                app.config.setdefault(k, getattr(config, k))
