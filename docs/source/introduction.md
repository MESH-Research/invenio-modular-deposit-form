# Introduction

{bdg-warning}`Beta`

**Beta version** — Usage and configuration may change.

Invenio Modular Deposit Form is an InvenioRDM extension that adds a
configurable layout and navigation layer, resource-type-driven field
adaptations, client-side validation, in-browser autosave, and
submission-time metadata transformations to the InvenioRDM record deposit
form — all controllable from `invenio.cfg` without requiring custom React
development.

Copyright (C) 2023-2026 Mesh Research. Licensed under the MIT License. See
`LICENSE` file for details.

## Features

This extension provides a flexible, extensible layout and validation layer for
the InvenioRDM deposit form that allows:

- **Flexible customization of deposit form layout via config variables**
  - Deep form customization **just from `invenio.cfg`**
  - Optional stepped **multi-page** form flow
  - Navigation components: page stepper, sidebar page menu, and bottom
    navigation bar — all displaying live severity-aware error badge counts
  - Extensible via custom React components, ReactOverridable overrides, and
    custom fields
- **Form UI changes based on resource type**
  - Field visibility and page layout
  - Page/step visibility and title
  - Widget properties (labels, icons, placeholders, help text, etc.)
  - Alternate component variants (e.g. flat creatibutors layout, alternate
    resource-type selector) selectable per resource type
- **Integration of custom fields** freely into the main form layout
  - Custom fields can be placed on any page and laid out alongside core fields
- **Client-side form validation**
  - Driven by a customizable [Yup](https://github.com/jquense/yup) schema
  - Closely mirrors InvenioRDM's server-side field schemas, including
    per-scheme identifier format validation (ORCID, ROR, DOI, arXiv, and
    others) and vocabulary-constrained roles and types
  - Schema is built at form initialisation from the instance's configured
    vocabularies and settings, so constraints automatically reflect what the
    instance permits
  - Schema can be fully replaced or extended via a Python entry point
- **Autosave** of unsubmitted form values to browser local storage, with a
  restore modal on return
- **Submission-time metadata transformations** via a configurable chain of
  pure functions applied to form values before they are sent to the backend

## Aims

The goal of this package is to augment and expand on the existing InvenioRDM
deposit form, not to replace it. The core submission pipeline, API
communication, Formik form state management, and the majority of field widgets
come unchanged from `invenio-rdm-records`; this package adds a configuration
and layout layer on top. The aim is to provide flexibility and functionality
that would otherwise require extensive bespoke per-instance development.

```{note}
The package bundles replacement versions of a number of stock
`invenio_rdm_records` field components and `react-invenio-forms` input
controls. These replacements implement touched-aware error display (errors
become visible only after a field has been interacted with) and are used
unconditionally — they are not specific to the client-side validation feature.

The package also provides its own versions of `DepositFormApp` and
`DepositBootstrap` (the root components that bootstrap the deposit form),
exposing the `validationSchema` prop that the stock versions do not yet support.
This allows client-side validation to work without patching the installed
`invenio-rdm-records` package.

The goal is to upstream the `validationSchema` prop support so these
replacement components are no longer necessary.
```
