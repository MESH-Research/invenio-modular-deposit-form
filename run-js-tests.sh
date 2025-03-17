#! /bin/bash

set -a && source .env && set +a

echo "Installing dependencies..."
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_rdm_records" ]; then
    echo "Symlinking Invenio-RDM-Records js assets from \$PYTHON_ENV_DIR/invenio_rdm_records/assets/semantic-ui/js/invenio_rdm_records/ to testing_modules/invenio_rdm_records"
    cp -r $PYTHON_ENV_DIR/invenio_rdm_records/assets/semantic-ui/js/invenio_rdm_records/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_rdm_records
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_rdm_records" ]; then
    echo "Symlinking Invenio-RDM-Records translations from \$PYTHON_ENV_DIR/invenio_rdm_records/assets/semantic-ui/translations/invenio_rdm_records/ to testing_translations/invenio_rdm_records"
    cp -r $PYTHON_ENV_DIR/invenio_rdm_records/assets/semantic-ui/translations/invenio_rdm_records/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_rdm_records
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_communities" ]; then
    echo "Symlinking Invenio-Communities js assets from \$PYTHON_ENV_DIR/invenio_communities/assets/semantic-ui/js/invenio_communities/ to testing_modules/invenio_communities"
    cp -r $PYTHON_ENV_DIR/invenio_communities/assets/semantic-ui/js/invenio_communities/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_communities
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_communities" ]; then
    echo "Symlinking Invenio-Communities translations from \$PYTHON_ENV_DIR/invenio_communities/assets/semantic-ui/translations/invenio_communities/ to testing_translations/invenio_communities"
    cp -r $PYTHON_ENV_DIR/invenio_communities/assets/semantic-ui/translations/invenio_communities/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_communities
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_app_rdm" ]; then
    echo "Symlinking Invenio-App-RDM translations from \$PYTHON_ENV_DIR/invenio_app_rdm/theme/assets/semantic-ui/translations/invenio_app_rdm/ to testing_translations/invenio_app_rdm"
    cp -r $PYTHON_ENV_DIR/invenio_app_rdm/theme/assets/semantic-ui/translations/invenio_app_rdm/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_app_rdm
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_search_ui" ]; then
    echo "Symlinking Invenio-Search-UI js assets from \$PYTHON_ENV_DIR/invenio_search_ui/assets/semantic-ui/js/invenio_search_ui/ to testing_modules/invenio_search_ui"
    cp -r $PYTHON_ENV_DIR/invenio_search_ui/assets/semantic-ui/js/invenio_search_ui/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_search_ui
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_search_ui" ]; then
    echo "Symlinking Invenio-Search-UI translations from \$PYTHON_ENV_DIR/invenio_search_ui/assets/semantic-ui/translations/invenio_search_ui/ to testing_translations/invenio_search_ui"
    cp -r $PYTHON_ENV_DIR/invenio_search_ui/assets/semantic-ui/translations/invenio_search_ui/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_search_ui
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_theme" ]; then
    echo "Symlinking Invenio-Theme js assets from \$PYTHON_ENV_DIR/invenio_theme/assets/semantic-ui/js/invenio_theme/ to testing_modules/invenio_theme"
    cp -r $PYTHON_ENV_DIR/invenio_theme/assets/semantic-ui/js/invenio_theme/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_theme
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_theme" ]; then
    echo "Symlinking Invenio-Theme translations from \$PYTHON_ENV_DIR/invenio_theme/assets/semantic-ui/translations/invenio_theme/ to testing_translations/invenio_theme"
    cp -r $PYTHON_ENV_DIR/invenio_theme/assets/semantic-ui/translations/invenio_theme/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_theme
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_vocabularies " ]; then
    echo "Symlinking Invenio-Vocabularies js assets from \$PYTHON_ENV_DIR/invenio_vocabularies/assets/semantic-ui/js/invenio_vocabularies/ to testing_modules/invenio_vocabularies"
    cp -r $PYTHON_ENV_DIR/invenio_vocabularies/assets/semantic-ui/js/invenio_vocabularies/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_vocabularies
fi
if [ ! -d "invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_vocabularies" ]; then
    echo "Symlinking Invenio-Vocabularies translations from \$PYTHON_ENV_DIR/invenio_vocabularies/assets/semantic-ui/translations/invenio_vocabularies/ to testing_translations/invenio_vocabularies"
    cp -r $PYTHON_ENV_DIR/invenio_vocabularies/assets/semantic-ui/translations/invenio_vocabularies/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_translations/invenio_vocabularies
fi

cd invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form
npm run test
