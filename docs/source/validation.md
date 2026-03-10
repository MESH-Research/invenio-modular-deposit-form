# Client-side form validation

To enable client-side form validation, provide a `validator.js` file in a directory that you expose via the **validator** entry point (or the **extras** entry point). See [Adding your own React components](extending.md) for how to register `invenio_modular_deposit_form.validator` or `invenio_modular_deposit_form.extras`.

The `validator.js` file may export one or both of:

- **validationSchema** — A `yup` schema. If provided, it will be passed to the Formik form validation handler via the `validationSchema` property, which will handle validation and update the form's `errors` object as necessary.
- **validate** — A custom validation function that will be passed to the Formik form `validate` property.

If neither of these is exported from a file with that name, client-side validation will be deactivated.

For invenio-rdm-records versions that do not accept these props, run the patch script from your instance root as described in the [Installation](installation.md) section.

TextField components are aware not just of their own `touched` state, but also the `touched` state of parents.
