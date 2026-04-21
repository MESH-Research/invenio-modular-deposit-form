# Adding your own components and validator

The package exposes three extension points:

- **`validator.js`** — your client-side Yup validation schema.
- **`componentsRegistry.js`** — extra or replacement React components you
  reference by name from `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` /
  `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`.
- **`transformations.js`** — pure functions that rewrite Formik values
  immediately before submit.

Each is **independently optional**: if you don't register one, the package falls back to a no-op stub. See [Registering your extension files](#registering-your-extension-files) for the steps.

(module-contracts)=

## What goes in each extension file

Each file is expected to export a specific kind of customization object:

| File                    | Required export                                                          | Notes                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validator.js`          | A Yup schema, **or** a function `(config) => yupSchema`                  | Resolved as `module.default ?? module`, so both `export default` and `module.exports = …` work. **Only loaded when `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` is truthy** in `invenio.cfg`; otherwise the package ignores the entry point and Formik runs no client schema. A separate Formik `validate` function is **not** consulted — schema only. |
| `componentsRegistry.js` | A named export `componentsRegistry: { [name]: [Component, fieldPaths] }` | Merged onto the built-in registry via `Object.assign` after the package loads, so your keys override built-ins with the same name and new keys are added alongside. Either ESM (`export { componentsRegistry }`) or CommonJS (`module.exports = { componentsRegistry }`) works.                                                                         |
| `transformations.js`    | A named export `transformations: Function[]` (an array of functions)     | Each function is `(values) => newValues` and **must be pure** — return a new object; do not mutate `values`. They run in array order at submit time inside the package's `useFormSubmissionTransformer` hook. Asynchronous transforms are not supported; return synchronously.                                                                          |

See [Validation](validation.md) for more on how the schema reaches Formik, and
[Replacement field components](replacement_field_components.md) for the
touched-aware widgets you should usually compose with when writing
replacements.

## Registering your extension files

The package finds your `validator.js`, `componentsRegistry.js`, and `transformations.js` through Python entry points. Setting that up takes three small steps, done once per instance. You only need to register the files you actually provide — omit any of the three and the package falls back to a no-op default for that one.

### 1. Make sure your assets folder has a webpack alias

In your instance's `site/<my_instance>/webpack.py`, add an alias for the directory holding your JS assets (skip this if you already have one for your instance code):

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

Ensure your theme bundle is loaded — usually via the `invenio_assets.webpack` entry point.

### 2. Place your extension files under that folder

Put each file you want to register somewhere under your assets directory, e.g.:

```text
site/my_instance_name/assets/semantic-ui/js/my_instance_name/deposit_extras/
├── validator.js
├── componentsRegistry.js
└── transformations.js
```

### 3. Tell the package where they are

The package reads three Python entry points. Each one points to a Python function that returns **the path to the corresponding file**, in the form `js/<your-alias-name>/path/to/file.js` — the same path you'd write after `@js/` in a JavaScript import, but with `js/` instead of `@js/`.

Add a small Python module — e.g. `site/my_instance_name/deposit_extras.py`:

```python
def get_validator_path():
    return "js/my_instance_name/deposit_extras/validator.js"


def get_components_registry_path():
    return "js/my_instance_name/deposit_extras/componentsRegistry.js"


def get_transformations_path():
    return "js/my_instance_name/deposit_extras/transformations.js"
```

Then register those functions on the entry points. In `pyproject.toml`:

```toml
[project.entry-points."invenio_modular_deposit_form.validator"]
my_instance = "my_instance_name.deposit_extras:get_validator_path"

[project.entry-points."invenio_modular_deposit_form.components_registry"]
my_instance = "my_instance_name.deposit_extras:get_components_registry_path"

[project.entry-points."invenio_modular_deposit_form.transformations"]
my_instance = "my_instance_name.deposit_extras:get_transformations_path"
```

Or the equivalent in `setup.cfg`:

```ini
[options.entry_points]
invenio_modular_deposit_form.validator =
    my_instance = my_instance_name.deposit_extras:get_validator_path
invenio_modular_deposit_form.components_registry =
    my_instance = my_instance_name.deposit_extras:get_components_registry_path
invenio_modular_deposit_form.transformations =
    my_instance = my_instance_name.deposit_extras:get_transformations_path
```

After changing entry points, reinstall your instance package (`uv pip install -e .` or equivalent) and rebuild assets (`invenio webpack build`) so the new files are picked up.

```{warning}
Return a path that **starts with `js/`**, not `@js/`. The returned string is resolved against the merged build directory, so `@js/my_instance/...` would look for a literal `@js` folder and fail at build time. If your build complains with "Cannot find module … for matched aliased key `@js/invenio_modular_deposit_form_validator`", a stray `@js/` prefix in one of these functions is almost always the cause.
```

For reference, the three entry point groups are:

| Entry point group | File | Purpose |
| --- | --- | --- |
| `invenio_modular_deposit_form.validator` | `validator.js` | Client-side Yup schema or schema-builder function. |
| `invenio_modular_deposit_form.components_registry` | `componentsRegistry.js` | Extra or overriding React components. |
| `invenio_modular_deposit_form.transformations` | `transformations.js` | Pure functions that rewrite Formik values immediately before submit. |

See [What goes in each extension file](#module-contracts) for the exact export each file must provide.

## The componentsRegistry object

`componentsRegistry.js` exports a named `componentsRegistry` whose keys are the strings you reference in your layout config and whose values are `[Component, fieldPaths]` tuples:

```javascript
import { FieldComponentWrapper } from "@js/invenio_modular_deposit_form/field_components/FieldComponentWrapper";
import { MyTitlesWrapper } from "./components/MyTitlesWrapper";
import { BookSectionVolumePagesComponent } from "./components/BookSectionVolumePagesComponent";

export const componentsRegistry = {
  // Replace the built-in titles section with your own wrapper.
  TitlesComponent: [
    MyTitlesWrapper,
    ["metadata.title", "metadata.additional_titles"],
  ],

  // Add a brand-new section for a compound custom field.
  BookSectionVolumePagesComponent: [
    BookSectionVolumePagesComponent,
    [
      "custom_fields.journal:journal.pages",
      "custom_fields.imprint:imprint.pages",
    ],
  ],
};
```

- `[0]` is the React component the layout will mount whenever it sees that name in `"component": "..."`.
- `[1]` is the list of dot-separated metadata field paths the component is responsible for. The form uses this list to map server- and client-side validation errors back to the correct section and to compose the per-section summary in `FormFeedback`. If your component owns no metadata fields (for example, layout, navigation, or informational widgets), pass `[]`.

Because your registry is merged onto the built-in registry with `Object.assign`, a key that matches a built-in name (e.g. `TitlesComponent`) **replaces** the built-in entry, while a new key is **added** alongside the built-ins. Replacing a built-in via the registry is the right tool when you need to change which metadata fields a section owns or how its props are assembled; for purely visual replacements of a section's inner widget, prefer the Overridable API (see [Customizing field components](#customizing-field-components)).

## Using your component in the layout

Once a key is in the merged registry, you reference it by that string from `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` (or any per-resource-type override in `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`):

```python
{
    "section": "discipline",
    "label": "Discipline",
    "component": "MyDisciplineComponent",
}
```

There is no separate "register-this-component-with-the-layout" step — the registry key _is_ the layout name.

(customizing-field-components)=

## Customizing field components

There are two ways to change how an existing form section is rendered:

| You want to…                                                                                                                                    | Use                    | How                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replace the **whole section wrapper** and control how its props are assembled (different data sources, different field paths, different layout) | **Component registry** | Register your component in `componentsRegistry.js` under the existing key. Wrap your inner widget in `FieldComponentWrapper` if you want the same label/icon/placeholder/help-text mods (from `MODULAR_DEPOSIT_FORM_*_MODIFICATIONS`) and the same Overridable slot exposure that the built-in wrapper provided. |
| Add a section for a **metadata field with no built-in component**                                                                               | **Component registry** | Add a new key plus `FieldComponentWrapper`, supply all props the widget needs (`fieldPath`, `label`, `options`, etc.), and reference the new key from your layout config.                                                                                                                                        |
| Replace **only the inner widget** for a section that already has a working wrapper                                                              | **Overridable**        | Register your component in your instance's `assets/js/invenio_app_rdm/overridableRegistry/mapping.js` under the slot id for that section (see [Override guide](override-guide.md)). It receives the same props the default child would; do **not** wrap it in `FieldComponentWrapper` again.                     |

Use the registry when you need to control how props are gathered or when the section composition itself has to change. Use Overridable when the existing wrapper does what you want and you only need a different inner widget.

Imports you typically need when writing a replacement:

```javascript
import { FieldComponentWrapper } from "@js/invenio_modular_deposit_form/field_components/FieldComponentWrapper";
import {
  TextField,
  SelectField,
  RemoteSelectField,
} from "@js/invenio_modular_deposit_form/replacement_components";
```

Prefer the package's [replacement field components](replacement_field_components.md) (`TextField`, `SelectField`, `RemoteSelectField`, etc.) over the stock `react-invenio-forms` widgets so visible-error gating ("touched") stays consistent across the form.

(custom-layout-components)=

## Custom layout components

The structural components used by the layout config — `FormPage`, `FormSection`, `FormRow`, `FormHeader`, `FormLeftSidebar`, `FormRightSidebar`, `FormFooter`, `FormStepper`, etc. — are themselves entries in the component registry. To replace one (or to add a new structural component) you register it in your instance's `componentsRegistry.js` under the same name and reference it from the layout config.

When writing a custom layout component:

- **Forward `children` unchanged** so child sections render inside your layout. The package builds the section tree from the layout config and passes the resolved child elements down.
- If your component needs to react to the current resource type, current page, or overall error state, read from the package's `FormUIStateContext` / `useFormUIState` hook (see [Available hooks and contexts](#available-hooks-and-contexts) below). Doing this through the context, rather than re-deriving the same state from Redux or Formik directly, keeps your component in sync with the rest of the form.
- For HTML-only changes to a structural component, prefer overriding it via the React Overridable mechanism in your instance's `mapping.js`; that avoids re-implementing prop assembly.

(available-hooks-and-contexts)=

## Available hooks and contexts

When writing a custom component, these are the imports the package treats as part of its public surface for extenders:

| Import                                                                                                               | Purpose                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import { FieldComponentWrapper } from "@js/invenio_modular_deposit_form/field_components/FieldComponentWrapper"`    | Wrap a custom field widget so it receives the layout's label/icon/placeholder/help-text mods and exposes the matching Overridable slot.                              |
| `import { CustomField } from "@js/invenio_modular_deposit_form/field_components/CustomField"`                        | Render an InvenioRDM custom field by name, resolving its widget and props from `RDM_CUSTOM_FIELDS_UI`. See [Handling custom fields](#handling-custom-fields).        |
| `import { useCurrentFieldMods } from "@js/invenio_modular_deposit_form/hooks/useCurrentFieldMods"`                   | Read the `MODULAR_DEPOSIT_FORM_*_MODIFICATIONS`, `*_FIELD_VALUES`, and `EXTRA_REQUIRED_FIELDS` values for the current resource type.                                 |
| `import { useCurrentResourceTypeFields } from "@js/invenio_modular_deposit_form/hooks/useCurrentResourceTypeFields"` | Resolve the section list for the currently selected resource type (with `same_as` followed).                                                                         |
| `import { useFormPageNavigation } from "@js/invenio_modular_deposit_form/hooks/useFormPageNavigation"`               | Read or control the current form page in a multi-page layout.                                                                                                        |
| `import { useCustomFieldWidget } from "@js/invenio_modular_deposit_form/hooks/useCustomFieldWidget"`                 | The lookup hook used internally by `CustomField`; useful when one component needs to compose several custom fields.                                                  |
| `import { useFormUIState, FormUIStateContext } from "@js/invenio_modular_deposit_form/FormUIStateManager"`           | Current resource type, current page, and combined client + server error state. Use this in custom layout components instead of re-implementing the same derivations. |

Replacement input widgets (`TextField`, `SelectField`, `RemoteSelectField`, `TextArea`, `MultiInput`, `Input`, `Dropdown`, `AutocompleteDropdown`) live under `@js/invenio_modular_deposit_form/replacement_components` — see [Replacement field components](replacement_field_components.md) for the behavioural differences from upstream.

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
