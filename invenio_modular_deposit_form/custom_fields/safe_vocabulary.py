#
# Copyright (C) 2023-2026 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""A VocabularyCF that gracefully handles missing vocabulary types.

Stock :class:`invenio_vocabularies.services.custom_fields.VocabularyCF`
calls ``current_service.read_all`` from ``options()`` whenever
``dump_options=True``, which raises ``sqlalchemy.exc.NoResultFound`` if the
vocabulary type referenced by ``vocabulary_id`` does not exist in the
database. Several ``invenio_app_rdm`` blueprint-scoped error handlers convert
``NoResultFound`` directly to a themed 404, so a single missing vocabulary
fixture (e.g. ``code:developmentStatus`` not loaded) takes down the entire
deposit form view at ``/uploads/new`` without surfacing the underlying cause
in any obvious way.

:class:`SafeVocabularyCF` overrides only ``options()`` to swallow
``NoResultFound``, log the missing vocabulary at ``WARNING``, and return an
empty options list. The form renders; the dropdown is empty until the
vocabulary is loaded. All other behavior — schema, mapping, multiplicity,
sort_by, etc. — is inherited unchanged.
"""

from typing import Any

from flask import current_app
from invenio_vocabularies.services.custom_fields import VocabularyCF
from sqlalchemy.exc import NoResultFound


class SafeVocabularyCF(VocabularyCF):
    """VocabularyCF that returns an empty options list when the vocab is missing.

    Adds no new instance state. Drop-in replacement for VocabularyCF; can be
    constructed directly or produced from an existing VocabularyCF instance
    via class-reassignment on a shallow copy (see
    ``invenio_modular_deposit_form.config.config._harden_vocabulary_cfs``).
    """

    def options(self, identity: Any) -> list[Any]:
        """Return UI-serialized vocabulary items, or [] if the vocab is missing.

        Args:
            identity: The Flask-Principal identity passed by the caller.

        Returns:
            A list of UI-serialized vocabulary items, or an empty list when
            the vocabulary type referenced by ``vocabulary_id`` is not
            present in the database.
        """
        try:
            return super().options(identity)
        except NoResultFound:
            current_app.logger.warning(
                "Vocabulary %s not loaded; rendering empty options "
                "for custom field %s",
                self.vocabulary_id,
                self.name,
            )
            return []
