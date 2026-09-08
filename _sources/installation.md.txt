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

## Client-side validation (optional)

Client-side validation is **on by default**. To turn it off and rely on
server-side validation only, set the following in your `invenio.cfg`:

```python
MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION = False
```

Changing this value requires rebuilding assets, because the choice is baked in
at build time. See [Validation](validation.md).

