# Documentation

This directory contains the Sphinx documentation for the `invenio-modular-deposit-form` project.

## Building the Documentation

### Prerequisites

Install the documentation dependencies:

```bash
pip install -e ".[docs]"
```

Or with uv:

```bash
uv pip install -e ".[docs]"
```

### Local Development

To build the documentation locally:

```bash
cd docs
make html
```

The built documentation will be available in `docs/build/`.

### Live Reload

For development with live reload:

```bash
cd docs
sphinx-autobuild source build
```

## Documentation Structure

- `internal/` — Internal working notes (Markdown). **Not** part of the Sphinx build; only `source/` is published via the toctree.
- `source/` — Source files for the documentation
  - `index.md` — Main documentation index
  - `introduction.md` — Project introduction and features
  - `overview.md` — Conceptual overview and diagrams
  - `installation.md` — Installation and enabling client-side validation
  - `using.md` — Maintainer guide: defaults, first-run behaviour, customization entry points
  - `configuration.md` — Configuration and form layout
  - `field_components.md` — Built-in field components
  - `extending.md` — Entry points, registry, and custom components
  - `validation.md` — Client-side validation
  - `architecture.md` — Architecture and form state
  - `override-guide.md` — Overridable slots reference
  - `replacement_field_components.md` — Replacement field widget notes
- `build/` — Built documentation (generated)
- `Makefile` — Build automation

Images used in the docs should be placed in `source/_static/`.

## Deployment

The documentation is automatically built and deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment is handled by the GitHub Actions workflow in `.github/workflows/documentation.yml`, which publishes the contents of `docs/build` to the `gh-pages` branch.
