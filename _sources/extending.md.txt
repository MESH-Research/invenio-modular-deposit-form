# Adding your own components and validator

To add your own React components or provide a custom `validator.js`, `componentsRegistry.js`, and/or `transformations.js`, you point the package at the directory (or directories) that contain those files. You can use **Python entry points** (recommended) or **webpack aliases**.

## Python entry points (recommended)

You can register these entry point groups; each callable returns a **string** that becomes the **right-hand side** of a webpack resolver alias inside this package’s `webpack.py` (for example `@js/invenio_modular_deposit_form_validator` → _your string_). That string is **not** passed through webpack’s alias table a second time: Invenio merges all bundle aliases into `config.json`, and `invenio_assets` builds the final config with `path.resolve(build.context, alias_path)` for every alias value.

| Entry point group                                  | File in directory       | Purpose                                                  |
| -------------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| `invenio_modular_deposit_form.validator`           | `validator.js`          | Client-side validation schema and/or `validate` function |
| `invenio_modular_deposit_form.components_registry` | `componentsRegistry.js` | Extra or overriding React components                     |
| `invenio_modular_deposit_form.transformations`     | `transformations.js`    | Submit-time metadata transforms (array of functions)   |

```{warning}
**Return a path under the collected assets tree, not an `@js/...` request.**

If your callable returns something like `@js/my_instance/validation/validator.js`, the build will resolve `path.resolve(build.context, "@js/my_instance/validation/validator.js")`, which points at a **non-existent** path (a literal `@js` directory under the instance assets folder). The build then fails with errors such as “Cannot find module … for matched aliased key `@js/invenio_modular_deposit_form_validator`”.

Return instead a **context-relative** path, same style as the right-hand side of aliases in your own `WebpackThemeBundle` (for example `@js/my_instance` → `js/my_instance` in `webpack.py`, and the entry point returns `js/my_instance/validation/validator.js`). After `invenio collect`, that file must exist under the instance’s merged `js/` tree next to `node_modules`, so bare imports such as `react` and `yup` resolve correctly.

For **hand-written** imports inside your own React sources, you may still use `@js/my_instance/...` **provided** you defined that alias in your instance theme bundle; that is unrelated to what the Python entry point callables return.
```

### Register a base alias for your js assets

Both of the methods described below depend on your first setting up an alias that points to your local js assets in your instance's `site/webpack.py` file like this:

```python
themes={
    "semantic-ui": dict(
        entry={ ... },
        aliases={
            "@js/my_instance_name": "js/my_instance_name",
        },
    ),
},
```

Ensure your theme bundle is loaded (e.g. via `invenio_assets.webpack` entry point).

### Create a registration function for each entry point

In your instance package, expose callables that return a **single string**: a path **relative to the Invenio webpack `build.context`** (the instance assets build directory after `invenio collect`), almost always starting with `js/…`, in the same way your theme bundle’s own `aliases` map `@js/…` keys to **`js/…` values** (see `@js/kcworks/collections` → `js/collections` in a typical instance).

So if your validator file ends up collected as `js/my_instance_name/validation/validator.js` under that directory, your registration function should return exactly `js/my_instance_name/validation/validator.js`.

Likewise, if your components registry is collected as `js/my_instance_name/deposit_extras/componentsRegistry.js`, return `js/my_instance_name/deposit_extras/componentsRegistry.js`.

For example, you could place the following functions in a new `site/my_instance_name/deposit_extras/alias_registration.py` file:

```python
def get_validator_path():
    return "js/my_instance_name/validation/validator.js"


def get_components_registry_path():
    return "js/my_instance_name/deposit_extras/componentsRegistry.js"


def get_transformations_path():
    return "js/my_instance_name/deposit_extras/transformations.js"
```

The precise name or location of these files and the functions does not matter, as long as the returned path matches where your theme bundle’s assets land under the merged `js/` tree after collect.

### Register the functions on the entry points

If you are using a `pyproject.toml` file to manage your project, add these entry points (adjusting the paths to point to your registration functions):

```toml
[project.entry-points."invenio_modular_deposit_form.validator"]
my_instance = "my_instance_name.deposit_extras.alias_registration:get_validator_path"

[project.entry-points."invenio_modular_deposit_form.components_registry"]
my_instance = "my_instance_name.deposit_extras.alias_registration:get_components_registry_path"

[project.entry-points."invenio_modular_deposit_form.transformations"]
my_instance = "my_instance_name.deposit_extras.alias_registration:get_transformations_path"
```

Or in `setup.cfg`:

```ini
[options.entry_points]
invenio_modular_deposit_form.validator =
    my_instance = my_instance_name.deposit_extras.alias_registration:get_validator_path
invenio_modular_deposit_form.components_registry =
    my_instance = my_instance_name.deposit_extras.alias_registration:get_components_registry_path
invenio_modular_deposit_form.transformations =
    my_instance = my_instance_name.deposit_extras.alias_registration:get_transformations_path
```

## Webpack alias (alternative)

If you prefer not to use entry points, you can override the aliases in your instance's `webpack.py` so they point **directly to the files** (again using **`js/...` paths** relative to the merged build context, not `@js/...` strings):

- `@js/invenio_modular_deposit_form_validator` → path to `validator.js`
- `@js/invenio_modular_deposit_form_components` → path to `componentsRegistry.js`
- `@js/invenio_modular_deposit_form_transformations` → path to `transformations.js`

Example snippet for `webpack.py`:

```python
themes = {
    "semantic-ui": dict(
        entry={ ... },
        aliases={
            # Point directly to your validator.js file
            "@js/invenio_modular_deposit_form_validator": "js/deposit_validator/validator.js",
            # Point directly to your componentsRegistry.js file
            "@js/invenio_modular_deposit_form_components": "js/deposit_components/componentsRegistry.js",
            # Point directly to your transformations.js file
            "@js/invenio_modular_deposit_form_transformations": "js/deposit_components/transformations.js",
        },
    ),
}
```

These aliases completely override the defaults computed by
`invenio_modular_deposit_form.webpack_extras.get_validator_path()`,
`get_components_registry_path()`, and `get_transformations_path()`. Only define them if you want to bypass
the entry-point based resolution.

## The componentsRegistry object

The `componentsRegistry` object must have the following structure:

```javascript
{
  BookSectionVolumePagesComponent: [
    BookSectionVolumePagesComponent,
    [
      "custom_fields.journal:journal.pages",
      "custom_fields.imprint:imprint.pages",
    ],
  ];
}
```

The keys are strings matching the names of the React components you want to expose (referenced in your layout configuration). The value for each component is an array: `[0]` the React component itself, `[1]` an array of the field names handled by the component.

## Overriding

Normally, overriding a React component should be done using the Overridable API. This extension also allows a second method: if you include a component definition in your `componentsRegistry.js` that duplicates the key of a built-in component, your definition will supersede the built-in one. This is useful when you want to _change the metadata fields handled by a component_. See [Customizing field components](#customizing-field-components) for when to use each approach.

(customizing-field-components)=

## Customizing field components

There are two ways to customize how a form section or field is rendered: via the **component registry** or via **Overridable**.

### 1. Component registry

Use the component registry when:

- You want to **override the whole wrapper** for a section and re-implement how all of the widget's props are assembled (e.g. different data sources, different field paths, or a different structure).
- You want to **add a component for a metadata field that has no default field component** in the layout. In that case you must supply all props for the field yourself and wrap your custom widget in `FieldComponentWrapper` so it gets layout config, resource-type mods, and the correct Overridable slot.

Your component is what the layout renders for that section name. It is responsible for gathering any record/store/config data and passing it into the widget. If the section corresponds to an existing slot (e.g. dates, languages), you use `FieldComponentWrapper` with your default inner widget as its child; the wrapper renders the Overridable, so an instance can still override that slot.

**Example — replace the whole wrapper and change how options are built:** Register a custom component under the same key as a built-in one. Your wrapper assembles props (e.g. options) and passes the default inner widget as the child of `FieldComponentWrapper`.

**Example — new metadata field with no default component:** Add a new section name and a component that wraps your widget in `FieldComponentWrapper`. You must pass all props the widget needs (fieldPath, label, options, etc.).

### 2. Overridable

Use Overridable when you only want to **replace the inner widget** for a section that already has a default wrapper. Your component is rendered _inside_ the existing wrapper (e.g. inside `FieldComponentWrapper`'s `<Overridable>`), so it receives the **same props the default child would get**. Your override does not need to wrap itself in `FieldComponentWrapper` again.

Register your component in the instance's overridable registry (`assets/js/invenio_app_rdm/overridableRegistry/mapping.js`) under the slot id for that section. See the package's [Override guide](override-guide.md) for the list of slot ids.

| Goal                                                         | Method                                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Replace whole section and control how props are assembled    | Component registry (override by section name, wrap in `FieldComponentWrapper` if needed) |
| Add a section for a metadata field with no default component | Component registry (new name + `FieldComponentWrapper` + all props)                      |
| Replace only the inner widget and use the wrapper's props    | Overridable (register in `mapping.js` under the slot id)                                 |

(handling-custom-fields)=

## Handling custom fields

Custom field values are stored under `custom_fields` in the record and must be accessed via the correct field path (e.g. `custom_fields.kcr:my_field`). To implement your own custom field widgets while reusing the standard InvenioRDM custom field configuration, use the **CustomField** component.

### Prerequisites

**Enable custom fields for every component you use.** The form looks up each custom field's widget and props from `RDM_CUSTOM_FIELDS_UI`. You must define the field in `RDM_CUSTOM_FIELDS` and add a section (or add the field to an existing section) in `RDM_CUSTOM_FIELDS_UI` for **every** custom field component in your layout—including the **built-in** ones (journal, imprint, meeting, thesis, codemeta/software). If you use `JournalTitleComponent`, `BookTitleComponent`, `MeetingTitleComponent`, etc., the corresponding sections and fields must be present in your instance's `RDM_CUSTOM_FIELDS_UI`; otherwise the components cannot resolve their widgets.

**Enable custom fields for every component you use.** The form looks up each custom field's widget and props from `RDM_CUSTOM_FIELDS_UI`. You must define the field in `RDM_CUSTOM_FIELDS` and add a section (or add the field to an existing section) in `RDM_CUSTOM_FIELDS_UI` for **every** custom field component in your layout—including the **built-in** ones (journal, imprint, meeting, thesis, codemeta/software). If you use `JournalTitleComponent`, `BookTitleComponent`, `MeetingTitleComponent`, etc., the corresponding sections and fields must be present in your instance's `RDM_CUSTOM_FIELDS_UI`; otherwise the components cannot resolve their widgets. The form finds the field config by **field name** only (e.g. `thesis:thesis.university`), so section structure does not affect lookup.

For the **single-field custom components** that this package provides for the built-in contrib fields (journal, imprint, meeting, codemeta), you can either write your own `RDM_CUSTOM_FIELDS_UI` entries or **reuse ready-made helpers shipped with this extension**:

```python
from invenio_modular_deposit_form.custom_fields.ui.journal_fields import (
    JOURNAL_CUSTOM_FIELDS_UI,
)
from invenio_modular_deposit_form.custom_fields.ui.imprint_fields import (
    IMPRINT_CUSTOM_FIELDS_UI,
)
from invenio_modular_deposit_form.custom_fields.ui.meeting_fields import (
    MEETING_CUSTOM_FIELDS_UI,
)
from invenio_modular_deposit_form.custom_fields.ui.codemeta_fields import (
    CODEMETA_CUSTOM_FIELDS_UI,
)

RDM_CUSTOM_FIELDS_UI = [
    # ... any other sections ...,
    JOURNAL_CUSTOM_FIELDS_UI,
    IMPRINT_CUSTOM_FIELDS_UI,
    MEETING_CUSTOM_FIELDS_UI,
    CODEMETA_CUSTOM_FIELDS_UI,
]
```

Each of these helpers defines **separate entries for each subfield** (for example `journal:journal.title`, `journal:journal.volume`, etc.), matching the field names used by the corresponding single-field components (`JournalTitleComponent`, `JournalVolumeComponent`, `BookTitleComponent`, `MeetingTitleComponent`, `CodeRepositoryComponent`, and so on). Including them in your `RDM_CUSTOM_FIELDS_UI` is what allows those components to resolve their widgets automatically via `CustomField`.

### Using CustomField

**CustomField** resolves the field's widget and props from the **custom field UI configuration** that is part of the regular InvenioRDM custom fields system. That configuration is defined in your instance's `RDM_CUSTOM_FIELDS_UI` (in `invenio.cfg` or your config module). It is serialized into the deposit form's config as `config.custom_fields.ui`: a list of sections, each with a `section` label and a `fields` array. Each field entry includes `field` (e.g. `thesis:thesis.university`), `ui_widget`, and `props`. **CustomField** looks up the config by **field name** (searching across all sections), loads the widget, and merges props.

1. **Define your custom field and its UI in InvenioRDM config** — Register the field in `RDM_CUSTOM_FIELDS` and add a section (or add the field to an existing section) in `RDM_CUSTOM_FIELDS_UI` with `field`, `ui_widget`, and `props` as usual.

2. **Implement a widget component that uses CustomField** — Render `CustomField` with:
   - `fieldName` — the `field` value from your UI entry (e.g. `kcr:my_field` or `thesis:thesis.university`)
   - `idString` — a stable id for the wrapper (e.g. `"MyField"`)
   - Any extra props you want to override or add. These are merged over the config props.

3. **Register the component and add it to the layout** — Add your component to your instance's `componentsRegistry.js` with the field path(s) it handles, then reference it in `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` or `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` like any other field component.

**Example — single custom field in the instance registry:**

```javascript
import { CustomField } from "@js/invenio_modular_deposit_form/field_components/CustomField";

const MyFieldComponent = (props) => (
  <CustomField fieldName="kcr:my_field" idString="MyField" {...props} />
);

// In componentsRegistry.js:
// MyFieldComponent: [MyFieldComponent, ["custom_fields.kcr:my_field"]]
```

Your instance must define the field and its UI in `RDM_CUSTOM_FIELDS` and `RDM_CUSTOM_FIELDS_UI` as usual.

**CustomField** uses the **useCustomFieldWidget** hook, which reads `custom_fields.ui` from the deposit config, finds the field by name (across all sections), merges props (without mutating config), and loads the widget via the same template loaders used elsewhere. The loaded widget is then wrapped in **FieldComponentWrapper** so it receives resource-type-driven label, **labelIcon** (and legacy `icon` folded into it), and other mods from the layout config.
