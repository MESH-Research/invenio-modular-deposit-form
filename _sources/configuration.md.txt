# Configuration

## Quick start: shipped layout presets

The package ships several ready-made layout presets. The default is **`COMMON_FIELDS_ALTERNATE_PAGED`** with the matching **`FIELDS_BY_TYPE_ALTERNATE_PAGED`** — you don't need to set anything to use it. To pick a different preset, set both variables to the matching pair in your instance `invenio.cfg`:

```python
from invenio_modular_deposit_form.config.default import (
    COMMON_FIELDS_DEFAULT_PAGED,
    FIELDS_BY_TYPE_DEFAULT_PAGED,
)

MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = FIELDS_BY_TYPE_DEFAULT_PAGED
```

Available presets:

| `COMMON_FIELDS` value | Matching `FIELDS_BY_TYPE` | Layout shape |
| --- | --- | --- |
| `COMMON_FIELDS_ALTERNATE_PAGED` *(default)* | `FIELDS_BY_TYPE_ALTERNATE_PAGED` | Multi-page form with stepper, alternate page grouping suited to scholarly works. |
| `COMMON_FIELDS_DEFAULT_PAGED` | `FIELDS_BY_TYPE_DEFAULT_PAGED` | Multi-page form with the stepper inside the form header on mobile/tablet only and a sidebar page menu on larger screens. |
| `COMMON_FIELDS_DEFAULT_PAGED_TOP_STEPPER` | `FIELDS_BY_TYPE_DEFAULT_PAGED` | Same field layout as `DEFAULT_PAGED` but with the stepper always at the top instead of in the sidebar. |
| `COMMON_FIELDS_DEFAULT_SINGLE` | `FIELDS_BY_TYPE_DEFAULT_PAGED` | Single-page form (everything visible at once, like the stock InvenioRDM form). |

`ALTERNATE_PAGED` is in `invenio_modular_deposit_form.config.alternate_paged`; the other three are in `invenio_modular_deposit_form.config.default`. To customize one of the presets, copy it into your instance config and edit it there — see [Creating a custom form layout](#creating-a-custom-form-layout) for the schema.

## Creating a custom form layout

You define the deposit form layout by setting `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` in your instance's `invenio.cfg`. The default configuration in this package's `config.py` provides a good guide. At its most basic, the layout configuration is a nested tree of dictionaries in which each dictionary represents a React component. Some components are structural layout components; others are wrappers for individual form field components. Each dictionary in the tree has:

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
MODULAR_DEPOSIT_FORM_COMMON_FIELDS = [
    {
        "section": "pages",
        "component": "FormPages",
        "subsections": [
            {
                "section": "1",
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
                "section": "2",
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

The `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` value is a **list** of layout objects. Regions are identified by their `"component"` value; **order in the array does not matter**.

You must include exactly one object with `"component": "FormPages"`; its `"subsections"` array defines the form pages. You may also include optional **layout region** objects to place content in the form header, left sidebar, right sidebar, or form footer. Each of these is a sibling of the `FormPages` object in the top-level list.

**Required**

- **FormPages** — One object with `"component": "FormPages"` and a `"subsections"` array. Defines the main form body (title, stepper, and page content). Optional responsive column keys: `mobile`, `tablet`, `computer`, `largeScreen`, `widescreen` (camelCase; use `largeScreen` for the large-monitor breakpoint, not `largeMonitor`).

**Optional layout regions**

- **FormTitle** — `"component": "FormTitle"`. Replaces the stock `<h1>` form heading area at the top of the form. When omitted, the form renders the default heading (record title plus selected community label, if any). When present, only the components in your `subsections` are rendered in that region — provide your own heading component(s).
- **FormHeader** — `"component": "FormHeader"`. Rendered above the form (below the community banner if shown), full width.
- **FormLeftSidebar** — `"component": "FormLeftSidebar"`. Rendered in a left column (default 3 grid units on computer, 16 on mobile). Optional responsive column keys: `mobile`, `tablet`, `computer`, `largeScreen`, `widescreen`.
- **FormRightSidebar** — `"component": "FormRightSidebar"`. Same as left sidebar. The default package layout uses it with **FormFeedbackComponent** (form feedback above; implementation paths and optional **`hideMessageIcon`** in [field_components.md](field_components.md#form-feedback-errors-and-action-state)), **SubmissionComponent** (stock-style submit card), and **AccessRightsComponent** (Visibility). See [Built-in field widget components](field_components.md#multiple-components-for-the-same-field-or-region) for the difference between SubmissionComponent and HorizontalSubmissionComponent and when to use FormFeedbackComponent.
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

#### Optional pages and resource types

The set of page ids is fixed in **common** `FormPages` `subsections`, but you can reserve pages that only some resource types need by giving those pages **`subsections: []`** in the common layout (each page must still be a `FormPage` entry with a stable `section` id and `label` for when it appears).

For the **currently selected** resource type, the form merges common subsections with that type’s layout in `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` (`fields_by_type` in the deposit config API). **FormStepper**, **FormSidebarPageMenu**, footer **FormPageNavigationBar** (next/back), and the main page area only include pages whose **merged** subsection list is non-empty—after applying overrides and `same_as` references the same way as the main form body. Types with no override for a placeholder page therefore do not show that step; types that define subsections for that page id show it and use the common `label` in navigation unless overridden.

### Page layout components

Each member of a page's `subsections` list is a top-level subdivision of that page. Three kinds of section components are provided: `FormSection`, `FormRow`, or a single field component.

#### FormSection

By default, a `FormSection` is rendered as a `<fieldset>` element. If a `label` is provided, it is shown as the fieldset's `<legend>` (controlled by `show_heading`). The section is full-width and its contents are always visible. **Children are stacked vertically (full width)**. For horizontal layout of two or more fields, put them inside a **FormRow** in the section's `subsections` (see FormRow below).

When `collapsible` is `true`, the section is rendered as a single accordion pane: the label becomes a clickable header that expands or collapses the content. Use this to keep long forms manageable. The initial state is controlled by `startExpanded`.

**Properties:**

- **icon** — FontAwesome icon name (semantic-ui icon set).
- **show_heading** — When `false` (default), the fieldset has no visible legend. When non-collapsible, set to `true` to show the legend. When collapsible, the label is always shown in the accordion title.
- **collapsible** — When `true` (default `false`), the section is an accordion pane.
- **startExpanded** — When `collapsible` is `true`, set to `true` (default) to show the section open initially, or `false` to show it collapsed.
- **classnames** — Optional CSS classes added to the container.

#### FormRow

A `FormRow` component renders a Semantic UI `Form.Group`. It holds one or more child components in its `subsections` list, laid out in a horizontal row. Spacing can be configured with classes like `"equal-width"`.

Like `FormSection`, the `FormRow` dictionary may contain the basic component properties and `"classnames"`. Properties `"label"`, `"show_heading"`, and `"icon"` are ignored. To get a fieldset with an overall legend, wrap the row in a `FormSection`.

#### Wrapped field widget component

If a field widget component has `"wrapped": True`, it will automatically be wrapped in its own `FormSection`. Such a wrapped field widget cannot have a `subsections` property with children. For complex sections, use the other structuring components or extend with a new composite field widget component.

#### Extending the layout components

To change the HTML of any structural component, override it using the ReactOverridable mechanism and your instance's `mapping.js` file. Ensure your layout components pass through the `children` property. You can also create entirely new custom layout components — see [Custom layout components](extending.md#custom-layout-components) in the extending guide.

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

To author your own compound component, see [Custom layout components](extending.md#custom-layout-components) and [The componentsRegistry object](extending.md#the-componentsregistry-object) in the extending guide. From the configuration side you only need to add one section that references its registered name, the same way you would for any other built-in component.

## Responsive layout

The form layout supports two complementary mechanisms for varying what is shown by viewport width:

1. **Per-breakpoint column widths** — set widths on a layout region (`FormPages`, `FormLeftSidebar`, `FormRightSidebar`) so the column collapses or grows at each breakpoint.
2. **CSS visibility classes** — pass Semantic UI responsive helper classes via `classnames` (for any region/component) or `menuItemClasses` (for a `FormPage`'s stepper/sidebar entry) so the element is hidden via `display: none` at the breakpoints you choose.

Use widths to control how the grid lays out; use classes to hide individual elements without re-laying-out the columns.

### Per-breakpoint column widths

The optional keys `mobile`, `tablet`, `computer`, `largeScreen`, and `widescreen` (camelCase; use `largeScreen`, **not** `largeMonitor`) accept Semantic UI grid column widths (1–16). They are accepted by `FormPages`, `FormLeftSidebar`, and `FormRightSidebar`.

```python
{
    "component": "FormLeftSidebar",
    "computer": 3,
    "largeScreen": 3,
    "widescreen": 3,
    # mobile/tablet omitted: zero-width = collapsed at those breakpoints
    "only": "large screen",
    "subsections": [...],
},
```

The `"only"` key is a shortcut for zeroing widths at every breakpoint **smaller** than the named one. `"only": "computer"` zeroes `mobile` and `tablet`; `"only": "large screen"` zeroes `mobile`, `tablet`, and `computer`. When you use `"only"`, omit the now-redundant smaller-breakpoint keys (any value you do supply is ignored — the zeroing wins).

If `FormPages` does not declare per-breakpoint widths, its width at each breakpoint is `16 − <left sidebar width> − <right sidebar width>` at that breakpoint, so collapsing a sidebar via `"only"` automatically widens the main column.

### Aligning rows with `SpacerColumn`

`SpacerColumn` is an empty `Grid.Column` you drop into any region's `subsections` to consume grid units. Combine it with the per-breakpoint width keys (`mobile` / `tablet` / `computer` / `largeScreen` / `widescreen`) and the `"only"` shortcut to push other columns into alignment with sibling rows, add a responsive-width margin, or reserve gutter space. It is most useful inside `FormHeader`, `FormTitle`, `FormFooter`, and any `FormRow` where you need an alignment other than the default left edge.

A `SpacerColumn` accepts the same width keys, the `"only"` shortcut, and the same `classnames` (Semantic UI responsive helpers) as any other column. It takes no `subsections` and renders as a single empty `<div class="… column">`.

**Aligning a top stepper with the sidebars.** When a page has a left and/or right sidebar at large widths, a stepper placed in `FormHeader` needs leading and trailing spacers so it begins at the same x-position as the main column and ends where the right sidebar starts. The spacers' widths mirror each sidebar's widths at each breakpoint:

```python
_PAGED_FORM_HEADER_STEPPER_TOP = {
    "component": "FormHeader",
    "subsections": [
        # Leading spacer: matches the (large-screen-only) left sidebar widths.
        {
            "component": "SpacerColumn",
            "largeScreen": 1,
            "widescreen": 2,
            "only": "large screen",
        },
        # Stepper occupies the central space.
        {
            "component": "FormStepper",
            "classnames": "column computer-only-strict",
            "computer": 11,
        },
        # Trailing spacer: matches the right sidebar widths at computer+.
        {
            "component": "SpacerColumn",
            "computer": 5,
            "largeScreen": 4,
            "widescreen": 4,
            "only": "computer",
        },
    ],
}
```

**Responsive-width margin.** Use a single leading spacer to push everything that follows in the row by N grid units, with different N at each breakpoint, then attach `"only"` so the margin disappears at smaller widths:

```python
{"component": "SpacerColumn", "largeScreen": 1, "widescreen": 2, "only": "large screen"},
```

**Aligning the form title with the main column.** Place a `FormTitle` with a leading `SpacerColumn` whose widths match the left sidebar so the heading starts above the main column rather than the page edge:

```python
{
    "component": "FormTitle",
    "subsections": [
        {"component": "SpacerColumn", "largeScreen": 3, "widescreen": 3, "only": "large screen"},
        {"component": "FormTitle", "computer": 16, "largeScreen": 13, "widescreen": 13},
    ],
},
```

**Tips.**

- To hide a spacer without zeroing widths, use a Semantic UI visibility class via `classnames` (e.g. `"mobile hidden"`); to collapse it to zero width at smaller breakpoints, prefer `"only"`. The two are interchangeable for hiding, but `"only"` keeps the breakpoint width math explicit.
- Always declare a width for every breakpoint the spacer should occupy. A column with no width set at a breakpoint inherits Semantic UI's default (auto-fill of the row), which is usually not what you want for a spacer.
- Spacers participate in the row's 16-column budget. Make sure the sum of widths for each breakpoint adds up correctly across all columns in the row.

### CSS visibility classes (`classnames`)

For finer-grained control — hiding a single component without affecting grid widths — use Semantic UI's responsive utility classes via `classnames`. The element stays in the DOM; only its `display` is toggled.

| Class | Visible at |
| --- | --- |
| `mobile only` | Mobile only (≤767px). |
| `tablet only` | Tablet only (768–991px). |
| `computer only` | Computer **and larger** (≥992px) — *not* strict "only computer". |
| `large screen only` | Large screen **and larger** (≥1200px). |
| `widescreen only` | Widescreen only (≥1920px). |
| `mobile hidden`, `tablet hidden`, `computer hidden`, `large screen hidden`, `widescreen hidden` | Everywhere except the named breakpoint. |
| `tablet mobile only` (and similar two-/three-word combinations) | Only at the named breakpoints (composes the per-breakpoint hides). |
| **`computer-only-strict`** *(custom helper)* | Computer breakpoint only (992–1199px) — hidden on mobile, tablet, large screen, and widescreen. Use when you need a strict "only computer" that excludes large monitors. |

`computer-only-strict` is defined in this package's `deposit_form.less`; the others are built into Semantic UI's grid styles.

For components that render as a `Grid.Column` (`FormStepper`, custom column-rendering components), include `"column"` in `classnames` so Semantic UI's column display rules apply alongside the visibility class:

```python
{
    "component": "FormStepper",
    "classnames": "column tablet mobile only",
    "mobile": 16,
    "tablet": 16,
},
{
    "component": "FormStepper",
    "classnames": "column computer-only-strict",
    "computer": 11,
},
```

### Showing/hiding a page menu item without hiding the page

A `FormPage` accepts an optional **`menuItemClasses`** key. The string is applied to the page's stepper step (`FormStepper`) **and** sidebar menu item (`FormSidebarPageMenu`) only — not to the page content. This lets you hide the navigation entry at some breakpoints while keeping the page reachable via direct URL (`?page=<section>`), the next/back footer navigation (`FormPageNavigationBar`), and any other links pointing at it.

```python
{
    "section": "6",
    "label": _("Save & Publish"),
    "component": "FormPage",
    "menuItemClasses": "tablet mobile only",
    "subsections": [...],
},
```

With the example above the "Save & Publish" step appears in the menu only at mobile/tablet widths; at computer+ widths the menu item disappears but the page remains addressable.

### Worked example: shifting save/access/feedback between sidebar and page

Pattern: at computer and larger widths the submission/access/feedback components live in the right sidebar; at tablet and mobile widths the right sidebar collapses and the same components appear on a dedicated form page reachable from the menu/stepper.

```python
# Right sidebar: visible on computer+; collapses at mobile/tablet via `only`.
_PAGED_FORM_RIGHT_SIDEBAR = {
    "component": "FormRightSidebar",
    "classnames": "default-layout",
    "computer": 5,
    "largeScreen": 4,
    "widescreen": 4,
    "only": "computer",
    "subsections": [
        {"section": "form_feedback", "component": "FormFeedbackComponent"},
        {"section": "submit_actions", "label": "Publish", "component": "SubmissionComponent"},
        {"section": "access", "label": "Visibility", "component": "AccessRightsComponent"},
    ],
}

# Dedicated "Save & Publish" page: menu/stepper item only on tablet/mobile.
# Components are unwrapped (`wrapped: False`) since they render their own card-like shells.
_SAVE_AND_PUBLISH_PAGE = {
    "section": "6",
    "label": _("Save & Publish"),
    "component": "FormPage",
    "menuItemClasses": "tablet mobile only",
    "subsections": [
        {"section": "form_feedback", "component": "FormFeedbackComponent", "wrapped": False},
        {"section": "submit_actions", "label": _("Publish"), "component": "SubmissionComponent", "wrapped": False},
        {"section": "access", "label": _("Visibility"), "component": "AccessRightsComponent", "wrapped": False},
    ],
}
```

Add both objects to `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` (place `_SAVE_AND_PUBLISH_PAGE` inside `FormPages.subsections`). At computer+ widths the user sees the right sidebar as before; at tablet/mobile widths the sidebar disappears and the user reaches the same controls via the new page entry. Because the page itself is not responsively hidden, an existing hard link to `?page=6` keeps working at every breakpoint.

## Changing layout by resource type

The `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` config variable lets you change layout elements based on the current resource type. Its keys are InvenioRDM resource type names (from your instance's `resource_types` vocabulary). The values are dictionaries describing how pages should be laid out for that resource type; keys must correspond to the `section` ids of the `FormPage` components in your common fields layout.

If a page is not included in the resource type dictionary, the default layout from the common fields is used. If a page is included, the new page layout **replaces** the default for that page.

Example: replace the entire page whose `section` is `"3"` with a single ISBN field when the selected resource type is `"textDocument-book"`:

```python
MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = {
    "textDocument-book": {
        "3": {
            "subsections": [
                {
                    "section": "isbn",
                    "label": "ISBN",
                    "component": "ISBNComponent",
                    "wrapped": True,
                },
            ],
        },
    },
}
```

### Inheriting page layouts with `same_as`

To re-use another resource type's page entry for the same FormPage `section` id, set top-level `same_as` to that type's id. The form resolves the target page first (chasing further `same_as` references along the way, with cycle detection), then **shallow-merges** your entry on top.

Merge rules:

- Keys you set on your entry — `label`, `classnames`, and any other keys the page object supports — override the resolved base.
- **`subsections`** is the only key with special handling: omit it and the base's subsection list is inherited; include it and your list replaces the inherited one entirely (no item-level merging).
- The `same_as` key itself is stripped from the merged result.
- Cycles (`a → b → a`) are detected and resolve to the originating entry without recursion.

Example:

```python
MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = {
    "textDocument-monograph": {
        "2": {"same_as": "textDocument-book", "label": "Monograph details"},
    },
}
```

## Per-field modifications by resource type

Several config variables let you customize individual field widget props by resource type without declaring a whole new page layout. They all share the same shape:

```python
{
    "<resource-type-id>": {
        "<dot-separated-metadata-path>": <value>,
        ...
    },
    ...
}
```

Resource types not listed in the map fall back to the props the layout config provides; field paths not listed for the current type are unaffected. The `FieldComponentWrapper` reads each map at render time and overrides the matching prop on the widget it wraps.

### Display and metadata modifications (apply to all built-in widgets)

| Variable | Overrides | Value type |
| --- | --- | --- |
| **`MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS`** | `label` | string (or `lazy_gettext(...)`) |
| **`MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS`** | `placeholder` | string |
| **`MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS`** | `description` | string |
| **`MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS`** | `labelIcon` (FontAwesome name) | string |
| **`MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS`** | `helpText` | string |
| **`MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS`** | `required` flag on the widget (does **not** affect server-side validation) | bool |

Example — change the title field's icon by resource type:

```python
MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {
    "audio": {"metadata.title": "headphones"},
    "dataset": {"metadata.title": "table"},
    "image-photo": {"metadata.title": "camera"},
    "presentation": {"metadata.title": "microphone"},
}
```

For custom fields, the field path uses the InvenioRDM custom-field syntax (e.g. `"custom_fields.journal:journal.title"`).

### Field value modifications (only effective in custom widgets)

The following two variables are wired all the way through to each `FieldComponentWrapper`, but **none of the package's built-in widgets currently consume them**. They are forwarded to the inner widget as the props named in the table; a custom widget you write can read those props and use them.

| Variable | Prop received by widget | Intended use |
| --- | --- | --- |
| **`MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES`** | `defaultFieldValue` (singular) | Pre-fill an empty field with a default. |
| **`MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES`** | `priorityFieldValues` | Display value(s) the widget should surface as preferred suggestions. |

If you set these expecting them to affect the stock title/abstract/etc. widgets, they will not — see [Adding your own components](extending.md) for how to write a widget that reads these props.

## Other configuration flags

These flags toggle global form behaviour. None of them require asset rebuilds at config-change time *except* `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` (see note below).

### `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION`

Default: `True`.

When `True`, the form loads your `validator.js` (see [Validation](validation.md) and [Adding your own components](extending.md#module-contracts)) and runs the resulting Yup schema on every change. When `False`, no client schema is loaded; field errors only appear after submit returns server-side validation errors.

```{note}
Changing this value requires rebuilding assets (`invenio webpack build`) — the choice is baked in at build time by `webpack_extras.get_validator_path()`.
```

### `MODULAR_DEPOSIT_FORM_USE_CONFIRM_MODAL`

Default: `True`.

When `True`, attempting to navigate to another page in a multi-page form while the current page has unresolved errors opens a confirmation modal asking the user to either fix the errors or proceed. When `False`, the errors are still flagged on the leaving page but no modal interrupts navigation.

### `MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP`

Default: `True`.

When `True`, a full-width community banner (the stock InvenioRDM `CommunityHeader`) is rendered above the form title whenever the deposit state would normally show it (community selected or selectable). Set to `False` to suppress it; the selected community will then be shown next to the form title instead.

### `MODULAR_DEPOSIT_FORM_PRIORITY_RESOURCE_TYPES`

Default: `("publication-article", "publication-peerreview", "publication-book", "publication-section", "lesson")`.

Ordered tuple of resource type ids that the `ResourceTypeSelectorComponent` exposes as shortcut buttons (in addition to the always-present "Other…" control that opens the full vocabulary select).

```{important}
Only the **first five** ids in the tuple are rendered as buttons. Additional ids are ignored. List your most-specific or highest-traffic types first.
```

Ids must come from your instance's `resource_types` vocabulary.

### `MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES`

Default: a `doi` entry with KC-flavoured labels and help text (see `invenio_modular_deposit_form/config/config.py`).

Maps PID scheme ids to dictionaries of UI-string overrides that are **shallow-merged into the matching entry of stock `RDM_PERSISTENT_IDENTIFIERS`** before the deposit form mounts. Any keys you set replace the corresponding keys on the PID config; keys you omit keep their stock value.

```{note}
Only the **`doi`** scheme is currently honoured by the merge logic. Entries for other schemes are ignored.
```

Keys most commonly overridden:

| Key | Effect |
| --- | --- |
| `field_label` | The visible field label (e.g. "Digital Object Identifier"). |
| `pid_placeholder` | Input placeholder text. |
| `btn_label_get_pid` | Label for the "reserve a PID" button. |
| `btn_label_discard_pid` | Label for the discard-reserved-PID button. |
| `managed_help_text` | Help text shown when the instance is configured to manage DOIs. |
| `reserved_help_text` | Help text shown after a DOI has been reserved. |
| `unmanaged_help_text` | Help text shown when DOIs are not managed by this instance. |

Example — switch the field label and reserve-button text:

```python
MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES = {
    "doi": {
        "field_label": "DOI",
        "btn_label_get_pid": "Reserve a DOI",
    },
}
```

## Custom fields and namespaces

The package ships its own InvenioRDM custom-field defaults (codemeta, journal, imprint, meeting, thesis) and the matching UI definitions, applied to the standard Flask config keys:

- **`RDM_NAMESPACES`** — namespace prefixes (`codemeta`, `journal`, `imprint`, `meeting`, `thesis`).
- **`RDM_CUSTOM_FIELDS`** — backend custom-field declarations (with `VocabularyCF` instances replaced by a hardened subclass that won't 500 the form when a vocabulary is missing — see `SafeVocabularyCF`).
- **`RDM_CUSTOM_FIELDS_UI`** — UI definitions consumed by `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` and the stock InvenioRDM custom-field rendering.

```{important}
**Partial overrides are a footgun.** The package applies these defaults in two passes:

1. `init_config` uses `setdefault`, so any value you set in `invenio.cfg` wins outright.
2. `finalize_app` (after the full config stack settles) re-applies the package defaults **only when the value is still `[]`** — i.e. nothing else, including your `invenio.cfg`, supplied a non-empty value.

If you set `RDM_CUSTOM_FIELDS = [my_field]` (or `RDM_CUSTOM_FIELDS_UI = [my_ui]`) in your `invenio.cfg`, you **lose the package's journal/imprint/codemeta/meeting/thesis fields** entirely — neither pass will re-add them. To extend rather than replace, spread the package defaults yourself:
```

```python
from invenio_modular_deposit_form.config import config as imdf_config

RDM_CUSTOM_FIELDS = [
    *imdf_config.RDM_CUSTOM_FIELDS,
    my_extra_field,
]
RDM_CUSTOM_FIELDS_UI = [
    *imdf_config.RDM_CUSTOM_FIELDS_UI,
    my_extra_ui,
]
RDM_NAMESPACES = {
    **imdf_config.RDM_NAMESPACES,
    "myns": "https://example.org/ns/",
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

