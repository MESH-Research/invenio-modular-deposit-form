![Python](https://img.shields.io/badge/python-3.9+-276F86?style=flat-square&logo=python&logoColor=white) ![License](https://img.shields.io/badge/license-MIT-D9B01C?style=flat-square&logo=opensourceinitiative&logoColor=white) ![Status](https://img.shields.io/badge/status-beta-orange?style=flat-square)

# Invenio Modular Deposit Form

An InvenioRDM extension that adds modular, configurable layout and client-side validation to the record deposit form.

> [!WARNING] **Beta** — Usage and configuration may change.

Version 0.3.4

Copyright (C) 2023-2026 Mesh Research.
Licensed under the MIT License. See `LICENSE` file for details.

> [!NOTE] This package is currently under heavy development to improve its portability, as well as to support InvenioRDM versions 13 and 14. As of 2026-03-06 the package is temporarily broken, but this will be resolved shortly. Check back soon for updates!

## Features

This extension provides a flexible, extensible layout and validation layer for the InvenioRDM deposit form that allows:

- customization of the form **layout via config variables**
  - uses the semantic-ui grid layout system
  - allows for a stepped **multi-page** form flow
  - construction of form layouts using a simple dictionary configuration
- form UI changes **based on resource type**
  - field visibility
  - alternate layouts
  - widget properties like labels, icons, placeholders, etc.
- integration of **custom fields** freely into the main form layout
- **autosave** of unsubmitted form values to browser storage
- **client-side error handling** harmonized with InvenioRDM's server-side handling
- custom **preprocessing** of form data before submission

The goal of this package has been to augment and expand on the existing InvenioRDM deposit form, not to completely replace it. Wherever possible, we rely on the stock components and logic provided by invenio-rdm-records. There's no point in reinventing the wheel!

The goal is simply to provide additional flexibility and functionality that might otherwise require instance owners to do extensive bespoke development.

## Overview

#### Custom template and wrapper component

The package provides a custom Jinja template that renders a custom version of the top-level `RDMDepositForm` component. This is a thin wrapper that renders the stock `DepositFormApp` as its one child. The modular form layout and configuration are merged into the stock deposit form's config data by the template (using a custom filter) and passed into the stock form's Redux store.

![Custom template and wrapper component](./docs/Modular%20Deposit%20Form%201.jpg)

The stock invenio-rdm-records component retains responsibility for

- Creation and management of **Formik form state** (monitoring input values and "touched" states)
- Communication between the form and the **backend API**
- Creation and management of the **Redux store** that handles static data and configuration

#### Inserting the layout layer

The second role of the custom `RDMDepositForm` is to insert a new custom layout layer in between the `DepositFormApp` and its children, the individual form field components. The wrapper component renders `DepositFormApp` with one child, a new `FormLayoutContainer` component.

![Inserting layout container layer](./docs/Modular%20Deposit%20Form%202.jpg)

This layout layer (along with its children) has access to the Redux store and Formik state, but it does not manage them.

The `FormLayoutContainer` _is_ responsible for

- Creation and management of any dynamic form UI state (via a dedicated Reducer)
  - including the selected resource_type, for selective per-type field display
- Handling client-side autosave of form data
- Managing page navigation through the form (for multi-page layouts)
- Monitoring form error states and displaying them on the page (when necessary)
  - including merging server-side errors with client side validation errors

The registry of available form field components, as well as their visual arrangement
(including pagination) is provided via the Redux store. But it is the `FormLayoutContainer` that actually renders the top-level `FormPage` elements. If the
configured layout includes multiple pages, this layout layer will also render a
stepper component above the form page and a footer with forward and back buttons.

#### Rendering form fields in the layout

Following the configured layout, the `FormPage` elements then render the individual form field components. These can be the stock field components supplied by invenio-rdm-records, or they can be new custom components. Both can be included in
the layout configuration.

![Rendering form fields in the layout](./docs/Modular%20Deposit%20Form%203.jpg)

#### Combining a variety of field component sources

This package maintains a file-based registry of components that are available for use in the configured layout. That registry can also be expanded via an additional registry in your local InvenioRDM instance folder, supplied to invenio-modular-deposit-form through a python entry point.

All of the stock field components are present in the combined registry by default. The stock components can also be overridden via the usual `ReactOverridable` method from your local instance directory. You can use your local instance component registry to add completely new custom form field components. This allows for, e.g., creating compound components that combine multiple form fields in a single widget, or creating multiple components linked to the same underlying metadata field.

It is also possible to include any custom fields in any location in your layout. This package provides individual components for all of the built-in custom fields that invenio-rdm-records provides for journals, theses, etc. If you create your own custom fields, using the standard custom_fields approach, you can also include field components for those custom fields through your instance's component registry.

![Combining a variety of field component sources](<./docs/Modular%20Deposit%20Form%20(Fields).jpg>)

#### How form fields are inserted

The stock InvenioRDM deposit form uses a static layout in which required props and configuration are passed directly from the `DepositFormApp` into each field component.
To insert these field components into a flexible layout layer, we use an outer wrapper component for each field. This retrieves and fetches the props that the field would normally receive from its parent--the record, list options, rich text editor settings, etc.

In addition, the field component is wrapped in an inner `FieldComponentWrapper` higher-order component. This retrieves any configured properties for the form field UI (label, icon, placeholder, etc.), modified as necessary for the currently selected resource_type. This is what allows field widgets to adapt to the resource_type on the fly without page reloads.

![How form fields are inserted](./docs/Modular%20Deposit%20Form%20Widgets.jpg)

In the case of custom fields (built-in or user-created) the field's React component requires props prepared by a dedicated field template. Custom fields also have their UI configuration embedded in form UI sections, displayed in the stock form as tabs at the bottom of the form.

To free up custom field widgets for more flexible placement, we employ a `CustomFieldInjector` component that renders the individual field widget using its template and the default settings from its UI section configuration. The injector component also wraps this rendered field widget in a `FieldComponentWrapper`. This allows the field's UI properties to be modified from the invenio-modular-deposit-form's layout config dictionary, and lets the widget adapt to the selected resource_type.

![How custom fields are inserted](./docs/Modular%20Deposit%20Form%20Custom%20Field.jpg)

## Installation

Until the package is published to PyPI, you can install it from GitHub by running one of the commands below from your InvenioRDM instance directory:

### Using uv

```bash
uv add "invenio-modular-deposit-form @ git+https://github.com/MESH-Research/invenio-modular-deposit-form.git"
```

### Using pipenv

```bash
pipenv install "git+https://github.com/MESH-Research/invenio-modular-deposit-form.git#egg=invenio-modular-deposit-form"
```

After installation, the extension sets `APP_RDM_DEPOSIT_FORM_TEMPLATE` to use this package's deposit template by default.

### Patch invenio-rdm-records for client-side validation (optional)

Passing `validate` and `validationSchema` into the deposit form requires that `DepositFormApp` and `DepositBootstrap` in invenio-rdm-records accept those props. But invenio-rdm-records does not yet support them. For now, if you wish to use client-side validation, you can use the included script to patch the files. The script is at `invenio_modular_deposit_form/scripts/apply_patches.sh` (in the repo or under your venv’s site-packages after install). Run it with:

```bash
bash ./apply_patches.sh [venv_path]
```

If you run from your instance root and your instance venv is at `.venv`, you can use `./apply_patches.sh` with no arguments. Otherwise pass the full path to your instance venv path (e.g. `./apply_patches.sh /path/to/my-instance/.venv`). The script reads patches from the installed package in site-packages and writes them into the installed `invenio_rdm_records` package. It doesn’t matter where the script is located.

```note
Run the patch script again **after any reinstall or upgrade of invenio-rdm-records**; the patch modifies files inside the installed package, so they are overwritten when the package is updated.
```

## Architecture

> [!WARNING] The documentation from this point on is in rough draft form and is currently being edited. Check back shortly for updates.

### How the package delivers the features

The package delivers the features described above through a **config-driven replacement** of the deposit UI, from a custom Jinja2 template down to a React form that reads layout and behavior from the server.

#### Custom form template

The package sets `APP_RDM_DEPOSIT_FORM_TEMPLATE` to point to a custom Jinja template: "invenio_modular_deposit_form/deposit.html". This template then renders the form React components with the layout and validation layer via inclusion of a custom `index.js`. Form values are passed into the React app using data props (as normal), adding new form
config variables.

#### Layout config injected into the form

All of the package's form customization is merged into the value of the `deposits-config` hidden input, from where it is then picked up by the React app in `index.js`. In the template, a macro merges the form layout settings into the stock InvenioRDM `forms_config` dictionary and the result is assigned to the hidden input. From there the merged configuration is passed into the Redux store's `config` property and is accessible to any form components. This provides the single source of truth for layout and field modifications.

The deposit template also merges in the value of two more Jinja filters that provide extra information to the form:

- **`previewable_extensions`** — Returns the list of file extensions that can be previewed (from `invenio_previewer` when available). Used in `data-previewable-extensions`. If the previewer isn’t available, returns an empty list.
- **`current_user_profile_dict`** — Returns the current user’s profile as a dict (`id` plus any fields from `ACCOUNTS_USER_PROFILE_SCHEMA`). It is used, among other things, for identifying the user in the local-storage autosave of unsubmitted form values.

#### Wrapper component provides validation schema

The template's javascript entry point (`index.js`) renders a custom `RDMDepositForm` component. This wraps InvenioRDM’s standard `DepositFormApp` and lets it handle the Formik form context and API calls. The new `RDMDepositForm` passes in an optional client-side `validate` / `validationSchema` from the instance’s `validator.js` (provided via a dedicated entry point or webpack alias).

#### Layout and UI-State layer

So form state, submission, and server-side validation continue to be handled by InvenioRDM’s stock components; between those upper-level components and the individual field components the extension inserts a layer to handle component layout and manage dynamic UI state.

##### Assembles field components

The stock `DepositFormApp` component is rendered with a new single child that provides the layout layer: `FormLayoutContainer`. This component receives the form layout values as props and uses them to dynamically construct the form, arranging the individual form field widget components.

This layout can simply be an arrangement of stock InvenioRDM form components, imported from core Invenio modules. The layout can also include custom field components, which are encapsulated individually, and entirely new custom widgets. These are all compiled into a single `componentsRegistry` from which the layout config can draw.

Since it sits _inside_ the stock form api components, this `FormLayoutContainer` and its children also have access to the Formik form state and the Redux context (including our merged form layout settings).

##### Maintains form UI state

The form created by this package has a dynamic UI display state that is effected by:

- the currently selected resource type
- the currently selected page (if a multi-page layout is used)
- the overall error state (combining client-side validation errors and server-side errors)

The `FormLayoutContainer` component shares the current state with field components via a React context: `FormUIStateContext`.

#### Layout layer selects field components from a registry

4. **Stepped layout and resource-type–specific fields**  
   **FormLayoutContainer** derives the step list from `commonFields` (e.g. page-1, page-2, …). For the current step it resolves which sections to show: it looks up `fieldsByType[currentResourceType]` (with `same_as` resolved to another type’s config) and, per page, either uses that type-specific list of sections or falls back to the common subsections. That resolved list is passed to **FormPage**, which renders each section by looking up the section’s `component` name (e.g. `ResourceTypeComponent`, `DoiComponent`) in a **component registry** (`componentsRegistry`) and rendering the corresponding React component with section props. So “full customization of form layout” and “stepped multi-page form” come from the `COMMON_FIELDS` and `FIELDS_BY_TYPE` config; “customization of field visibility and layout by resource type” comes from that resolution in FormLayoutContainer and FormPage.

5. **Field-level customization (labels, placeholders, help, etc.)**  
   FormLayoutContainer builds a `currentFieldMods` object from the `*_MODIFICATIONS` and `*_FIELD_VALUES` / `EXTRA_REQUIRED_FIELDS` configs keyed by `currentResourceType`, and exposes it (with `fieldComponents` and `vocabularies`) via **FormUIStateContext**. Each field is rendered through **FieldComponentWrapper** (or equivalent), which consumes that context and applies the appropriate label, placeholder, icon, help text, default, required, and priority for the current resource type. So “customization of field properties based on resource type” is implemented by config-driven mods applied in one place in the component tree.

6. **Autosave and recovery**  
   Partially filled form values are written to browser local storage (handled in the form flow). **useLocalStorageRecovery** (and the recovery modal) offer the user the choice to restore that data when returning to the form, giving “automatic saving of partially filled form values to browser storage” and a clear recovery path.

7. **Custom fields and extensions**  
   Custom field slots are integrated by registering components and their field paths in the same **componentsRegistry** and, where needed, using **CustomFieldInjector** / **CustomFieldSectionInjector**. Preprocessing before submission can be implemented in the same Formik/DepositFormApp pipeline or in instance-specific wrappers. Client-side validation is wired by exporting `validate` and/or `validationSchema` from the instance’s `validator.js`, which is passed into DepositFormApp.

In short: the **template** switches the deposit page to this extension and injects config and server data; the **React app** reads that config and builds a stepped, resource-type–aware form by resolving `commonFields` and `fieldsByType` and rendering registered components with context-driven field mods, while leaving form state and API communication to InvenioRDM’s DepositFormApp and Formik.

### Leveraging InvenioRDM customization tools

This extension tries to integrate as cleanly as possible with InvenioRDM's default structures. It

- uses core InvenioRDM React components wherever possible
- plays nicely with InvenioRDM's custom fields API
- continues to allow overriding of React components via the overridable API

### Global form data handling

All components have access to a `record` prop that includes the metadata for the record being currently edited (if a draft already exists).

The extension replaces the template `deposit.html`. That template renders the output from the view functions in `invenio_app_rdm.records_ui.views.deposits`. That template has access to the following
template variables coming from the view function:

- forms_config (dict): produced by the helper function get_form_config in the same file as the view
  function.
- searchbar_config
- record (dict)
- files=dict(default_preview=None, entries=[], links={}),
- preselectedCommunity=community,
- permissions=get_record_permissions(
  [
  "new_version", # when editing existing records only
  "manage_files",
  "delete_draft",
  "manage_record_access",
  ]
  ),

The `forms_config` dictionary includes the following keys:

vocabularies: created by VocabulariesOptions().dump(),
autocomplete_names: from the config variable "APP_RDM_DEPOSIT_FORM_AUTOCOMPLETE_NAMES" (defaults
to "search")
current_locale
default_locale
pids: created in the helper function get_form_pids_config()
quota: from the config variable "APP_RDM_DEPOSIT_FORM_QUOTA"
decimal_size_display: from the config variable "APP_RDM_DISPLAY_DECIMAL_FILE_SIZES"
links: user_dashboard_request=conf["RDM_REQUESTS_ROUTES"]["user-dashboard-request-details"]
user_communities_memberships: created in the helper function get_user_communities_memberships()
custom_fields
publish_modal_extra: from the config variable "APP_RDM_DEPOSIT_FORM_PUBLISH_MODAL_EXTRA"
createUrl(str): "/api/records" (only when creating a new record)
apiUrl(str): f"/api/records/{pid_value}/draft" (only when editing an existing record)

The `pids` variable is a list with a configuration dictionary for each enabled pid scheme.
At present only "doi" is supported. The default values for this configuration are:

            "scheme": "doi"
            "field_label": "Digital Object Identifier"
            "pid_label": "DOI"
            "pid_placeholder": "Copy/paste your existing DOI here..."
            "can_be_managed": can_be_managed
            "can_be_unmanaged": can_be_unmanaged
            "btn_label_discard_pid": _("Discard the reserved DOI.")
            "btn_label_get_pid": _("Get a DOI now!")
            "managed_help_text": _(
                "Reserve a DOI by pressing the button "
                "(so it can be included in files prior to upload). "
                "The DOI is registered when your upload is published.")
            "unmanaged_help_text": _(
                "A DOI allows your upload to be easily and "
                "unambiguously cited. Example: 10.1234/foo.bar")

The function does not allow customization of these values. This extension will read
a variable with the name INVENIO_MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES and, if it has a key "doi",
use any values provided there to override the default value with the same key.

## Configuration

To use this deposit form, the extension sets `APP_RDM_DEPOSIT_FORM_TEMPLATE` to this package's template by default. Override it in your instance's invenio.cfg if you need the default RDM form:

```
# Optional: only if you want to revert to the default RDM deposit form
# APP_RDM_DEPOSIT_FORM_TEMPLATE = "invenio_app_rdm/deposit.html"
```

Layout and configuration of the form are available via config variables:

INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS Declares the basic form layout that will be the default for
all resource types. This includes declaring the stepped multi-stage
structure if one is being used.

INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE Declares the additional fields to be placed in the form
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

### Basic form layout and pagination

INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS

SectionWrapper
An additional special component exposed is SectionWrapper. This can be used to group a
set of components together visually and semantically.

    If a component on its own should be wrapped in a similar section wrapper, you can instead
    set the "wrapped" property of the component declaration to `True`.

    If you wish to change the html that wraps these sections, you can override the SectionWrapper
    component. Just be sure to pass through the `children` property. If you want to change the structure of
    a particular section, you can create a custom React component for that section and set `wrapped` to `False`
    in its configuration.

FormRow
Another special component is FormRow. This wraps the contained components in a semantic-ui-react `Form.Group` component, i.e. in a <div> with the class `fields`.

#### Field widths

Within a FormRow, it is necessary to declare how wide each field in the row should be. You can do this in two ways using the "classnames" property and semantic-ui layout classes for form fields:

1. If you want the row's fields to have equal widths, then give the FormRow component a "classnames" value that includes "equal width".
2. If you want to assign the fields different widths, then give each field component a "classnames" value that includes "X wide", where "X" is the word for a number of grid columns: e.g. "two wide" for a field that will be only two grid columns wide.

### Layout changes by resource type

INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE

For each resource type configured in your InvenioRDM instance, you may override the form fields and layout on a page-by-page basis.

To avoid unnecessary boilerplate configuration, you can re-use the override declaration from another resource type. In the list of components for any page, simply include one object with a single key, `same_as`. The value should be the label of another configured resource type. For example, if I want to re-use the "page-2" configuration from `textDocument-book` in my configuration for `textDocument-monograph`, I would place this entry in my
INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE dictionary:

```python
    "textDocument-monograph": {"page-2": [{"same_as": "textDocument-book"}]}
```

### Other changes to fields by resource type

INVENIO_MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES

INVENIO_MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES

INVENIO_MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS

### Individual field configuration options

Each field configuration will pass its arguments through to the React component. In particular, form field components generally expect these arguments:

description
helpText
icon
label
optimized
required (defaults to `false` unless required in Yup schema or Invenio JSONSchema)
classnames (note all lowecase and plural!!)
A string containing any class names to be passed through to the rendered component. This can be used to pass semantic-ui style classes. E.g., a field with the classes "two wide" will be assigned a width of two grid columns within its form group.
showLabel (defaults to `true`)
fluid (defaults to "true")
onBlur
An extra function can be passed to be triggered by onBlur events on the input. This will run immediately before Formik's built-in onBlur event

**Properties are overridden in the sequence built-in defaults > React field_components definition > invenio.cfg values (from less priority to highest priority)**

### Client-side form validation

If you wish to enable client-side form validation, provide a `validator.js` file in a directory that you expose via the **validator** entry point (or the **extras** entry point). See **Adding your own React components** below for how to register `invenio_modular_deposit_form.validator` or `invenio_modular_deposit_form.extras`.

This validator.js file may export one of two objects:

validationSchema: This should be a `yup` schema. If provided, it will be passed to the Formik form validation handler via the `validationSchema` property, which will handle the validation and update the form's `errors` object as necessary.

validate: This can be a custom validation function which will be passed to the Formik form `validate` property.

If neither of these objects is exported in a file with that name, the client-side validation will simply be deactivated.

For invenio-rdm-records versions that do not accept these props, run the patch script from your instance root as described in the **Installation** section.

**TextField components are aware not just of their own `touched` state, but also the `touched` state of parents**

## Adding your own React components

If you want to add your own new React components, or provide a custom `validator.js` and/or `componentsRegistry.js`, you point the package at the directory (or directories) that contain those files. You can use **Python entry points** (recommended) or **webpack aliases**.

### Python entry points (recommended)

You can register one or both of these entry point groups; each callable returns the **absolute path** to a directory containing the named file.

| Entry point group                                  | File in directory       | Purpose                                                  |
| -------------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| `invenio_modular_deposit_form.validator`           | `validator.js`          | Client-side validation schema and/or `validate` function |
| `invenio_modular_deposit_form.components_registry` | `componentsRegistry.js` | Extra or overriding React components                     |

**One directory with both files:** Register the same path under **both** `.validator` and `.components_registry` (e.g. one callable that returns that path, referenced in both entry points).

**Example: separate entry points**

In your instance package, expose callables that return the directory paths. For example in `site/my_instance_name/deposit_extras.py`:

```python
from pathlib import Path

def get_validator_path():
    return str(Path(__file__).parent / "assets" / "js" / "deposit_validator")

def get_components_registry_path():
    return str(Path(__file__).parent / "assets" / "js" / "deposit_components")
```

Register in `pyproject.toml`:

```toml
[project.entry-points."invenio_modular_deposit_form.validator"]
my_instance = "my_instance.deposit_extras:get_validator_path"

[project.entry-points."invenio_modular_deposit_form.components_registry"]
my_instance = "my_instance.deposit_extras:get_components_registry_path"
```

Or in `setup.cfg`:

```ini
[options.entry_points]
invenio_modular_deposit_form.validator =
    my_instance = my_instance.deposit_extras:get_validator_path
invenio_modular_deposit_form.components_registry =
    my_instance = my_instance.deposit_extras:get_components_registry_path
```

**One directory for both:** register the same path for both groups, e.g. use one callable and reference it twice:

```toml
[project.entry-points."invenio_modular_deposit_form.validator"]
my_instance = "my_instance.deposit_extras:get_extras_path"

[project.entry-points."invenio_modular_deposit_form.components_registry"]
my_instance = "my_instance.deposit_extras:get_extras_path"
```

(Here `get_extras_path()` returns the directory that contains both `validator.js` and `componentsRegistry.js`.)

The package uses the **first** registered entry point per group. If no entry point is registered for validator (or components map), the package uses built-in stubs (no-op validator, empty components registry). You can omit the corresponding alias from your theme’s `webpack.py` when using entry points.

### Webpack alias (alternative)

If you prefer not to use entry points, add one or both aliases in your instance’s `webpack.py` so they point at the directory containing `validator.js` and/or `componentsRegistry.js`:

- `@js/invenio_modular_deposit_form_validator` → directory containing `validator.js`
- `@js/invenio_modular_deposit_form_components` → directory containing `componentsRegistry.js`

Example snippet for `webpack.py`:

```python
themes={
    "semantic-ui": dict(
        entry={ ... },
        aliases={
            "@js/invenio_modular_deposit_form_validator": "js/deposit_validator",
            "@js/invenio_modular_deposit_form_components": "js/deposit_components",
        },
    ),
},
```

Ensure your theme bundle is loaded (e.g. via `invenio_assets.webpack` entry point in `setup.cfg` or `pyproject.toml`).

### The componentsRegistry object

The `componentsRegistry` object must have the following structure:

```python
{
  BookSectionVolumePagesComponent: [
    BookSectionVolumePagesComponent,
    [
      "custom_fields.journal:journal.pages",
      "custom_fields.imprint:imprint.pages",
    ],
  ]
}
```

The keys are strings matching the names of the React components you want to expose. These strings can then be referenced in your layout configuration (in your invenio.cfg). The value for each component is an array consisting of:

[0] The React component itself, and
[1] an array of the field names handled by the component

### Overriding

Normally, if you want to override a React component this should be done using the `overridable` API. This extension does allow for a second method, however. If you include a component definition in your componentsRegistry.js file that duplicates the key of a build-in component, your definition will supersede the built-in one. This offers a conventient way to _change the metadata fields handled by a component_.

### Handling custom fields

Custom field values have to be accessed differently from built-in field values. Components that deal with custom fields can use the `CustomFieldInjector` and `CustomFieldSectionInjector` helper components.

## Built-in components

AbstractComponent,
AccessRightsComponent,
AdditionalDatesComponent,
AdditionalDescriptionComponent,
AdditionalTitlesComponent,
AlternateIdentifiersComponent,
BookTitleComponent,
CommunitiesComponent,
ContributorsComponent,
CreatorsComponent,
DateComponent,
DeleteComponent,
DoiComponent,
FilesUploadComponent,
FundingComponent,
ISBNComponent,
JournalVolumeComponent,
JournalIssueComponent,
JournalISSNComponent,
JournalTitleComponent,
LanguagesComponent,
LicensesComponent,
MeetingDatesComponent,
MeetingPlaceComponent,
MeetingTitleComponent,
MetadataOnlyComponent,
PublisherComponent,
PublicationLocationComponent,
ReferencesComponent,
RelatedWorksComponent,
ResourceTypeComponent,
SectionPagesComponent,
SubjectsComponent,
SubmissionComponent,
SubtitleComponent,
TitleComponent,
TotalPagesComponent,
VersionComponent,

CombinedDatesComponent,

InvenioRDM includes field-level React components that are exposed for import. These cannot be included directly because ???:

### AccessRightField (in "@js/invenio_rdm_records")

### DescriptionsField (in"@js/invenio_rdm_records")

### CreatibutorsField (in"@js/invenio_rdm_records")

### DeleteButton (in"@js/invenio_rdm_records")

### DepositFormApp (in"@js/invenio_rdm_records")

### DepositStatusBox (in"@js/invenio_rdm_records")

### FileUploader (in"@js/invenio_rdm_records")

### FormFeedback (in"@js/invenio_rdm_records")

### IdentifiersField (in"@js/invenio_rdm_records")

### PreviewButton (in"@js/invenio_rdm_records")

### LanguagesField (in"@js/invenio_rdm_records")

### LicenseField (in"@js/invenio_rdm_records")

### PublicationDateField (in"@js/invenio_rdm_records")

### PublishButton (in"@js/invenio_rdm_records")

### PublisherField (in"@js/invenio_rdm_records")

### ReferencesField (in"@js/invenio_rdm_records")

### RelatedWorksField (in"@js/invenio_rdm_records")

### SubjectsField (in"@js/invenio_rdm_records")

### TitlesField (in"@js/invenio_rdm_records")

### VersionField (in"@js/invenio_rdm_records")

### CommunityHeader (in"@js/invenio_rdm_records")

### SaveButton (in"@js/invenio_rdm_records")

### FundingField (in "@js/invenio_vocabularies")

<!-- FIXME: where do below originally live? -->

### ResourceTypeSelectorField (from "./replacement_components/ResourceTypeSelectorField")

### PIDField (from "./replacement_components/PIDField")

### DatesField ( from "./replacement_components/DatesField" )

### Gotchas

- By default the imprint:imprint.pages field is used for _total pages_ in a publication,
  while the journal:journal.pages field is used for _page numbers in a larger work_. So the
  BookSectionPages component uses the journal:journal.pages field. If this is not how these
  fields are interpreted in your InvenioRDM schema, you may override this component.

## Form state management

- FormValuesContext (in js/RDMDepositForm): a new React context API context that hoists the Formik field variables up to the whole-form level

## Core components that are not yet exposed (and must be duplicated)
