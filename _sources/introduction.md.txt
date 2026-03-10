# Introduction

{bdg-warning}`Beta`

**Beta version** — Usage and configuration may change.

Invenio Modular Deposit Form is an InvenioRDM extension that adds modular, configurable layout and client-side validation to the record deposit form.

Copyright (C) 2023-2026 Mesh Research. Licensed under the MIT License. See `LICENSE` file for details.

```{important}
This package is currently under heavy development to improve its portability and to support InvenioRDM versions 13 and 14. **As of 2026-03-06 the package is temporarily broken**, but this will be resolved shortly. Check back soon for updates!
```

## Features

This extension provides a flexible, extensible layout and validation layer for the InvenioRDM deposit form that allows:

- **Flexible customization of deposit form layout via config variables**
  - Stepped **multi-page** form flow
  - Form customization **without touching React**
  - Extensible with custom React components, overrides, and custom fields
- **Form UI changes based on resource type**
  - Field visibility
  - Alternate layouts
  - Widget properties (labels, icons, placeholders, etc.)
- **Integration of custom fields** freely into the main form layout
- **Autosave** of unsubmitted form values to browser storage
- **Client-side form validation** harmonized with InvenioRDM's server-side validation
- **Custom preprocessing** of form data before submission

The goal of this package is to augment and expand on the existing InvenioRDM deposit form, not to replace it. Wherever possible, it relies on the stock components and logic provided by invenio-rdm-records, and aims to provide additional flexibility and functionality that might otherwise require extensive bespoke development.
