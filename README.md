# invenio-modular-deposit-form

** PRE-ALPHA **

A more modular and configurable deposit form framework for InvenioRDM. This extension provides a replacement framework for the InvenioRDM deposit form that allows:

- full customization of the form layout via config variables
- a stepped multi-page form flow
- customization of field visibility and layout based on resource type
- customization of field properties based on resource type, including:
  - labels
  - placeholders
  - icons
  - help text
  - default values
  - select value order
  - required fields
- more granular integration of custom fields into the form layout
- automatic saving of partially filled form values
- client-side error handling (using Formik) to complement InvenioRDM's server-side handling
- custom preprocessing of form data before submission

This extension tries to integrate as cleanly as possible with InvenioRDM's default structures. It

- uses core InvenioRDM React components wherever possible
- plays nicely with InvenioRDM's custom fields API
- continues to allow overriding of React components via the overridable API

## Rationalle

The aim of this extension is to further improve InvenioRDM's deposit form's usability and customizability.
Users are more likely to fill a form out completely if that form is easy to understand and navigate. This means
we will generally get more and better metadata accompanying record deposits if the deposit form is highly
usable. Generally, forms are more usable if there are a limited number of fields visible at once. One way of achieving this is to break a long and complex form into multiple stages. Another way of minimizing field clutter
is to display only the fields that are actually necessary. This extension attempts to do both things by
implementing a multi-step form and by hiding form fields that are not relevant to the resource type the user
has selected.

- making it immediately clear how far through the form submission process a user has come
- providing immediate field validation and feedback to eliminate backtracking
- making labels, help text, etc. clearer and more effective by allowing them to be customized by resource type


## Installation

## Configuration

To enable this deposit form, set the following config variable in your instance's invenio.cfg file:

```
APP_RDM_DEPOSIT_FORM_TEMPLATE = "invenio_modular_deposit_form/deposit.html"
```

Layout and configuration of the form are available via config variables:


INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS  Declares the basic form layout that will be the default for
                                            all resource types. This includes declaring the stepped multi-stage
                                            structure if one is being used.


INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE     Declares the additional fields to be placed in the form
                                                (and on each form step) based on the currently selected
                                                resource type


INVENIO_MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES

INVENIO_MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES

INVENIO_MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS

These config variables are injected into the main form component via data attributes.

## Adding your own React components

If you want to add your own new React components, rather than just overriding the built-in components, you will need to

1. In your instance `site` folder create a new assets subfolder to hold the additional components at a path like `site/my_instance_name/assets/semantic-ui/js/invenio_modular_deposit_form_extras`.
2. Create a file in this folder called `componentsMap.js` which creates and exports an object called `componentsMap`. This object will be the central registry for your custom React components.
3. In your instance's `webpack.py` file (at `site/my_instance_name/webpack.py`) add an alias pointing to this folder holding your custom components:

```python
theme = WebpackThemeBundle(
    __name__,
    "assets",
    default="semantic-ui",
    themes={
        "semantic-ui": dict(
            entry={
                ...
            },
            aliases={
                "@js/invenio_modular_deposit_form_extras": "js/invenio_modular_deposit_form_extras",
            },
        ),
    },
)
```

4. Ensure that your `site/setup.cfg` file has declared a webpack entry point to pick up your custom theme bundle:

```
invenio_assets.webpack =
    knowledge_commons_repository_theme = knowledge_commons_repository.webpack:theme
```

## Form state management

- FormValuesContext (in js/RDMDepositForm): a new React context API context that hoists the Formik field variables up to the whole-form level

## Core components that are not yet exposed (and must be duplicated)
