from invenio_assets.webpack import WebpackThemeBundle

from .webpack_extras import get_components_registry_path, get_transformations_path, get_validator_path

_aliases = {
    "@js/invenio_modular_deposit_form": "js/invenio_modular_deposit_form",
    "@translations/invenio_modular_deposit_form": "translations/invenio_modular_deposit_form",
    "@js/invenio_modular_deposit_form_validator": get_validator_path(),
    "@js/invenio_modular_deposit_form_components": get_components_registry_path(),
    "@js/invenio_modular_deposit_form_transformations": get_transformations_path(),
}

theme = WebpackThemeBundle(
    __name__,
    "assets",
    default="semantic-ui",
    themes={
        "semantic-ui": dict(
            entry={
                "invenio-modular-deposit-form": "./js/invenio_modular_deposit_form/index.js",
                "invenio-modular-deposit-form-css": "./less/invenio_modular_deposit_form/deposit_form.less",
            },
            dependencies={
                "geopattern": "^1.2.3",
                "orcid-utils": "^1.2.2",
                "yup": "^0.32.11",
            },
            aliases=_aliases,
        ),
    },
)
