# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Module tests."""

from flask import Flask

from invenio_modular_deposit_form import InvenioModularDepositForm


def test_version():
    """Test version import."""
    from invenio_modular_deposit_form import __version__

    assert __version__


def test_init():
    """Test extension initialization."""
    app = Flask("testapp")
    ext = InvenioModularDepositForm(app)
    assert "invenio-modular-deposit-form" in app.extensions

    app = Flask("testapp")
    ext = InvenioModularDepositForm()
    assert "invenio-modular-deposit-form" not in app.extensions
    ext.init_app(app)
    assert "invenio-modular-deposit-form" in app.extensions


def test_view(base_client):
    """Test view."""
    res = base_client.get("/")
    assert res.status_code == 200
    assert "Welcome to Invenio Modular Deposit Form" in str(res.data)
