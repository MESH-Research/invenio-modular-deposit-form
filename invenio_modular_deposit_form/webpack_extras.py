#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""Resolve deposit form validator and components registry paths from Python entry points.

Used by webpack.py to set webpack aliases so validator.js and componentsRegistry.js
are loaded from instance-provided paths when entry points are registered.
"""

import json
import os
from pathlib import Path
from time import time

from flask import current_app

_GROUP_VALIDATOR = "invenio_modular_deposit_form.validator"
_GROUP_COMPONENTS_REGISTRY = "invenio_modular_deposit_form.components_registry"


def _resolve_path(group):
    """Return the absolute path from the first entry point in group, or None."""
    try:
        from importlib.metadata import entry_points

        eps = entry_points(group=group)
    except (ImportError, TypeError):
        # Python < 3.10 or entry_points() doesn't accept group=; fall back to pkg_resources.
        # Prefer importlib.metadata when available (pkg_resources is being deprecated).
        try:
            import pkg_resources

            eps = list(pkg_resources.iter_entry_points(group))
        except Exception:
            return None
    else:
        eps = list(eps)

    if not eps:
        return None
    first = next(iter(eps), None)
    if not first:
        return None
    try:
        get_path = first.load()
        path = get_path()
    except Exception:
        return None
    if not path or not isinstance(path, str):
        return None
    return os.path.abspath(path)


def get_validator_path() -> str:
    """Return the directory path for validator.js.

    Resolution priority:
    1. Instance-provided entry point in ``invenio_modular_deposit_form.validator``
       (only when MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION is truthy).
    2. Package default ``assets/semantic-ui/js/invenio_modular_deposit_form/validation``.
    """
    module_path = Path(__file__).resolve().parent
    default_path = (
        module_path
        / "assets"
        / "semantic-ui"
        / "js"
        / "invenio_modular_deposit_form"
        / "validation"
    )

    validation_flag = current_app.config.get(
        "MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION", False
    )
    override_path = _resolve_path(_GROUP_VALIDATOR) if validation_flag else None
    resolved_path = str((override_path or default_path).resolve())

    # region agent log
    try:
        payload = {
            "sessionId": "1ba8a1",
            "runId": "pre-fix",
            "hypothesisId": "H1",
            "location": "webpack_extras.get_validator_path",
            "message": "Resolved validator path",
            "data": {
                "validation_flag": bool(validation_flag),
                "override_path": override_path,
                "resolved_path": resolved_path,
            },
            "timestamp": int(time() * 1000),
        }
        log_path = "/Users/ianscott/Development/v13test/debug-1ba8a1.log"
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except Exception:
        # Logging must never affect runtime behavior.
        pass
    # endregion

    return resolved_path


def get_components_registry_path():
    """Return the directory path for componentsRegistry.js, or None.

    Resolves the first entry point in ``invenio_modular_deposit_form.components_registry``.
    The callable must return a path to a directory containing componentsRegistry.js
    (absolute path recommended).
    """
    return _resolve_path(_GROUP_COMPONENTS_REGISTRY)
