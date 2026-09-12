# Configuration

## Quick start: shipped layout presets

The package ships several ready-made layout presets. The default is
**`COMMON_FIELDS_ALTERNATE_PAGED`** with the matching
**`FIELDS_BY_TYPE_ALTERNATE_PAGED`** — you don't need to set anything to use it.
To pick a different preset, set both variables to the matching pair in your
instance `invenio.cfg`:

```python
from invenio_modular_deposit_form.config.default import (
    COMMON_FIELDS_DEFAULT_PAGED,
    FIELDS_BY_TYPE_DEFAULT_PAGED,
)

MODULAR_DEPOSIT_FORM_COMMON_FIELDS = COMMON_FIELDS_DEFAULT_PAGED
MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = FIELDS_BY_TYPE_DEFAULT_PAGED
```

Available presets:

| `COMMON_FIELDS` value                       | Matching `FIELDS_BY_TYPE`        | Layout shape                                                                                                             |
| ------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `COMMON_FIELDS_ALTERNATE_PAGED` _(default)_ | `FIELDS_BY_TYPE_ALTERNATE_PAGED` | Multi-page form with stepper, alternate page grouping suited to scholarly works.                                         |
| `COMMON_FIELDS_DEFAULT_PAGED`               | `FIELDS_BY_TYPE_DEFAULT_PAGED`   | Multi-page form with the stepper inside the form header on mobile/tablet only and a sidebar page menu on larger screens. |
| `COMMON_FIELDS_DEFAULT_PAGED_TOP_STEPPER`   | `FIELDS_BY_TYPE_DEFAULT_PAGED`   | Same field layout as `DEFAULT_PAGED` but with the stepper always at the top instead of in the sidebar.                   |
| `COMMON_FIELDS_DEFAULT_SINGLE`              | `FIELDS_BY_TYPE_DEFAULT_PAGED`   | Single-page form (everything visible at once, like the stock InvenioRDM form).                                           |
| `COMMON_FIELDS_ZENODO_PAGED`                | _(none shipped)_                 | Multi-page form whose page grouping emulates the Zenodo deposit form.                                                    |

Module locations: `ALTERNATE_PAGED` is in
`invenio_modular_deposit_form.config.alternate_paged`, `ZENODO_PAGED` is in
`invenio_modular_deposit_form.config.zenodo`, and the three `DEFAULT_*` presets
are in `invenio_modular_deposit_form.config.default`.

```{note}
The Zenodo preset ships **no matching `FIELDS_BY_TYPE`**. Either leave
`MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` at its default, or pair it with
`FIELDS_BY_TYPE_DEFAULT_PAGED` and check that the page `section` ids in that
mapping match the page ids in the Zenodo layout — per-type overrides are keyed
by page id, so mismatched ids are silently ignored.
```

To customize one of the presets, copy it into your instance config and edit it
there — see [Creating a custom form layout](#creating-a-custom-form-layout) for
the schema.

## Creating a custom form layout

You define the deposit form layout by setting
`MODULAR_DEPOSIT_FORM_COMMON_FIELDS` in your instance's `invenio.cfg`. The
default configuration in this package's `config.py` provides a good guide. At
its most basic, the layout configuration is a nested tree of dictionaries in
which each dictionary represents a React component. Some components are
structural layout components; others are wrappers for individual form field
components. Each dictionary in the tree has:

- a unique `"section"` id
- a `"component"` property with a string corresponding to a component name in
  `componentsRegistry.js`
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

The `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` value is a **list** of layout objects.
Regions are identified by their `"component"` value; **order in the array does
not matter**.

You must include exactly one object with `"component": "FormPages"`; its
`"subsections"` array defines the form pages. You may also include optional
**layout region** objects to place content in the form header, left sidebar,
right sidebar, or form footer. Each of these is a sibling of the `FormPages`
object in the top-level list.

**Required**

- **FormPages** — One object with `"component": "FormPages"` and a
  `"subsections"` array. Defines the main form body (title, stepper, and page
  content). Optional responsive column keys: `mobile`, `tablet`, `computer`,
  `largeScreen`, `widescreen` (camelCase).

**Optional layout regions**

- **FormTitle** — `"component": "FormTitle"`. Replaces the stock `<h1>` form
  heading area at the top of the form. When omitted, the form renders the
  default heading (record title plus selected community label, if any). When
  present, only the components in your `subsections` are rendered in that region
  — provide your own heading component(s).
- **FormHeader** — `"component": "FormHeader"`. Rendered above the form (below
  the community banner if shown), full width.
- **FormLeftSidebar** — `"component": "FormLeftSidebar"`. Rendered in a left
  column (default 3 grid units on computer and above, 16 on mobile and tablet).
  Optional responsive column keys: `mobile`, `tablet`, `computer`,
  `largeScreen`, `widescreen`. Also accepts **`sticky`** (default `true`), which
  keeps the sidebar in view as the main column scrolls; set it to `false` for a
  sidebar that should scroll away with the page.
- **FormRightSidebar** — `"component": "FormRightSidebar"`. Same as the left
  sidebar, including `sticky`. The default package layout uses it with
  **FormFeedbackComponent** (form feedback above; implementation paths and
  optional **`hideMessageIcon`** in
  [field_components.md](field_components.md#form-feedback-errors-and-action-state)),
  **SubmissionComponent** (stock-style submit card), and
  **AccessRightsComponent** (Visibility). See
  [Built-in field widget components](field_components.md#multiple-components-for-the-same-field-or-region)
  for the difference between SubmissionComponent and
  HorizontalSubmissionComponent and when to use FormFeedbackComponent.
- **FormFooter** — `"component": "FormFooter"`. Rendered below the main form,
  full width.

**FormPages** accepts the same optional responsive column keys. If omitted, the
main column at each breakpoint is **16 minus the left sidebar width minus the
right sidebar width** at that breakpoint.

**Page navigation components** (`FormStepper`, `FormPageNavigationBar`,
`FormSidebarPageMenu`) are in the component registry and appear when you include
them in the relevant region's `subsections`. Pass **`classnames`** to control
visibility or styling. Use the same responsive visibility classes as
invenio-theme/invenio-app-rdm: `mobile only`, `tablet only`, `computer only`,
etc. **Column width** config keys use camelCase (`largeScreen` not
`largeMonitor`).

`FormSidebarPageMenu` additionally accepts **`showBadgeLabels`**, which controls
whether its severity badges show a word ("2 errors") or just the count. It also
accepts a **`label`** used as the menu's accessible name (the shipped layouts
pass `_("Steps")`).

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

Each item in `subsections` is a **page** of the form with component value
`"FormPage"`. The form may have just a single page; in that case all content is
visible at once, like the default InvenioRDM form.

If multiple pages are provided, include **FormStepper** in the FormHeader region
and optionally **FormPageNavigationBar** in the FormFooter and
**FormSidebarPageMenu** in the FormLeftSidebar. The `label` attributes of each
page dictionary are used in the stepper and sidebar menu.

#### Optional pages and resource types

The set of page ids is fixed in **common** `FormPages` `subsections`, but you
can reserve pages that only some resource types need by giving those pages
**`subsections: []`** in the common layout (each page must still be a `FormPage`
entry with a stable `section` id and `label` for when it appears).

For the **currently selected** resource type, the form merges common subsections
with that type’s layout in `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`
(`fields_by_type` in the deposit config API). **FormStepper**,
**FormSidebarPageMenu**, footer **FormPageNavigationBar** (next/back), and the
main page area only include pages whose **merged** subsection list is
non-empty—after applying overrides and `same_as` references the same way as the
main form body. Types with no override for a placeholder page therefore do not
show that step; types that define subsections for that page id show it and use
the common `label` in navigation unless overridden.

### Page layout components

Each member of a page's `subsections` list is a top-level subdivision of that
page. Three kinds of section components are provided: `FormSection`, `FormRow`,
or a single field component.

#### FormSection

By default, a `FormSection` is rendered as a `<fieldset>` element. If a `label`
is provided, it is shown as the fieldset's `<legend>` (controlled by
`show_heading`). The section is full-width and its contents are always visible.
**Children are stacked vertically (full width)**. For horizontal layout of two
or more fields, put them inside a **FormRow** in the section's `subsections`
(see FormRow below).

When `collapsible` is `true`, the section is rendered as a single accordion
pane: the label becomes a clickable header that expands or collapses the
content. Use this to keep long forms manageable. The initial state is controlled
by `startExpanded`.

**Properties:**

- **icon** — FontAwesome icon name (semantic-ui icon set).
- **show_heading** — When `false` (default), the fieldset has no visible legend.
  When non-collapsible, set to `true` to show the legend. When collapsible, the
  label is always shown in the accordion title.
- **collapsible** — When `true` (default `false`), the section is an accordion
  pane.
- **startExpanded** — When `collapsible` is `true`, set to `true` (default) to
  show the section open initially, or `false` to show it collapsed.
- **classnames** — Optional CSS classes added to the container.

```{note}
**`SectionWrapper`** is an alias for `FormSection` in the component registry.
The two names render the same component and take the same properties; you may
see either in existing layouts.

`FormSection` always adds the `invenio-form-section` class itself, so there is
no need to include it in `classnames`.
```

#### FormRow

A `FormRow` component renders a Semantic UI `Form.Group`. It holds one or more
child components in its `subsections` list, laid out in a horizontal row.
Spacing can be configured with classes like `"equal-width"`.

Like `FormSection`, the `FormRow` dictionary may contain the basic component
properties and `"classnames"`. Properties `"label"`, `"show_heading"`, and
`"icon"` are ignored. To get a fieldset with an overall legend, wrap the row in
a `FormSection`.

```{warning}
Do not leave an **empty dictionary** `{}` in a `FormRow`'s `subsections` — a
child with no `component` key cannot be resolved in a row and will break the
form at render time. An empty dictionary elsewhere (in a region's or a page's
`subsections`) is harmless and renders nothing; the shipped layouts use
`"subsections": [{}]` on an otherwise-empty sidebar to reserve its column width.
```

#### Wrapped field widget component

If a field widget component has `"wrapped": True`, it will automatically be
wrapped in its own `FormSection`. Such a wrapped field widget cannot have a
`subsections` property with children. For complex sections, use the other
structuring components or extend with a new composite field widget component.

#### Extending the layout components

To change the HTML of any structural component, override it using the
ReactOverridable mechanism and your instance's `mapping.js` file. Ensure your
layout components pass through the `children` property. You can also create
entirely new custom layout components — see
[Custom layout components](extending.md#custom-layout-components) in the
extending guide.

### Field widget components

The lowest-level dictionaries represent individual form field widgets or
pre-structured sets. Each must have a `"section"` id and a `"component"` value
that exists in the combined component registry.

Most form field components can accept: **description**, **helpText**,
**placeholder**, **icon**, **label**, **required** (defaults to `false` unless
required in Yup schema or Invenio JSONSchema), **classnames**, **showLabel**
(defaults to `true`), **wrapperClasses**, and the width keys described in
[Field widths](#field-widths).

`classnames` lands on the inner widget; **`wrapperClasses`** lands on the
wrapper `<div>` that carries the width classes. Use `wrapperClasses` when you
need to style the field's slot in the row rather than the input itself.

Setting **`label`**, **`description`**, or **`helpText`** to `None` (or to an
empty string) suppresses that element. This is how the shipped layouts remove a
built-in help text they don't want — for example `"helpText": None` on
`PublisherComponent`.

**Any additional keys** in the dictionary for a field widget **will be passed
through to the widget component as props**.

#### Prop precedence

When the same prop is set in more than one place, the later entries win:

1. **Inner widget defaults** — e.g. `showLabel = true` in `TextField`.
2. **The component's own definition** in the package's `field_components.jsx`.
3. **Your layout dictionary** in `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` or
   `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`.
4. **The `MODULAR_DEPOSIT_FORM_*_MODIFICATIONS` maps** in `invenio.cfg`, for the
   currently selected resource type.

```{note}
Step 4 beats step 3 for `label`, `description`, `helpText`, `placeholder`, and
`required`. If a field's label refuses to change when you edit the layout dict,
check whether `MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS` has an entry for that
field path under the resource type you are testing with.
```

### Field widths

Within a FormRow there are two ways to declare widths. Both work; the numeric
keys are usually easier to read and are what the shipped layouts use.

**Option 1 (recommended): numeric width keys.** Give a field component a
**`width`** key with an integer from 1 to 16. The layout converts it to the
matching Semantic UI class on the field's wrapper:

```python
{
    "component": "FormRow",
    "subsections": [
        {"section": "book_title", "component": "BookTitleComponent", "width": 12},
        {"section": "section_pages", "component": "SectionPagesComponent", "width": 4},
    ],
},
```

Field components also accept the same **per-breakpoint width keys** as the
layout regions — `mobile`, `tablet`, `computer`, `largeScreen`, `widescreen` —
so one field can take different widths at different viewport sizes:

```python
{
    "section": "issn",
    "component": "JournalISSNComponent",
    "mobile": 16,
    "tablet": 8,
    "computer": 6,
},
```

`width` sets an unqualified width that applies at every breakpoint; the
breakpoint keys override it at their own sizes. You can combine them.

**Option 2: Semantic UI classes.** Put `"X wide"` (e.g. `"two wide"`) in a field
component's **`classnames`**, or give the FormRow itself a `classnames` value
containing **`"equal width"`** so all its children share the row evenly. The
shipped layouts use `"equal width"` on the row very frequently, and mix it with
explicit `width` values on individual children.

```{note}
`width` and the per-breakpoint width keys apply to **field components** only.
`FormRow` and `FormSection` do not accept them — a `FormRow` is always full
width and is styled through `classnames`. The layout **regions** (`FormPages`,
`FormLeftSidebar`, `FormRightSidebar`, `SpacerColumn`) accept the per-breakpoint
keys but not `width`; see
[Per-breakpoint column widths](#per-breakpoint-column-widths).
```

### Compound field components

You can provide **compound field components** that render a pre-configured block
of multiple field components. In the layout you reference a single component
that composes them internally.

**Built-in example: CombinedDatesComponent** — Renders PublicationDateComponent
(publication date) and AdditionalDatesComponent (additional dates). In the
layout add one section. Alternatively, use **PublicationDateComponent** and
**AdditionalDatesComponent** as two separate sections if you want to place or
configure them independently.

```python
{
    "section": "combined_dates",
    "label": "Dates",
    "component": "CombinedDatesComponent",
}
```

To author your own compound component, see
[Custom layout components](extending.md#custom-layout-components) and
[The componentsRegistry object](extending.md#the-componentsregistry-object) in
the extending guide. From the configuration side you only need to add one
section that references its registered name, the same way you would for any
other built-in component.

## Responsive layout

The form layout supports three complementary mechanisms for varying what is
shown by viewport width:

1. **Per-breakpoint column widths** — set widths on a layout region
   (`FormPages`, `FormLeftSidebar`, `FormRightSidebar`) so the column collapses
   or grows at each breakpoint.
2. **CSS visibility classes** — pass Semantic UI responsive helper classes via
   `classnames` (for any region/component) or `menuItemClasses` (for a
   `FormPage`'s stepper/sidebar entry) so the element is hidden via
   `display: none` at the breakpoints you choose.
3. **JavaScript viewport state** — React components can read live breakpoint
   flags from `useFormUIState` and change what they render (column counts, which
   control to show, animation direction) as the window is resized. The form's
   own page navigation already does this; custom field and layout components can
   too.

Use widths to control how the grid lays out; use classes to hide individual
elements without re-laying-out the columns; use the JS state when a component
needs to _change its behaviour_, not merely whether it is visible.

### Per-breakpoint column widths

The optional keys `mobile`, `tablet`, `computer`, `largeScreen`, and
`widescreen` (camelCase; use `largeScreen`, **not** `largeMonitor`) accept
Semantic UI grid column widths (1–16). They are accepted by `FormPages`,
`FormLeftSidebar`, and `FormRightSidebar`.

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

The `"only"` key is a shortcut for zeroing widths at every breakpoint
**smaller** than the named one. `"only": "computer"` zeroes `mobile` and
`tablet`; `"only": "large screen"` zeroes `mobile`, `tablet`, and `computer`.
When you use `"only"`, omit the now-redundant smaller-breakpoint keys (any value
you do supply is ignored — the zeroing wins).

```{important}
The width-zeroing behaviour of `"only"` runs **only for the top-level
`FormLeftSidebar` and `FormRightSidebar` objects** in
`MODULAR_DEPOSIT_FORM_COMMON_FIELDS`. Anywhere else — on a `SpacerColumn`, a
`FormStepper`, a nested `FormTitle` — `"only"` is passed straight through to
Semantic UI as the `Grid.Column` `only` prop, which toggles CSS visibility but
does **not** change the width math. On those components, declare the widths you
want at each breakpoint explicitly rather than relying on `"only"` to zero them.
```

If `FormPages` does not declare per-breakpoint widths, its width at each
breakpoint is `16 − <left sidebar width> − <right sidebar width>` at that
breakpoint, so collapsing a sidebar via `"only"` automatically widens the main
column.

### Aligning rows with `SpacerColumn`

`SpacerColumn` is an empty `Grid.Column` you drop into any region's
`subsections` to consume grid units. Combine it with the per-breakpoint width
keys (`mobile` / `tablet` / `computer` / `largeScreen` / `widescreen`) and the
`"only"` shortcut to push other columns into alignment with sibling rows, add a
responsive-width margin, or reserve gutter space. It is most useful inside
`FormHeader`, `FormTitle`, `FormFooter`, and any `FormRow` where you need an
alignment other than the default left edge.

A `SpacerColumn` accepts the same width keys and the same `classnames` (Semantic
UI responsive helpers) as any other column. It takes no `subsections` and
renders as a single empty `<div class="… column">`. It also accepts `"only"`,
but as Semantic UI's visibility prop rather than the sidebar width-zeroing
shortcut — always give a spacer an explicit width at every breakpoint where it
should occupy space.

**Aligning a top stepper with the sidebars.** When a page has a left and/or
right sidebar at large widths, a stepper placed in `FormHeader` needs leading
and trailing spacers so it begins at the same x-position as the main column and
ends where the right sidebar starts. The spacers' widths mirror each sidebar's
widths at each breakpoint:

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

**Responsive-width margin.** Use a single leading spacer to push everything that
follows in the row by N grid units, with different N at each breakpoint, then
attach `"only"` so the margin disappears at smaller widths:

```python
{"component": "SpacerColumn", "largeScreen": 1, "widescreen": 2, "only": "large screen"},
```

**Aligning the form title with the main column.** Place a `FormTitle` with a
leading `SpacerColumn` whose widths match the left sidebar so the heading starts
above the main column rather than the page edge:

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

- To hide a spacer without zeroing widths, use a Semantic UI visibility class
  via `classnames` (e.g. `"mobile hidden"`); to collapse it to zero width at
  smaller breakpoints, prefer `"only"`. The two are interchangeable for hiding,
  but `"only"` keeps the breakpoint width math explicit.
- Always declare a width for every breakpoint the spacer should occupy. A column
  with no width set at a breakpoint inherits Semantic UI's default (auto-fill of
  the row), which is usually not what you want for a spacer.
- Spacers participate in the row's 16-column budget. Make sure the sum of widths
  for each breakpoint adds up correctly across all columns in the row.

### CSS visibility classes (`classnames`)

For finer-grained control — hiding a single component without affecting grid
widths — use Semantic UI's responsive utility classes via `classnames`. The
element stays in the DOM; only its `display` is toggled.

#### The breakpoints these classes refer to

The pixel values below are **not** Semantic UI's stock defaults. `invenio-theme`
and `invenio-app-rdm` both override two of them, and every Semantic UI
visibility class is derived from these variables:

| Less variable                  | Invenio value | Stock Semantic UI |
| ------------------------------ | ------------- | ----------------- |
| `@mobileBreakpoint`            | 320px         | 320px             |
| `@tabletBreakpoint`            | 768px         | 768px             |
| **`@computerBreakpoint`**      | **1280px**    | 992px             |
| **`@largeMonitorBreakpoint`**  | **1680px**    | 1200px            |
| `@widescreenMonitorBreakpoint` | 1920px        | 1920px            |

```{important}
If your instance overrides the theme breakpoints in its own `site.variables`,
you must also change the matching constants in the package's
`js/invenio_modular_deposit_form/constants.js`:

- `SEMANTIC_UI_MOBILE_BREAKPOINT_PX` ↔ `@tabletBreakpoint` (currently 768)
- `SEMANTIC_UI_COMPUTER_BREAKPOINT_PX` ↔ `@computerBreakpoint` (currently 1280)
- `SEMANTIC_UI_LARGE_SCREEN_BREAKPOINT_PX` ↔ `@largeMonitorBreakpoint` (currently 1680)

Those constants are what the form's JavaScript uses for viewport-aware page
navigation and for the `atMobile` / `atTablet` / `atComputer` / `atLargeScreen`
flags on form UI state (see below). Nothing detects a mismatch — the CSS and
the JavaScript would simply disagree about where each breakpoint begins.
```

#### The classes

| Class                                                                                           | Visible at                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mobile only`                                                                                   | Mobile only (≤767px).                                                                                                                                                     |
| `tablet only`                                                                                   | Tablet only (768–1279px).                                                                                                                                                 |
| `computer only`                                                                                 | Computer **and larger** (≥1280px) — _not_ strict "only computer".                                                                                                         |
| `large screen only`                                                                             | Large screen **and larger** (≥1680px).                                                                                                                                    |
| `widescreen only`                                                                               | Widescreen only (≥1920px).                                                                                                                                                |
| `mobile hidden`, `tablet hidden`, `computer hidden`, `large screen hidden`, `widescreen hidden` | Everywhere except the named breakpoint.                                                                                                                                   |
| `tablet mobile only` (and similar two-/three-word combinations)                                 | Only at the named breakpoints (composes the per-breakpoint hides).                                                                                                        |
| **`computer-only-strict`** _(custom helper)_                                                    | Computer breakpoint only (1280–1679px) — hidden on mobile, tablet, large screen, and widescreen. Use when you need a strict "only computer" that excludes large monitors. |

`computer-only-strict` is defined in this package's `deposit_form.less`; the
others are built into Semantic UI's grid styles. All of them shift automatically
if the theme's breakpoint variables change, so prefer the class names over
hand-written media queries.

For components that render as a `Grid.Column` (`FormStepper`, custom
column-rendering components), include `"column"` in `classnames` so Semantic
UI's column display rules apply alongside the visibility class:

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

### JavaScript viewport state

Widths and CSS classes only change layout and visibility. Some behaviours need
the component itself to react — for example choosing how many cards fit in a
row, or remapping which page Back/Next should land on. For that, the form keeps
live breakpoint flags on form UI state:

| Flag / field        | Meaning                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `atMobile`          | Viewport is in the mobile band.                                  |
| `atTablet`          | Viewport is in the tablet band.                                  |
| `atComputer`        | Viewport is in the computer band (not large screen and above).   |
| `atLargeScreen`     | Viewport is at the large screen breakpoint or wider.             |
| `viewportTier`      | Ordinal of the active band (0–3), for comparing widen vs shrink. |
| `viewportDirection` | `"widen"`, `"shrink"`, or `"none"` for the last band change.     |

`FormUIStateManager` seeds them from `matchMedia` on mount and updates them on
every breakpoint change, so anything that reads them via `useFormUIState`
re-renders on the same tick as the rest of the form. Built-in consumers include
page navigation (see below) and field components that adjust their internal grid
from the same flags.

```{warning}
The four `at*` flags are **mutually exclusive bands**, not cumulative
thresholds. `atComputer` is false on a large monitor. For "computer width or
wider" — which matches how Semantic UI's `computer only` class behaves — test
`atComputer || atLargeScreen`, or compare `viewportTier`.
```

Custom layout and field components should prefer these flags over registering
another `matchMedia` listener. Import paths, return shapes, and examples are in
[Component developer API — Viewport](component-api.md#viewport).

(viewport-aware-page-navigation)=

### Viewport-aware page navigation

Pages can appear and disappear as the browser window is resized, and the form's
navigation adjusts to match **in real time** — no page reload. Two independent
mechanisms decide whether a page is part of the flow.

#### 1. Pages hidden by resource type

A page drops out of the flow entirely when its merged subsection list is empty
for the selected resource type. This is the placeholder-page mechanism described
in [Optional pages and resource types](#optional-pages-and-resource-types). Such
pages are absent from the stepper, the sidebar menu, the Back/Next sequence, and
the main column. If the depositor is _on_ such a page when they change the
resource type, the form moves them to the first remaining page and rewrites the
URL in place (no extra browser-history entry).

#### 2. Pages whose menu item is hidden by breakpoint

A `FormPage` accepts an optional **`menuItemClasses`** key. The string is
applied to the page's stepper step (`FormStepper`) and its sidebar menu item
(`FormSidebarPageMenu`) — **not** to the page content.

```python
{
    "section": "6",
    "label": _("Save & Publish"),
    "component": "FormPage",
    "menuItemClasses": "tablet mobile only",
    "subsections": [...],
},
```

When the class string hides the menu item at **computer width and above**, the
form treats that page as out of the flow at those widths and adapts the rest of
the navigation to match:

- **Back/Next skip it.** `FormPageNavigationBar` reads pre-resolved previous and
  next page ids, so at computer+ widths the buttons step over the hidden page to
  the nearest page that still has a menu item.
- **Direct links are redirected.** Loading `?page=6` at computer width lands the
  depositor on the nearest preceding page that _is_ visible, and the address bar
  is corrected with `replaceState`.
- **Resizing re-resolves everything.** Crossing the computer breakpoint in
  either direction recomputes the current, previous, and next pages. Widening
  moves the depositor off a now-hidden page; narrowing restores it as a
  Back/Next destination and as a direct-link target.
- **The mobile dropdown is the exception.** The page-title dropdown that
  `FormStepper` renders at mobile width deliberately lists _every_ page in the
  flow, including menu-hidden ones, so mobile navigation matches what the
  desktop sidebar offers.

```{warning}
This adaptation is triggered by **parsing the class string**, and the parser
recognizes one specific shape. A page is treated as hidden at computer width
only when `menuItemClasses`:

1. contains the token **`only`**, **and**
2. contains **no** `computer`, `large screen`, or `widescreen` token, **and**
3. contains **`mobile`** or **`tablet`**.

So `"tablet mobile only"` and `"mobile only"` work. **`"computer hidden"` does
not** — it hides the menu item visually, but Back/Next will still walk the
depositor onto a step with no visible menu entry. Use the `… only` form for any
page you want removed from the flow.
```

```{note}
"Computer width" here means the JavaScript constant
`SEMANTIC_UI_COMPUTER_BREAKPOINT_PX` (1280px), which must be kept in sync by
hand with the Less `@computerBreakpoint`. See
[The breakpoints these classes refer to](#the-breakpoints-these-classes-refer-to).
```

#### Choosing between the two

Use **resource-type placeholders** when a step is irrelevant to certain kinds of
work — a "Journal details" page that only journal articles need. Use
**`menuItemClasses`** when the same controls belong in a sidebar on wide screens
and on their own step on narrow ones; the next section works that pattern
through end to end.

### Worked example: shifting save/access/feedback between sidebar and page

Pattern: at computer and larger widths the submission/access/feedback components
live in the right sidebar; at tablet and mobile widths the right sidebar
collapses and the same components appear on a dedicated form page reachable from
the menu/stepper.

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

Add both objects to `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` (place
`_SAVE_AND_PUBLISH_PAGE` inside `FormPages.subsections`). At computer+ widths
the user sees the right sidebar as before; at tablet/mobile widths the sidebar
disappears and the user reaches the same controls via the new page entry.

Because `menuItemClasses` removes page 6 from the flow at computer+ widths, the
navigation stays coherent in both states: at tablet/mobile the Next button on
page 5 leads to page 6, while at computer+ page 5 is the last step and a link to
`?page=6` redirects to page 5 — where the same submission and access controls
are already on screen in the sidebar. Resizing the window across 1280px moves
the depositor between the two arrangements without losing form values. See
[Viewport-aware page navigation](#viewport-aware-page-navigation).

## CSS classes you can pass in `classnames`

`classnames` is the main styling lever in the layout config, and the strings you
will see in the shipped presets come from four different places. Knowing which
is which saves a lot of guesswork.

### Classes defined by this package

These are in the package's `deposit_form.less` and are safe to use from
`classnames`:

| Class                       | Put it on          | Effect                                                                                                                           |
| --------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **`prominent-field-label`** | A field or section | Renders the field's top-level label in the primary colour, bold, at 1.25em, so it reads as a heading rather than an input label. |
| **`stackable-tablet`**      | A `FormRow`        | Stacks the row's fields vertically at tablet width and below instead of keeping them side by side.                               |
| **`computer-only-strict`**  | Any component      | Visible only at 1280–1679px. See [The classes](#the-classes).                                                                    |

`invenio-form-section` is also a package class, but `FormSection` adds it
automatically — you do not need to pass it.

### Semantic UI built-ins

`basic` (a flat segment with no shadow or border), `equal width`, `column`,
`sixteen wide column` and the other `N wide` widths, plus all the responsive
visibility classes listed in
[CSS visibility classes](#css-visibility-classes-classnames).

```{tip}
When a component renders as a `Grid.Column` — `FormStepper`, `SpacerColumn`, and
custom column-rendering components — include **`column`** in `classnames` so
Semantic UI's column rules apply alongside whatever else you add.
```

### invenio-theme spacing utilities

invenio-theme generates a family of spacing helpers that work anywhere in the
form: `mt-0`…`mt-30`, `mb-*`, `pt-*`, `pb-*` in 5px steps, and the `rel-*`
variants (`rel-mt-1`…`rel-mt-10`, `rel-ml-*`, `rel-mr-*`, `rel-pb-*`) in `em`
steps. The shipped layouts use these freely, e.g. `"basic pt-0 mt-0"` to close
the gap between two stacked sections.

This package also defines the **`*-12`** step (`m-12`, `mt-12`, `mb-12`,
`ml-12`, `mr-12`, `p-12`, `pt-12`, `pb-12`, `pl-12`, `pr-12`), which stock
invenio-theme does not emit. Defaults are **10px** so they stay on the stock 5px
grid. Instances may remap them (KCWorks sets `*-12` to 0.75rem / 12px inside
`#rdm-deposit-form`).

```{warning}
An instance may **remap** the numeric helpers inside the deposit form. KCWorks,
for example, remaps them to a rem-based scale within `#rdm-deposit-form`, so
`pt-10` there is 0.5rem rather than 10px, and `pt-12` is 0.75rem rather than
this package's default 10px. The `rel-*` helpers are not remapped.
If spacing does not match what you expect, check your instance's form
overrides before assuming the helper is broken.
```

### Conventional markers with no styling

**`default-layout`** appears throughout the shipped presets and on every region
in some instance layouts, but **no stylesheet defines it**. It is a hook left in
place for instances that want to target the default arrangement from their own
CSS. Copying it does nothing on its own, and removing it from a layout you have
copied changes nothing visually.

## Changing layout by resource type

The `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE` config variable lets you change layout
elements based on the current resource type. Its keys are InvenioRDM resource
type names (from your instance's `resource_types` vocabulary). The values are
dictionaries describing how pages should be laid out for that resource type;
keys must correspond to the `section` ids of the `FormPage` components in your
common fields layout.

If a page is not included in the resource type dictionary, the default layout
from the common fields is used. If a page is included, the new page layout
**replaces** the default for that page.

Example: replace the entire page whose `section` is `"3"` with a single ISBN
field when the selected resource type is `"textDocument-book"`:

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

To re-use another resource type's page entry for the same FormPage `section` id,
set top-level `same_as` to that type's id. The form resolves the target page
first (chasing further `same_as` references along the way, with cycle
detection), then **shallow-merges** your entry on top.

Merge rules:

- Keys you set on your entry — `label`, `classnames`, and any other keys the
  page object supports — override the resolved base.
- **`subsections`** is the only key with special handling: omit it and the
  base's subsection list is inherited; include it and your list replaces the
  inherited one entirely (no item-level merging).
- The `same_as` key itself is stripped from the merged result.
- Cycles (`a → b → a`) are detected and resolve to the originating entry without
  recursion.

Example:

```python
MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = {
    "textDocument-monograph": {
        "2": {"same_as": "textDocument-book", "label": "Monograph details"},
    },
}
```

## Per-field modifications by resource type

Several config variables let you customize individual field widget props by
resource type without declaring a whole new page layout. They all share the same
shape:

```python
{
    "<resource-type-id>": {
        "<dot-separated-metadata-path>": <value>,
        ...
    },
    ...
}
```

Resource types not listed in the map fall back to the props the layout config
provides; field paths not listed for the current type are unaffected. The
`FieldComponentWrapper` reads each map at render time and overrides the matching
prop on the widget it wraps.

### Display and metadata modifications (apply to all built-in widgets)

| Variable                                             | Overrides                                                                  | Value type                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------- |
| **`MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS`**       | `label`                                                                    | string (or `lazy_gettext(...)`) |
| **`MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS`** | `placeholder`                                                              | string                          |
| **`MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS`** | `description`                                                              | string                          |
| **`MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS`**        | `labelIcon` (FontAwesome name)                                             | string                          |
| **`MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS`**   | `helpText`                                                                 | string                          |
| **`MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS`**     | `required` flag on the widget (does **not** affect server-side validation) | bool                            |

Example — change the title field's icon by resource type:

```python
MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {
    "audio": {"metadata.title": "headphones"},
    "dataset": {"metadata.title": "table"},
    "image-photo": {"metadata.title": "camera"},
    "presentation": {"metadata.title": "microphone"},
}
```

For custom fields, the field path uses the InvenioRDM custom-field syntax (e.g.
`"custom_fields.journal:journal.title"`).

### Field value modifications (only effective in custom widgets)

The following two variables are wired all the way through to each
`FieldComponentWrapper`, but **none of the package's built-in widgets currently
consume them**. They are forwarded to the inner widget as the props named in the
table; a custom widget you write can read those props and use them.

| Variable                                         | Prop received by widget        | Intended use                                                         |
| ------------------------------------------------ | ------------------------------ | -------------------------------------------------------------------- |
| **`MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES`**  | `defaultFieldValue` (singular) | Pre-fill an empty field with a default.                              |
| **`MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES`** | `priorityFieldValues`          | Display value(s) the widget should surface as preferred suggestions. |

If you set these expecting them to affect the stock title/abstract/etc. widgets,
they will not — see [Adding your own components](extending.md) for how to write
a widget that reads these props.

## Other configuration flags

These flags toggle global form behaviour. None of them require asset rebuilds at
config-change time _except_ `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION` (see
note below).

### `MODULAR_DEPOSIT_FORM_USE_CLIENT_VALIDATION`

Default: `True`.

When `True`, the form loads your `validator.js` (see [Validation](validation.md)
and [Adding your own components](extending.md#what-goes-in-each-extension-file))
and runs the resulting Yup schema on every change. When `False`, no client
schema is loaded; field errors only appear after submit returns server-side
validation errors.

```{note}
Changing this value requires rebuilding assets (`invenio webpack build`) — the choice is baked in at build time by `webpack_extras.get_validator_path()`.
```

### `MODULAR_DEPOSIT_FORM_USE_CONFIRM_MODAL`

Default: `False`.

When `True`, attempting to navigate to another page in a multi-page form while
the current page has unresolved errors opens a confirmation modal asking the
user to either fix the errors or proceed. When `False` (the default), the errors
are still flagged on the leaving page — in the navigation badges and the form
feedback summary — but no modal interrupts navigation.

### `MODULAR_DEPOSIT_FORM_SHOW_COMMUNITY_BANNER_AT_TOP`

Default: `True`.

When `True`, a full-width community banner (the stock InvenioRDM
`CommunityHeader`) is rendered above the form title whenever the deposit state
would normally show it (community selected or selectable). Set to `False` to
suppress it; the selected community will then be shown next to the form title
instead.

### `MODULAR_DEPOSIT_FORM_PRIORITY_RESOURCE_TYPES`

Default:
`("publication-article", "publication-peerreview", "publication-book", "publication-section", "lesson")`.

Ordered tuple of resource type ids that the `ResourceTypeSelectorComponent`
exposes as shortcut buttons (in addition to the always-present "Other…" control
that opens the full vocabulary select).

```{important}
Only the **first six** ids in the tuple are ever rendered as buttons. The
number depends on the current viewport width. Additional ids are ignored. List
your most-specific or highest-traffic types first.
```

Ids must come from your instance's `resource_types` vocabulary.

### `MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES`

Default: a `doi` entry with KC-flavoured labels and help text (see
`invenio_modular_deposit_form/config/config.py`).

Maps PID scheme ids to dictionaries of UI-string overrides that are
**shallow-merged into the matching entry of stock `RDM_PERSISTENT_IDENTIFIERS`**
before the deposit form mounts. Any keys you set replace the corresponding keys
on the PID config; keys you omit keep their stock value.

```{note}
Only the **`doi`** scheme is currently honoured by the merge logic. Entries for other schemes are ignored.
```

Keys most commonly overridden:

| Key                     | Effect                                                          |
| ----------------------- | --------------------------------------------------------------- |
| `field_label`           | The visible field label (e.g. "Digital Object Identifier").     |
| `pid_placeholder`       | Input placeholder text.                                         |
| `btn_label_get_pid`     | Label for the "reserve a PID" button.                           |
| `btn_label_discard_pid` | Label for the discard-reserved-PID button.                      |
| `managed_help_text`     | Help text shown when the instance is configured to manage DOIs. |
| `reserved_help_text`    | Help text shown after a DOI has been reserved.                  |
| `unmanaged_help_text`   | Help text shown when DOIs are not managed by this instance.     |

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

The package ships its own InvenioRDM custom-field defaults (codemeta, journal,
imprint, meeting, thesis) and the matching UI definitions, applied to the
standard Flask config keys:

- **`RDM_NAMESPACES`** — namespace prefixes (`codemeta`, `journal`, `imprint`,
  `meeting`, `thesis`).
- **`RDM_CUSTOM_FIELDS`** — backend custom-field declarations (with
  `VocabularyCF` instances replaced by a hardened subclass that won't 500 the
  form when a vocabulary is missing — see `SafeVocabularyCF`).
- **`RDM_CUSTOM_FIELDS_UI`** — UI definitions consumed by
  `MODULAR_DEPOSIT_FORM_COMMON_FIELDS` and the stock InvenioRDM custom-field
  rendering.

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

InvenioRDM v14 adds optional deposit form components that are **not** included
in the default layout or component registry, so that this package builds and
runs against invenio-app-rdm v13 (where those components do not exist).

If your instance runs **InvenioRDM v14** and you want to enable them, you can
register them via the component registry and add them to your layout.

**Components**

- **RecordDeletionComponent** — Request deletion of a published record. Shown in
  the submit-actions region (e.g. next to the delete button) when the record is
  published. Requires backend config for record deletion (e.g.
  `config.record_deletion` with `enabled`) and vocabulary
  `vocabularies.metadata.deletion_request_removal_reasons`.
- **FileModificationUntilComponent** — Shows "Unlocked, X days to publish
  changes" in the Files section when `config.file_modification` is set. Place it
  as a sibling before the file uploader in the Files page content.

**How to enable**

1. **Register the components** — In your instance's `componentsRegistry.js` (the
   directory you expose via the
   `invenio_modular_deposit_form.components_registry` entry point), import the
   wrappers from
   `@js/invenio_modular_deposit_form/field_components/v14_components` and add
   them to the registry as `RecordDeletionComponent` and
   `FileModificationUntilComponent` (value `[RecordDeletionComponent, []]` and
   `[FileModificationUntilComponent, []]`). This file is only loaded when your
   instance imports it, so the app-rdm v14 imports inside it do not affect the
   package build when building against v13.

2. **Add them to the layout** — To show RecordDeletion in the submit area, add a
   section that references `RecordDeletionComponent` in the same region as
   `SubmissionComponent` (e.g. in `FormRightSidebar` subsections). To show
   FileModificationUntil in the Files section, add it as a subsection of the
   Files page (e.g. before or after the file upload section). The default
   package layout does not include these sections; copy the layout from the
   package's `config.py` and add the v14 sections where you want them.

See [Adding your own React components](extending.md) for how to register the
`components_registry` entry point.
