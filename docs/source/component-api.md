# Component developer API

This page is the reference for the hooks, contexts, and state that the package
exposes to people writing their own React components for the deposit form. If
you are configuring the form from `invenio.cfg` rather than writing JavaScript,
you want [Configuration](configuration.md) instead; if you are looking for how
to *register* a component you have written, see [Extending](extending.md).

Everything on this page is importable from
`@js/invenio_modular_deposit_form/…`, which is available to your instance's
assets once the package is installed.

```{note}
This is the package's supported surface for extenders. Other internals are
reachable — nothing is hidden — but they may change without notice.
```

## Wrappers

### `FieldComponentWrapper`

```javascript
import { FieldComponentWrapper } from "@js/invenio_modular_deposit_form/field_components/FieldComponentWrapper";
```

Wraps a field widget so it picks up the label, icon, placeholder, description,
and help-text overrides for the current resource type, receives the width
classes from the layout config, and exposes an `Overridable` slot. Use it
whenever you write a component that represents a metadata field, so your field
behaves like the built-in ones.

It consumes (does not forward) the layout width keys `width`, `mobile`,
`tablet`, `computer`, `largeScreen`, and `widescreen`, turning them into
Semantic UI classes on the wrapper element. Everything else you pass is cloned
onto the child widget.

### `CustomField`

```javascript
import { CustomField } from "@js/invenio_modular_deposit_form/field_components/CustomField";
```

Renders an InvenioRDM custom field by name, resolving its widget and props from
`RDM_CUSTOM_FIELDS_UI`. See
[Handling custom fields](extending.md#handling-custom-fields) for a full
walkthrough.

## The form UI state context

### `useFormUIState()`

```javascript
import { useFormUIState, FormUIStateContext } from "@js/invenio_modular_deposit_form/FormUIStateManager";
```

The main entry point for custom **layout** components. Throws if called outside
`FormUIStateManager`, so it is safe to destructure without guards.

Prefer reading from this context over re-deriving the same values from Redux or
Formik yourself — the context is what keeps the navigation components, the page
body, and the feedback summary consistent with each other.

It returns:

| Key                                              | Type       | What it is                                                                             |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------- |
| `formUIState`                                    | object     | The whole UI state object; see [the field reference](#the-formuistate-object) below.   |
| `formUIDispatch`                                 | function   | Dispatch for the UI reducer. See [Dispatching](#dispatching-your-own-updates).         |
| `handleFormPageChange`                           | function   | `(event, { value }) => void` — navigate to the page whose id is `value`.               |
| `handlePageChangeCancel` / `handlePageChangeConfirm` | function | Resolve the "leave a page with errors?" confirmation.                                  |
| `confirmingPageChange`                           | boolean    | Whether that confirmation is currently open.                                           |
| `confirmModalRef`                                | ref        | Focus target for the confirmation modal.                                               |
| `recoveryAsked`                                  | boolean    | Whether the autosave restore prompt has been answered this session.                    |
| `handleRecoveryAsked`                            | function   | Mark the restore prompt as answered.                                                   |
| `storageDataPresent`                             | boolean    | Whether unsaved values are currently held in local storage.                            |
| `handleStorageData`                              | function   | Apply or discard the locally stored values.                                            |
| `pageTargetRef` / `pageTargetRefCallback`        | ref / function | Attach to the element that marks the end of the page body.                         |
| `pageTargetInViewport`                           | boolean    | Whether that element is on screen — used to switch the footer nav bar between fixed and static. |

(the-formuistate-object)=

### The `formUIState` object

#### Pages and navigation

| Field                           | Type              | Notes                                                                                             |
| ------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| `currentFormPage`               | string            | Id (the layout `section`) of the page being shown.                                                |
| `previousFormPage`              | string \| null    | Viewport-aware; `null` on the first page.                                                         |
| `nextFormPage`                  | string \| null    | Viewport-aware; `null` on the last page.                                                          |
| `resolvedFormPages`             | array             | Every merged page for the current resource type, in config order, **including empty ones**.       |
| `visibleFormPages`              | array             | The subset with non-empty subsections. This is what the stepper, sidebar menu, and page body use. |
| `pageIdsHiddenAtComputer`       | string[]          | Pages whose menu item is hidden at computer width and above, derived from `menuItemClasses`.      |
| `computerVisibleFallbackByPage` | object            | Maps each such page id to the page a wide viewport should land on instead.                        |
| `currentFormPageFields`         | object            | `{ [pageId]: string[] }` — Formik field paths owned by each page.                                 |

```{tip}
Iterate `visibleFormPages`, not `resolvedFormPages`, unless you specifically
need the placeholder pages. See
[Viewport-aware page navigation](configuration.md#viewport-aware-page-navigation)
for what makes a page visible.
```

#### Viewport

| Field                                                  | Type    | Notes                                                        |
| ------------------------------------------------------ | ------- | ---------------------------------------------------------------- |
| `atMobile`, `atTablet`, `atComputer`, `atLargeScreen`  | boolean | Which breakpoint band the viewport is in.                    |
| `viewportTier`                                         | number  | Index of that band in ascending width order, `0`–`3`.        |
| `viewportDirection`                                    | string  | `"widen"`, `"shrink"`, or `"none"` for the last band change. |

```{warning}
**The four flags are mutually exclusive bands, not cumulative thresholds.**
`atComputer` is true only between the computer and large screen breakpoints, so
it is **false** on a large monitor. If you want "computer width or wider" —
which is usually what you want, because it matches how the Semantic UI
`computer only` class behaves — test `atComputer || atLargeScreen`, or compare
`viewportTier` against the tier you care about.
```

These are maintained by `matchMedia` listeners in `FormUIStateManager` and are
seeded synchronously on mount, so they are correct on first render rather than
after a resize. They are the reason the form's navigation re-resolves live as
the window is resized, and they are the recommended way for your own components
to react to viewport changes: prefer reading them over registering another
`matchMedia` listener, so your component changes on the same tick as the rest of
the form.

`viewportDirection` exists for components that need to behave differently
depending on which way the viewport moved — for example, collapsing a panel when
shrinking but not re-expanding it when widening.

#### Resource type

| Field                    | Type   | Notes                                                                  |
| ------------------------ | ------ | ---------------------------------------------------------------------- |
| `currentResourceType`    | string | The selected resource type id.                                         |
| `currentTypePageConfigs` | object | That type's per-page entries from `MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE`. |

#### Errors

| Field                          | Type    | Notes                                                                           |
| ------------------------------ | ------- | --------------------------------------------------------------------------------- |
| `sectionErrorsFlagged`         | array   | Errors that should be **shown** — touched fields plus initial-flag cases.       |
| `sectionErrorsAll`             | array   | Every error, including on fields the user has not touched yet.                  |
| `hasClientValidationErrors`    | boolean | Any record-field error; used to disable Publish.                                |
| `hasDraftBlockingClientErrors` | boolean | Errors severe enough to block saving a draft; used to disable Save.             |

Both error lists hold entries shaped
`{ page, section, error_fields, info_fields, warning_fields }`, where each
`*_fields` value is an array of Formik field paths.

Use `sectionErrorsFlagged` for anything the depositor sees, and
`sectionErrorsAll` only when you need to know about errors before the user has
interacted with a field.

### Error selectors

Rather than walking the two error arrays yourself, use the selectors the
built-in navigation components use. Each takes the whole `formUIState`:

```javascript
import {
  getPageFlaggedErrorCounts,
  getPagesWithFlaggedErrors,
  getPagesWithErrors,
  getSectionErrorsByPage,
  getSectionErrorsBySectionKey,
} from "@js/invenio_modular_deposit_form/helpers/formUIStateReducer";
```

| Selector                        | Returns                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `getPageFlaggedErrorCounts`     | `{ [pageId]: { errors, warnings, info, severity } }` — what the nav badges render.       |
| `getPagesWithFlaggedErrors`     | `{ [pageId]: string[] }` of shown-error field paths.                                     |
| `getPagesWithErrors`            | `{ [pageId]: string[] }` of all error field paths, touched or not.                       |
| `getSectionErrorsByPage`        | `{ [pageId]: sectionEntry[] }`.                                                          |
| `getSectionErrorsBySectionKey`  | `{ [sectionKey]: sectionEntry }`.                                                        |

`severity` is `"error"`, `"warning"`, `"info"`, or `null`, matching the
`has-error` / `has-warning` / `has-info` classes on nav items.

Wrap selector calls in `useMemo` keyed on `formUIState`, as the built-in
components do — they rebuild their result on every call.

(dispatching-your-own-updates)=

### Dispatching your own updates

`formUIDispatch` and the `FORM_UI_ACTION` constants are exposed, but **treat
them as read-mostly**. The page, viewport, and error fields are all owned by
hooks inside `FormUIStateManager`, and dispatching them yourself will be
overwritten on the next resize, resource-type change, or validation pass. Change
the page with `handleFormPageChange` rather than by dispatching
`SET_CURRENT_FORM_PAGE`.

## Hooks

| Hook                          | Signature                                     | Use it to                                                                                                  |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `useCurrentFieldMods`         | `() => mods`                                  | Read the `MODULAR_DEPOSIT_FORM_*_MODIFICATIONS` values for the current resource type.                      |
| `useCurrentResourceTypeFields` | `(formik, dispatch, fieldsByType, registry)` | Resolve the page list for the selected type. Called once by the form; you rarely need it.                  |
| `useCustomFieldWidget`        | `(fieldName, componentProps) => result`       | Resolve one custom field's widget and props. Use when composing several custom fields in one component.    |
| `useFormPageNavigation`       | `(formUIState, dispatch, …)`                  | Internal engine behind page navigation. Consume its output via `useFormUIState`, don't call it directly.   |
| `useFormSubmissionTransformer` | `() => transform`                            | Apply the registered submit-time transformation chain to a values object.                                  |
| `useIsInViewport`             | `(element) => boolean`                        | Track whether a DOM element is on screen.                                                                  |
| `useLocalStorageRecovery`     | `(userProfile, currentFormPage) => state`     | Internal autosave/restore engine. Read its results from `useFormUIState` instead.                          |
| `useStickyFooterOverlapFix`   | `() => void`                                  | Stop a sticky footer from covering the bottom of the form.                                                 |

All hooks live under `@js/invenio_modular_deposit_form/hooks/<name>`, except
`useFormUIState`, which is exported from `FormUIStateManager`.

### `useCurrentFieldMods`

Returns the modification maps already narrowed to the current resource type, so
each value is either an object keyed by field path or `undefined`:

`labelMods`, `iconMods`, `helpTextMods`, `placeholderMods`, `descriptionMods`,
`defaultFieldValues`, `priorityFieldValues`, `extraRequiredFields`

If you wrap your widget in `FieldComponentWrapper`, the first five are applied
for you; call this hook directly only when you need to read them yourself — for
instance to honour `defaultFieldValues` or `priorityFieldValues`, which no
built-in widget currently consumes.

### `useCustomFieldWidget`

```javascript
const { Widget, fieldPath, props, loading } = useCustomFieldWidget(
  "journal:journal.title",
  componentProps
);
```

Looks the field up by name across every section of `RDM_CUSTOM_FIELDS_UI`, so
the section structure in your config does not affect resolution.

## Replacement input widgets

```javascript
import {
  ArrayField,
  AutocompleteDropdown,
  Dropdown,
  Input,
  MultiInput,
  RemoteSelectField,
  SelectField,
  TextArea,
  TextField,
} from "@js/invenio_modular_deposit_form/replacement_components";
```

Prefer these over the stock `react-invenio-forms` equivalents when writing a
replacement widget, so that touched-aware error display stays consistent across
the form. See
[Replacement field components](replacement_field_components.md) for how they
differ from upstream.

## Constants

```javascript
import {
  SEMANTIC_UI_MOBILE_BREAKPOINT_PX,
  SEMANTIC_UI_COMPUTER_BREAKPOINT_PX,
  SEMANTIC_UI_LARGE_SCREEN_BREAKPOINT_PX,
  SEVERITIES,
  SIDEBAR_DEFAULTS_WIDTHS,
} from "@js/invenio_modular_deposit_form/constants";
```

The three breakpoint constants mirror the Less theme variables and are what the
viewport flags are computed from. If your instance overrides the theme
breakpoints, these must be changed to match — see
[the breakpoint table](configuration.md#the-breakpoints-these-classes-refer-to).

## Writing a custom layout component

Beyond reading state, a custom layout component has two obligations:

- **Forward `children` unchanged.** The package resolves the child section tree
  from the layout config and passes the rendered elements down; a component that
  drops `children` silently empties everything configured beneath it.
- **Accept `classnames`** and apply it to your outermost element, so instances
  can style and responsively hide your component the same way they do the
  built-ins.

Register the finished component in your instance's `componentsRegistry.js` and
reference it by name from the layout config. See
[Custom layout components](extending.md#custom-layout-components).
