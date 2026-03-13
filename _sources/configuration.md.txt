# Configuration

## Creating a custom form layout

You define the deposit form layout by setting `INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS` in your instance's `invenio.cfg`. The default configuration in this package's `config.py` provides a good guide. At its most basic, the layout configuration is a nested tree of dictionaries in which each dictionary represents a React component. Some components are structural layout components; others are wrappers for individual form field components. Each dictionary in the tree has:

- a unique `"section"` id
- a `"component"` property with a string corresponding to a component name in `componentsRegistry.js`
- an optional `"subsections"` array of child components
- an optional readable `"label"`

```{note}
The list of form layout components is extensible. The description below highlights the layout components built in by default.
```

### Example: minimal two-page layout

```python
# in invenio.cfg or your config module
INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS = [
    {
        "section": "pages",
        "component": "FormPages",
        "subsections": [
            {
                "section": "page-1",
                "label": "Type & Title",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "resource_type",
                        "label": "Resource Type",
                        "component": "ResourceTypeComponent",
                    },
                    {
                        "section": "titles",
                        "label": "Title",
                        "component": "TitlesComponent",
                    },
                    {
                        "section": "abstract",
                        "label": "Description",
                        "component": "AbstractComponent",
                    },
                ],
            },
            {
                "section": "page-2",
                "label": "Publish",
                "subsections": [
                    {
                        "section": "submit_actions",
                        "label": "Publish",
                        "component": "SubmissionComponent",
                    },
                ],
            },
        ],
    }
]
```

### Top-level form

The `INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS` value is a **list** of layout objects. Regions are identified by their `"component"` value; **order in the array does not matter**.

You must include exactly one object with `"component": "FormPages"`; its `"subsections"` array defines the form pages. You may also include optional **layout region** objects to place content in the form header, left sidebar, right sidebar, or form footer. Each of these is a sibling of the `FormPages` object in the top-level list.

**Required**

- **FormPages** — One object with `"component": "FormPages"` and a `"subsections"` array. Defines the main form body (title, stepper, and page content). Optional responsive column keys: `mobile`, `tablet`, `computer`, `largeScreen`, `widescreen` (camelCase; use `largeScreen` for the large-monitor breakpoint, not `largeMonitor`).

**Optional layout regions**

- **FormHeader** — `"component": "FormHeader"`. Rendered above the form (below the community banner if shown), full width.
- **FormLeftSidebar** — `"component": "FormLeftSidebar"`. Rendered in a left column (default 3 grid units on computer, 16 on mobile). Optional responsive column keys: `mobile`, `tablet`, `computer`, `largeScreen`, `widescreen`.
- **FormRightSidebar** — `"component": "FormRightSidebar"`. Same as left sidebar. The default package layout uses it with **FormFeedbackComponent** (form feedback above), **SubmissionComponent** (stock-style submit card), and **AccessRightsComponent** (Visibility). See [Built-in field widget components](field_components.md#multiple-components-for-the-same-field-or-region) for the difference between SubmissionComponent and HorizontalSubmissionComponent and when to use FormFeedbackComponent.
- **FormFooter** — `"component": "FormFooter"`. Rendered below the main form, full width.

**FormPages** accepts the same optional responsive column keys. If omitted, the main column at each breakpoint is **16 minus the left sidebar width minus the right sidebar width** at that breakpoint.

**Page navigation components** (`FormStepper`, `FormPageNavigationBar`, `FormSidebarPageMenu`) are in the component registry and appear when you include them in the relevant region's `subsections`. Pass **`classnames`** to control visibility or styling. Use the same responsive visibility classes as invenio-theme/invenio-app-rdm: `mobile only`, `tablet only`, `computer only`, etc. **Column width** config keys use camelCase (`largeScreen` not `largeMonitor`).

Example:

```python
{
    "section": "form-header",
    "component": "FormHeader",
    "subsections": [
        {
            "section": "header_message",
            "label": "Notice",
            "component": "SomeMessageComponent",
        },
    ],
},
{
    "section": "pages",
    "component": "FormPages",
    "subsections": [ ...pages... ],
},
```

### Form page(s)

Each item in `subsections` is a **page** of the form with component value `"FormPage"`. The form may have just a single page; in that case all content is visible at once, like the default InvenioRDM form.

If multiple pages are provided, include **FormStepper** in the FormHeader region and optionally **FormPageNavigationBar** in the FormFooter and **FormSidebarPageMenu** in the FormLeftSidebar. The `label` attributes of each page dictionary are used in the stepper and sidebar menu.

### Page layout components

Each member of a page's `subsections` list is a top-level subdivision of that page. Three kinds of section components are provided: `SectionWrapper`, `FormRow`, or a single field component.

#### SectionWrapper

By default, a `SectionWrapper` is rendered as a `<fieldset>` element. If a `label` is provided, it is shown as the fieldset's `<legend>` (controlled by `show_heading`). The section is full-width and its contents are always visible. **Children are stacked vertically (full width)**. For horizontal layout of two or more fields, put them inside a **FormRow** in the section's `subsections` (see FormRow below).

When `collapsible` is `true`, the section is rendered as a single accordion pane: the label becomes a clickable header that expands or collapses the content. Use this to keep long forms manageable. The initial state is controlled by `startExpanded`.

**Properties:**

- **icon** — FontAwesome icon name (semantic-ui icon set).
- **show_heading** — When `false` (default), the fieldset has no visible legend. When non-collapsible, set to `true` to show the legend. When collapsible, the label is always shown in the accordion title.
- **collapsible** — When `true` (default `false`), the section is an accordion pane.
- **startExpanded** — When `collapsible` is `true`, set to `true` (default) to show the section open initially, or `false` to show it collapsed.
- **classnames** — Optional CSS classes added to the container.

#### FormRow

A `FormRow` component renders a Semantic UI `Form.Group`. It holds one or more child components in its `subsections` list, laid out in a horizontal row. Spacing can be configured with classes like `"equal-width"`.

Like `SectionWrapper`, the `FormRow` dictionary may contain the basic component properties and `"classnames"`. Properties `"label"`, `"show_heading"`, and `"icon"` are ignored. To get a fieldset with an overall legend, wrap the row in a `SectionWrapper`.

#### Wrapped field widget component

If a field widget component has `"wrapped": True`, it will automatically be wrapped in its own `SectionWrapper`. Such a wrapped field widget cannot have a `subsections` property with children. For complex sections, use the other structuring components or extend with a new composite field widget component.

#### Extending the layout components

To change the HTML of any structural component, override it using the ReactOverridable mechanism and your instance's `mapping.js` file. Ensure your layout components pass through the `children` property. You can also create entirely new custom layout components using the component extension methods described in [Extending](extending.md).

### Field widget components

The lowest-level dictionaries represent individual form field widgets or pre-structured sets. Each must have a `"section"` id and a `"component"` value that exists in the combined component registry.

Most form field components can accept: **description**, **helpText**, **placeholder**, **icon**, **label**, **required** (defaults to `false` unless required in Yup schema or Invenio JSONSchema), **classnames**, **showLabel** (defaults to `true`).

**Any additional keys** in the dictionary for a field widget **will be passed through to the widget component as props**. Props are overridden in the sequence: built-in defaults → React field_components definition → invenio.cfg values (lowest to highest priority).

### Field widths

Within a FormRow, declare widths using the `"classnames"` property and Semantic UI grid classes:

1. For equal-width fields, give the FormRow a `"classnames"` value that includes `"equal width"`.
2. For different widths, give each field component a `"classnames"` value that includes `"X wide"` (e.g. `"two wide"`). You may use responsive width classes for different breakpoints.

### Compound field components

You can provide **compound field components** that render a pre-configured block of multiple field components. In the layout you reference a single component that composes them internally.

**Built-in example: CombinedDatesComponent** — Renders PublicationDateComponent (publication date) and AdditionalDatesComponent (additional dates). In the layout add one section. Alternatively, use **PublicationDateComponent** and **AdditionalDatesComponent** as two separate sections if you want to place or configure them independently.

```python
{
    "section": "combined_dates",
    "label": "Dates",
    "component": "CombinedDatesComponent",
}
```

**Implementing your own compound component:**

1. Create a React component that imports and renders the child field components. Use the package's **SectionWrapper** and **FormRow** to group and arrange the fields.
2. Register the component in your instance's component registry (or the package's `componentsRegistry.js`) with value `[Component, fieldPaths]` where `fieldPaths` is an array of all metadata field paths the block touches.
3. Add one section in `INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS` or `INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` that references your component by name.

## Changing layout by resource type

The `INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` config variable lets you change layout elements based on the current resource type. Its keys are InvenioRDM resource type names (from your instance's `resource_types` vocabulary). The values are dictionaries describing how pages should be laid out for that resource type; keys must correspond to the `section` ids of the `FormPage` components in your common fields layout.

If a page is not included in the resource type dictionary, the default layout from the common fields is used. If a page is included, the new page layout **replaces** the default for that page.

Example: replace the entire `"page-3"` page with a single ISBN field when the selected resource type is `"textDocument-book"`:

```python
{
    "textDocument-book": {
        "page-3": [
            {
                "section": "isbn",
                "label": "ISBN",
                "component": "ISBNComponent",
                "wrapped": True,
            },
        ],
    },
}
```

To re-use the override from another resource type, include an object with a single key `same_as` whose value is the label of another configured resource type. Example:

```python
"textDocument-monograph": {"page-2": [{"same_as": "textDocument-book"}]}
```

## Other changes to fields by resource type

Additional config values allow customization of specific props at the field widget level by resource type without declaring a whole new page layout:

- **INVENIO_MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS**
- **INVENIO_MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS**
- **INVENIO_MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS**
- **INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS**
- **INVENIO_MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS**
- **INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES**
- **INVENIO_MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES**
- **INVENIO_MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS**

Each value is a dictionary with resource types as keys. The value for each resource type is a dictionary with dot-separated metadata field paths as keys and the value to use.

Example: modify the icon for the title field by resource type:

```python
INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {
    "audio": {"metadata.title": "headphones"},
    "dataset": {"metadata.title": "table"},
    "image-photo": {"metadata.title": "camera"},
    "presentation": {"metadata.title": "microphone"},
}
```

## InvenioRDM version 14 extensions

InvenioRDM v14 adds optional deposit form components that are **not** included in the default layout or component registry, so that this package builds and runs against invenio-app-rdm v13 (where those components do not exist).

If your instance runs **InvenioRDM v14** and you want to enable them, you can register them via the component registry and add them to your layout.

**Components**

- **RecordDeletionComponent** — Request deletion of a published record. Shown in the submit-actions region (e.g. next to the delete button) when the record is published. Requires backend config for record deletion (e.g. `config.record_deletion` with `enabled`) and vocabulary `vocabularies.metadata.deletion_request_removal_reasons`.
- **FileModificationUntilComponent** — Shows "Unlocked, X days to publish changes" in the Files section when `config.file_modification` is set. Place it as a sibling before the file uploader in the Files page content.

**How to enable**

1. **Register the components** — In your instance's `componentsRegistry.js` (the directory you expose via the `invenio_modular_deposit_form.components_registry` entry point), import the wrappers from `@js/invenio_modular_deposit_form/field_components/v14_components` and add them to the registry as `RecordDeletionComponent` and `FileModificationUntilComponent` (value `[RecordDeletionComponent, []]` and `[FileModificationUntilComponent, []]`). This file is only loaded when your instance imports it, so the app-rdm v14 imports inside it do not affect the package build when building against v13.

2. **Add them to the layout** — To show RecordDeletion in the submit area, add a section that references `RecordDeletionComponent` in the same region as `SubmissionComponent` (e.g. in `FormRightSidebar` subsections). To show FileModificationUntil in the Files section, add it as a subsection of the Files page (e.g. before or after the file upload section). The default package layout does not include these sections; copy the layout from the package's `config.py` and add the v14 sections where you want them.

See [Adding your own React components](extending.md) for how to register the `components_registry` entry point.

