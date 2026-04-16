# Client-side form validation

Invenio Modular Deposit Form allows for client-side (in-browser) validation of form values, to complement InvenioRDM's server-side validation. This means that users will see errors immediately, as they complete the form, rather than only when they submit the form.

## Enabling client-side validation

To enable client-side form validation, set the `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` config variable to `True` in your instance's `invenio.cfg` file.

## How the schema reaches Formik

This extension’s `RDMDepositForm` uses bundled replacement deposit bootstrap
components that forward **`validationSchema`** to Formik. No patch to
`invenio-rdm-records` is required for client-side validation to run once
`MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` is enabled and assets are rebuilt.

## Configuring the validator

This package comes with a default validation schema at `assets/semantic-ui/js/invenio_modular_deposit_form/validation/validator.js`. If you wish to change any of the validation behaviour, you can use this as a template and provide your own file, exposing it via the **validator** entry point. See [Adding your own React components](extending.md) for how to register `invenio_modular_deposit_form.validator`.

The module loaded as `validator.js` must export a **single** value (default or
CommonJS export). That value is either:

- **A function** `(config) => yupSchema` — called at form initialisation with the
  deposit config; return a Yup schema (recommended), or
- **A Yup schema object** — used as-is.

`RDMDepositForm` passes the result to Formik as **`validationSchema` only**
(schema-based validation). A separate Formik **`validate`** function is not
used.

## Error visibility vs. Formik `errors`

Yup validation populates Formik **`errors`**, but some replacement field widgets only **surface** those errors in the UI when Formik **`touched`** is set for the path (aligned with `TextField`). The replacement **PIDField** fork sets **`touched`** on unmanaged-input blur and when managed/unmanaged or optional-DOI radios change; see {ref}`formik-touched-pidfield`. If you customize those components, preserve that wiring or inline errors may not appear when expected.
