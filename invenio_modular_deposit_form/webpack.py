from invenio_assets.webpack import WebpackThemeBundle

theme = WebpackThemeBundle(
    __name__,
    "assets",
    default="semantic-ui",
    themes={
        "semantic-ui": dict(
            entry={
                "invenio-modular-deposit-form": (
                    "./js/invenio_modular_deposit_form/index.js",
                ),
            },
            dependencies={},
            aliases={
                # Define Semantic-UI theme configuration needed by
                # Invenio-Theme in order to build Semantic UI (in theme.js
                # entry point). theme.config itself is provided by
                # cookiecutter-invenio-rdm.
                "@js/invenio_modular_deposit_form": "js/invenio_modular_deposit_form",
                "@translations/invenio_modular_deposit_form": (
                    "translations/invenio_modular_deposit_form"
                ),
                # Invenio-RDM-Records js assets are symlinked from the
                # invenio_rdm_records python package into node_modules
                # for testing purposes. In production, the js assets are
                # installed by the InvenioRDM build process.
                # "@js/invenio_rdm_records": "../node_modules/invenio_rdm_records",
            },
        ),
    },
)
