# Installation

Until the package is published to PyPI, you can install it from GitHub from your
InvenioRDM instance directory.

## Using uv

```bash
uv add "invenio-modular-deposit-form @ git+https://github.com/MESH-Research/invenio-modular-deposit-form.git"
```

## Using pipenv

```bash
pipenv install "git+https://github.com/MESH-Research/invenio-modular-deposit-form.git"
```

After installation, the extension sets `APP_RDM_DEPOSIT_FORM_TEMPLATE` to use
this package's deposit template by default.

## Enable client-side validation (optional)

Client-side validation is opt-in. Set the following in your `invenio.cfg`:

```python
MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION = True
```

