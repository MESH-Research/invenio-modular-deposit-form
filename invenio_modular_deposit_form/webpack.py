from invenio_assets.webpack import WebpackThemeBundle

from .webpack_extras import get_components_registry_path, get_validator_path

# Default stub path (relative to theme root) when no entry point is registered
_STUBS_PATH = "js/invenio_modular_deposit_form/stubs"

_aliases = {
    "@js/invenio_modular_deposit_form": "js/invenio_modular_deposit_form",
    "@translations/invenio_modular_deposit_form": "translations/invenio_modular_deposit_form",
    "@js/invenio_modular_deposit_form_validator": get_validator_path() or _STUBS_PATH,
    "@js/invenio_modular_deposit_form_components": get_components_registry_path() or _STUBS_PATH,
}

theme = WebpackThemeBundle(
    __name__,
    "assets",
    default="semantic-ui",
    themes={
        "semantic-ui": dict(
            entry={
                "invenio-modular-deposit-form": "./js/invenio_modular_deposit_form/index.js",
            },
            dependencies={},
            aliases=_aliases,
        ),
    },
)
