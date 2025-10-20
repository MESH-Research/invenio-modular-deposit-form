#
# Copyright (C) 2023 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Pytest configuration.

See https://pytest-invenio.readthedocs.io/ for documentation on which test
fixtures are available.
"""

import pytest
from invenio_app.factory import create_app as _create_app


@pytest.fixture(scope="module")
def app_config(app_config):
    """Application config override."""
    # TODO: Override any necessary config values for tests
    app_config["INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_VALUE"] = "test-foobar"
    return app_config


@pytest.fixture(scope="module")
def create_app(instance_path):
    """Application factory fixture."""
    return _create_app
