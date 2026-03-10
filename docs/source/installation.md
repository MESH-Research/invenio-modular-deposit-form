# Installation

Until the package is published to PyPI, you can install it from GitHub from your InvenioRDM instance directory.

## Using uv

```bash
uv add "invenio-modular-deposit-form @ git+https://github.com/MESH-Research/invenio-modular-deposit-form.git"
```

## Using pipenv

```bash
pipenv install "git+https://github.com/MESH-Research/invenio-modular-deposit-form.git#egg=invenio-modular-deposit-form"
```

After installation, the extension sets `APP_RDM_DEPOSIT_FORM_TEMPLATE` to use this package's deposit template by default.

## Patch invenio-rdm-records for client-side validation (optional)

Passing `validate` and `validationSchema` into the deposit form requires that `DepositFormApp` and `DepositBootstrap` in invenio-rdm-records accept those props. invenio-rdm-records does not yet support them. If you wish to use client-side validation, you can use the included script to patch the files. The script is at `invenio_modular_deposit_form/scripts/apply_patches.sh` (in the repo or under your venv's site-packages after install). Run it with:

```bash
bash ./apply_patches.sh [venv_path]
```

If you run from your instance root and your instance venv is at `.venv`, you can use `./apply_patches.sh` with no arguments. Otherwise pass the full path to your instance venv (e.g. `./apply_patches.sh /path/to/my-instance/.venv`). The script reads patches from the installed package in site-packages and writes them into the installed `invenio_rdm_records` package. It doesn't matter where the script is located.

```{note}
Run the patch script again **after any reinstall or upgrade of invenio-rdm-records**; the patch modifies files inside the installed package, so they are overwritten when the package is updated.
```
