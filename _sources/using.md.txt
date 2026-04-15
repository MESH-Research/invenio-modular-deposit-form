# Using Invenio Modular Deposit Form

To use this package in your InvenioRDMRecords instance, [install
it](installation.md), rebuild front-end assets (`invenio-cli assets build`), and
restart the instance. If you rely on the built-in `invenio-rdm-records` contrib
custom fields in the layout but have not initialized them yet, run `invenio
rdm-records custom-fields init`.

## Where bundled defaults come from

The layout defaults your instance gets **out of the box** are
whatever `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` and
`MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` are set to in the package’s
`invenio_modular_deposit_form/config/config.py`. By default that file imports a
preset layout from another file in the same `config/` folder (e.g.,
`alternate_paged.py` or `default.py`).

To change behaviour for your instance, override those variables (and any other
`MODULAR_DEPOSIT_FORM_*` settings) in your own `invenio.cfg`. For details about
the layout configuration format and other settings, see
[Configuration](configuration.md).

## What you will see first

After install, the deposit template from this extension is used automatically
(`APP_RDM_DEPOSIT_FORM_TEMPLATE`). The bundled preset is a **multi-page** flow:
a main column for the active page’s fields, **navigation** (for example a
sidebar page menu and/or a header stepper, depending on viewport—see your active
preset), a sidebar region preconfigured with submission and access controls, and
a **footer bar** with previous/next navigation and room for an autosave status
line.

Pages and sections in the `default` preset follow the same information
architecture as stock InvenioRDM, with one stock form section per page. If
contrib custom fields are enabled, extra pages or sections for those fields
usually appear when the user picks a matching **resource type**.

Changing the resource type can **immediately** adjust labels, icons,
placeholders, and other field properties according to your instance’s
modification settings, and can swap in different **pages** when you use per-type
layout overrides. Some of these per-type adaptations are part of the package
default, so you can try changing the selected resource type and watch things
like the menu items and metadata.title field label. See
[Configuration](configuration.md) for more about
`MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` and the `*_MODIFICATIONS` / keys.

## Client-side validation (optional)

By default, this package activates an in-browser form validation that flags
problems in form values as the user goes along, without first having to submit
the form. Client-side validation can be turned on or off with
`MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` flag in `invenio.cfg` Set this
`False` if you only want errors to be flagged after form submission. (You will
need to rebuild assets after changing the flag).

Whith client-side validation on, any problems in a given form field will be
signalled after clicking or tabbing away from the field (on blur). The standard
InvenioRDM error messages are immediately displayed above or below the affected
form inputs. Also, navigation elements (stepper, sidebar menu) and visible
section headings will display badges with error counts. An error message, with
jump links to affected pages/sections, will appear where the layout includes
`FormFeedbackComponent` (by default above the submission buttons).

The bundled validation schema mirrors server-side rules as closely as practical.
This includes validation for the same identifier types handled by stock
InvenioRDM. The validation schema also respects your instance's configuration
for things like allowed identifier types. You can replace or extend the
validation schema via the `invenio_modular_deposit_form.validator` entry
point. See [Validation](validation.md) and [Extending](extending.md).

Since field errors are not flagged until a user touches (and leaves) each field
input, it is possible to leave a form page (using the form menu or stepper)
before all of the errors have been flagged. (E.g., if some required fields have
not been touched.) By default, the form will allow the user to move on, but will
immediately validate all of the fields on the page that was left. If any errors
were left behind, they will be flagged in the form menu and submission feedback
message. Setting the **`MODULAR_DEPOSIT_FORM_USE_CONFIRM_MODAL`** flag to `True`
in `invenio.cfg` will enable a confirmation modal that appears before the user
leaves a page with errors. Details and related behaviour are described with the
rest of the layout and UI flags in [Configuration](configuration.md).

## Autosave (browser local storage)

Values are written to the browser’s local storage as the user edits. By default
a short status note appears in the footer navigation when local backup exists.
This backup is cleared whenever a draft is saved or published. When refreshing
the page or returning to the form, a modal dialog will offer to restore\*locally
stored values.

No `invenio.cfg` keys are required for this behaviour.

## Customizing the form layout

### Alternate bundled presets

Alternate full preset layouts live under `invenio_modular_deposit_form/config/` beside
`config.py`. To adopt one, assign `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` and the
matching `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` in `invenio.cfg` to the symbols
exported from the preset module you want. See [Configuration](configuration.md).

### Creating custom layouts

You can also create your own custom layouts and assign them to the same
variables, `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` and
`MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`. Layouts are Python dictionaries
structured like a tree of nodes, with each node naming a `component` from the
invenio_modular_deposit_form `componentsRegistry`. Nodes can also include nested
`subsections` as well as other settings to be passed into the components. Start
from a bundled preset, then add/remove/reorder nodes. Component names and
variants are listed in [Built-in field components](field_components.md). See
[Configuration](configuration.md) for regions, responsive columns, and `FormRow`
/ collapsible sections.

### Resource-type-specific pages and field tweaks

- **Different pages or sections per type:** `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`
  (and optional `same_as` inheritance between types).
- **Labels, icons, placeholders, help text, defaults, extra required fields:**
  the `MODULAR_DEPOSIT_FORM_*_MODIFICATIONS` and related maps in `invenio.cfg`.

See [Configuration](configuration.md).

### New React components vs stock overrides

- **Registry:** add or override `component` names by merging a local
  `componentsRegistry.js` resolved through the
  `invenio_modular_deposit_form.components_registry` entry point. See
  [Extending](extending.md).
- **Stock slots:** keep using InvenioRDM `ReactOverridable` ids from your
  instance’s `mapping.js` where appropriate. See [Override guide](override-guide.md).

### Custom fields in the layout

Register fields in `RDM_CUSTOM_FIELDS` / `RDM_CUSTOM_FIELDS_UI`, then reference
`CustomField` or the bundled contrib section components by name in your layout
dicts. See [Extending](extending.md).

## Customizing the validation schema

If you have enabled client-side validation by settings
`MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` to `True`, you can then optionally
register your own validation schema. Replace or wrap the default
`buildValidationSchema` function to produce a dynamic validation schema based on
your instance's config settings. Register the file path to your validator via
the `invenio_.invenio_modular_deposit_form.validator` entry point. See
[Validation](validation.md) and [Extending](extending.md) for more details.

## Metadata transformations on submit

This extension provides a built-in mechanism for transforming and modifying the
form metadata immediately before it is submitted. But it does not provide any
default transformations. You can supply an ordered list of pure `(values) =>
nextValues` functions via the `invenio_modular_deposit_form.transformations`
entry point if you need to normalize or reshape the payload before the data is
sent to the server. See [Extending](extending.md) and the overview section on
transformations in [Overview](overview.md).
