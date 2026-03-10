# Adding your own React components

To add your own React components or provide a custom `validator.js` and/or `componentsRegistry.js`, you point the package at the directory (or directories) that contain those files. You can use **Python entry points** (recommended) or **webpack aliases**.

## Python entry points (recommended)

You can register one or both of these entry point groups; each callable returns the **absolute path** to a directory containing the named file.

| Entry point group | File in directory | Purpose |
|-------------------|-------------------|---------|
| `invenio_modular_deposit_form.validator` | `validator.js` | Client-side validation schema and/or `validate` function |
| `invenio_modular_deposit_form.components_registry` | `componentsRegistry.js` | Extra or overriding React components |

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

The package uses the **first** registered entry point per group. If no entry point is registered for validator (or components map), the package uses built-in stubs (no-op validator, empty components registry).

## Webpack alias (alternative)

If you prefer not to use entry points, add one or both aliases in your instance's `webpack.py` so they point at the directory containing `validator.js` and/or `componentsRegistry.js`:

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

Ensure your theme bundle is loaded (e.g. via `invenio_assets.webpack` entry point).

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
  ]
}
```

The keys are strings matching the names of the React components you want to expose (referenced in your layout configuration). The value for each component is an array: `[0]` the React component itself, `[1]` an array of the field names handled by the component.

## Overriding

Normally, overriding a React component should be done using the Overridable API. This extension also allows a second method: if you include a component definition in your `componentsRegistry.js` that duplicates the key of a built-in component, your definition will supersede the built-in one. This is useful when you want to *change the metadata fields handled by a component*. See [Customizing field components](#customizing-field-components) for when to use each approach.

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

Use Overridable when you only want to **replace the inner widget** for a section that already has a default wrapper. Your component is rendered *inside* the existing wrapper (e.g. inside `FieldComponentWrapper`'s `<Overridable>`), so it receives the **same props the default child would get**. Your override does not need to wrap itself in `FieldComponentWrapper` again.

Register your component in the instance's overridable registry (`assets/js/invenio_app_rdm/overridableRegistry/mapping.js`) under the slot id for that section. See the package's [Override guide](override-guide.md) for the list of slot ids.

| Goal | Method |
|------|--------|
| Replace whole section and control how props are assembled | Component registry (override by section name, wrap in `FieldComponentWrapper` if needed) |
| Add a section for a metadata field with no default component | Component registry (new name + `FieldComponentWrapper` + all props) |
| Replace only the inner widget and use the wrapper's props | Overridable (register in `mapping.js` under the slot id) |

(handling-custom-fields)=
## Handling custom fields

Custom field values are stored under `custom_fields` in the record and must be accessed via the correct field path (e.g. `custom_fields.kcr:my_field`). To implement your own custom field widgets while reusing the standard InvenioRDM custom field configuration, use the **CustomField** component.

### Prerequisites

**Enable custom fields for every component you use.** The form looks up each custom field's widget and props from `RDM_CUSTOM_FIELDS_UI`. You must define the field in `RDM_CUSTOM_FIELDS` and add a section (or add the field to an existing section) in `RDM_CUSTOM_FIELDS_UI` for **every** custom field component in your layout—including the **built-in** ones (journal, imprint, meeting, thesis, codemeta/software). If you use `JournalTitleComponent`, `BookTitleComponent`, `MeetingTitleComponent`, etc., the corresponding sections and fields must be present in your instance's `RDM_CUSTOM_FIELDS_UI`; otherwise the components cannot resolve their widgets.

**Section names must match, or you must override the mapping.** The form resolves which `RDM_CUSTOM_FIELDS_UI` section a component uses via the config variable `INVENIO_MODULAR_DEPOSIT_FORM_CUSTOM_FIELD_SECTION_NAMES`. The package default matches the [InvenioRDM optional metadata fields](https://inveniordm.docs.cern.ch/operate/customize/metadata/optional_fields/) example: journal, imprint, and thesis all use the combined section **"Publishing information"**; meeting uses **"Conference"**; codemeta uses **"Software"**. Either use that same structure and section labels in your `RDM_CUSTOM_FIELDS_UI`, or set `INVENIO_MODULAR_DEPOSIT_FORM_CUSTOM_FIELD_SECTION_NAMES` in your instance to override (e.g. if you use separate sections per contrib).

### Using CustomField

**CustomField** resolves the field's widget and props from the **custom field UI configuration** that is part of the regular InvenioRDM custom fields system. That configuration is defined in your instance's `RDM_CUSTOM_FIELDS_UI` (in `invenio.cfg` or your config module). It is serialized into the deposit form's config as `config.custom_fields.ui`: a list of sections, each with a `section` label and a `fields` array. Each field entry includes `field` (e.g. `thesis:thesis.university`), `ui_widget`, and `props`. **CustomField does not duplicate this config** — it looks it up from the Redux store's deposit config and uses it to load the correct widget and merge props.

1. **Define your custom field and its UI in InvenioRDM config** — Register the field in `RDM_CUSTOM_FIELDS` and add a section (or add the field to an existing section) in `RDM_CUSTOM_FIELDS_UI` with `field`, `ui_widget`, and `props` as usual.

2. **Implement a widget component that uses CustomField** — Render `CustomField` with:
   - `uiConfigSectionName` — the exact `section` string from `custom_fields.ui` (or the label you map in `INVENIO_MODULAR_DEPOSIT_FORM_CUSTOM_FIELD_SECTION_NAMES` for that component key)
   - `fieldName` — the `field` value from that UI entry (e.g. `kcr:my_field` or `thesis:thesis.university`)
   - `idString` — a stable id for the wrapper (e.g. `"MyField"`)
   - Any extra props you want to override or add. These are merged over the config props.

3. **Register the component and add it to the layout** — Add your component to your instance's `componentsRegistry.js` with the field path(s) it handles, then reference it in `INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS` or `INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` like any other field component.

4. **Update the section name mapping** — Set `INVENIO_MODULAR_DEPOSIT_FORM_CUSTOM_FIELD_SECTION_NAMES` in your instance so it includes **all** custom field section names in use: both the **built-in** keys (`journal`, `meeting`, `imprint`, `thesis`, `codemeta`) and any keys for your own components (e.g. `KeywordsComponent`, `SeriesComponent`). When you set this variable you provide the full mapping; the form uses it to look up the correct `RDM_CUSTOM_FIELDS_UI` section for each component. See [Configuration](configuration.md) for the variable name and an example.

**Example — single custom field in the instance registry:**

```javascript
import { CustomField } from "@js/invenio_modular_deposit_form/field_components/CustomField";

const MyFieldComponent = (props) => (
  <CustomField
    uiConfigSectionName="My section"
    fieldName="kcr:my_field"
    idString="MyField"
    {...props}
  />
);

// In componentsRegistry.js:
// MyFieldComponent: [MyFieldComponent, ["custom_fields.kcr:my_field"]]
```

Your instance must define the field and its UI in `RDM_CUSTOM_FIELDS` and `RDM_CUSTOM_FIELDS_UI` as usual, and include your component's section name in `INVENIO_MODULAR_DEPOSIT_FORM_CUSTOM_FIELD_SECTION_NAMES` (along with all built-in keys if you use built-in custom field components).

**CustomField** uses the **useCustomFieldWidget** hook, which reads `custom_fields.ui` from the deposit config, finds the section and field by name, merges props (without mutating config), and loads the widget via the same template loaders used elsewhere. The loaded widget is then wrapped in **FieldComponentWrapper** so it receives resource-type-driven label, icon, and other mods from the layout config.
