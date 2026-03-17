# Client-side form validation

Invenio Modular Deposit Form allows for client-side (in-browser) validation of form values, to complement InvenioRDM's server-side validation. This means that users will see errors immediately, as they complete the form, rather than only when they submit the form.

## Enabling client-side validation

To enable client-side form validation, set the `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` config variable to `True` in your instance's `invenio.cfg` file.

## Prerequisites

Before client-side validation can work, you will also need to patch your installed invenio-rdm-records package, since that package does not currently pass the `validator` or `validationSchema` props through to Formik. Run the patch script from your instance root as described in the [Installation](installation.md) section.

## Configuring the validator

This package comes with a default validation schema at `assets/semantic-ui/js/invenio_modular_deposit_form/validation/validator.js`. If you wish to change any of the validation behaviour, you can use this as a template and provide your own file, exposing it via the **validator** entry point. See [Adding your own React components](extending.md) for how to register `invenio_modular_deposit_form.validator`.

The `validator.js` file may export one or both of:

- **validationSchema** — A `yup` schema. If provided, it will be passed to the Formik form validation handler via the `validationSchema` property, which will handle validation and update the form's `errors` object as necessary.
- **validate** — A custom validation function that will be passed to the Formik form `validate` property.
