#! /bin/bash

set -a && source .env && set +a

echo "Installing dependencies..."
if [ ! -d "node_modules/invenio_rdm_records" ]; then
    echo "Symlinking Invenio-RDM-Records js assets from \$PYTHON_ENV_DIR/invenio_rdm_records/assets/semantic-ui/js/invenio_rdm_records/ to node_modules/invenio_rdm_records/"
    ln -s $PYTHON_ENV_DIR/invenio_rdm_records/assets/semantic-ui/js/invenio_rdm_records/ invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/testing_modules/invenio_rdm_records
fi
cd invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form
npm run test
