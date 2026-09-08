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
(`APP_RDM_DEPOSIT_FORM_TEMPLATE`). The bundled preset is a **multi-page** flow
with:

- a **main column** for the fields on the active page
- **page navigation** that adapts to viewport width — a header stepper on
  smaller screens, a sidebar page menu on larger ones (exact combination depends
  on the active preset)
- a **sidebar region** with submission and access controls (on large screens;
  on small screens those controls usually live on their own page — see
  [Viewport-aware page navigation](configuration.md#viewport-aware-page-navigation))
- a **footer bar** with previous/next buttons and an autosave status line

Pages and sections in the `default` preset follow the same information
architecture as stock InvenioRDM, with one stock form section per page. If
contrib custom fields are enabled, extra pages or sections for those fields
usually appear when the user picks a matching **resource type**.

Changing the resource type can immediately:

- retarget labels, icons, placeholders, and help text via your instance’s
  `*_MODIFICATIONS` maps
- swap which pages and sections are present, when you use per-type layout
  overrides in `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`

Some of those adaptations ship in the package defaults, so selecting a different
resource type in a fresh install is enough to see menu items and field labels
change. See [Configuration](configuration.md) for
`MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` and the `*_MODIFICATIONS` keys.

## Client-side validation

Client-side validation is **on by default**. It flags problems in form values
as the user goes along, without waiting for a submit. Turn it off with
`MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION = False` in `invenio.cfg` if you
only want errors after form submission. Rebuild assets after changing the flag.

With validation on, problems in a field are signalled after the user clicks or
tabs away from it (on blur). The standard InvenioRDM error messages appear
above or below the affected inputs. Navigation elements (stepper, sidebar menu)
and visible section headings show badges with error counts. An error summary
with jump links to affected pages and sections appears wherever the layout
includes `FormFeedbackComponent` (by default above the submission buttons).

The bundled validation schema mirrors server-side rules as closely as practical,
including the same identifier types stock InvenioRDM handles, and it respects
your instance’s configuration (for example allowed identifier types).

Because errors are not flagged until a field is touched and left, a user can
leave a page (via the menu or stepper) before every error on that page has been
shown — for example if required fields were never focused. By default the form
lets them move on, then immediately validates every field on the page they
left. Any errors left behind are flagged in the menu and the submission feedback
message. Setting **`MODULAR_DEPOSIT_FORM_USE_CONFIRM_MODAL`** to `True` in
`invenio.cfg` instead shows a confirmation modal before leaving a page that still
has errors. Details and related behaviour are in
[Configuration](configuration.md).

### Customizing the validation schema

To replace or wrap the default `buildValidationSchema` function so the schema
reflects your instance’s config, register the path to your validator via the
`invenio_modular_deposit_form.validator` entry point. See
[Validation](validation.md) and [Extending](extending.md).

## Autosave (browser local storage)

Values are written to the browser’s local storage as the user edits. By default
a short status note appears in the footer navigation when a local backup exists.
That backup is cleared whenever a draft is saved or published. When refreshing
the page or returning to the form, a modal offers to restore the locally stored
values.

No `invenio.cfg` keys are required for this behaviour.

## Customizing the form layout

### Alternate bundled presets

Alternate full preset layouts live under `invenio_modular_deposit_form/config/`
beside `config.py`. To adopt one, assign `MODULAR_DEPOSIT_FORM_COMMON_FIELDS`
and the matching `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` in `invenio.cfg` to the
symbols exported from the preset module you want. See
[Configuration](configuration.md).

### Creating custom layouts

You can also create your own layouts and assign them to the same variables,
`MODULAR_DEPOSIT_FORM_COMMON_FIELDS` and `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`.
Layouts are Python dictionaries structured as a tree of nodes. Each node names a
`component` from the package’s `componentsRegistry`, and may include nested
`subsections` plus other settings passed into the component. Start from a
bundled preset, then add, remove, or reorder nodes. Component names and variants
are listed in [Built-in field components](field_components.md). See
[Configuration](configuration.md) for regions, responsive columns, and `FormRow`
/ collapsible sections.

### Resource-type-specific pages and field tweaks

The common layout (`MODULAR_DEPOSIT_FORM_COMMON_FIELDS`) is the same for every
deposit. Two other settings let you vary what the depositor sees once they pick
a **resource type**:

**Different pages or sections.**
`MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` is a map from resource type id to
per-page overrides. Use it when a type needs an extra section (for example a
journal article’s periodical details), or when a page that exists in the common
layout should be empty for that type. Empty pages drop out of the form; the
stepper, sidebar menu, and previous/next buttons skip them automatically. Types
that share a layout can point at each other with `same_as` instead of
duplicating the whole block.

**Different labels, icons, and similar copy.**
The `MODULAR_DEPOSIT_FORM_*_MODIFICATIONS` maps (labels, icons, placeholders,
descriptions, help text) and the related default-value / extra-required-field
maps let you retarget field chrome per resource type without rewriting the
layout tree — for example renaming “Title” to “Book title” for
`textDocument-book`.

Both are configured in `invenio.cfg`. Worked examples and the full key list are
in [Configuration](configuration.md).

### Pages that appear and disappear with the window width

A page can also be taken out of the flow at wide viewports only, using the
`menuItemClasses` key. This is how the bundled layouts put the submit and
visibility controls in a sidebar on large screens but on their own step on
small ones. The stepper, sidebar menu, footer previous/next buttons, and the
`?page=` URL all re-resolve as the window is resized. See
[Viewport-aware page navigation](configuration.md#viewport-aware-page-navigation).

### New React components vs stock overrides

There are two separate ways to change what React renders on the deposit form.
Pick based on *what* you are replacing:

**Add or replace a layout `component` name.**
Layout dicts refer to components by string name (`"TitlesComponent"`,
`"FormSection"`, and so on). Those names resolve through the package’s
`componentsRegistry`. To introduce a new name, or to swap the React class behind
an existing one for every place the layout uses it, ship a local
`componentsRegistry.js` and register it with the
`invenio_modular_deposit_form.components_registry` entry point. See
[Extending](extending.md).

**Override a stock InvenioRDM slot.**
Some pieces of the form still come from upstream InvenioRDM and are reached
through its `ReactOverridable` ids, not through this package’s registry. Those
are overridden the usual InvenioRDM way — in your instance’s `mapping.js`. The
ids this package exposes are listed in the [Override guide](override-guide.md).

If you are unsure which path applies: if the thing you want to change appears as
a `component` key in a layout dict, use the registry; if it is a stock Invenio
widget or chrome piece that never shows up in the layout tree, use `mapping.js`.

### Custom fields in the layout

Register fields in `RDM_CUSTOM_FIELDS` / `RDM_CUSTOM_FIELDS_UI`, then reference
`CustomField` or the bundled contrib section components by name in your layout
dicts. See [Extending](extending.md).

## Metadata transformations on submit

Just before the form is submitted, this extension can run a short chain of
JavaScript functions over the form values — for example to normalize identifiers
or reshape fields before they reach the server. No transformations ship by
default. To add your own, register an ordered list of functions via the
`invenio_modular_deposit_form.transformations` entry point. See
[Extending](extending.md) and the overview section on transformations in
[Overview](overview.md).
