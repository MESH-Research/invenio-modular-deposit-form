# Architecture

## Leveraging InvenioRDM customization tools

This extension integrates as cleanly as possible with InvenioRDM's default structures. It:

- uses core InvenioRDM React components wherever possible
- works with InvenioRDM's custom fields API
- continues to allow overriding of React components via the Overridable API

## Custom form template

The package sets `APP_RDM_DEPOSIT_FORM_TEMPLATE` to point to a custom Jinja template: `invenio_modular_deposit_form/deposit.html`. That template renders the form React components with the layout and validation layer via inclusion of a custom `index.js`. Form values are passed into the React app using data props (as normal), adding new form config variables.

## Layout config injected into the form

All of the package's form customization is merged into the value of the `deposits-config` hidden input, from where it is picked up by the React app in `index.js`. In the template, a macro merges the form layout settings into the stock InvenioRDM `forms_config` dictionary and the result is assigned to the hidden input. The merged configuration is then passed into the Redux store's `config` property and is accessible to any form components. This provides the single source of truth for layout and field modifications.

The deposit template also merges in the value of two more Jinja filters:

- **`previewable_extensions`** — Returns the list of file extensions that can be previewed (from `invenio_previewer` when available). Used in `data-previewable-extensions`. If the previewer isn't available, returns an empty list.
- **`current_user_profile_dict`** — Returns the current user's profile as a dict (`id` plus any fields from `ACCOUNTS_USER_PROFILE_SCHEMA`). Used for identifying the user in the local-storage autosave of unsubmitted form values.

## Wrapper component provides validation schema

The template's JavaScript entry point (`index.js`) renders a custom `RDMDepositForm` component. This wraps InvenioRDM's standard `DepositFormApp` and lets it handle the Formik form context and API calls. The new `RDMDepositForm` passes in an optional client-side `validate` / `validationSchema` from the instance's `validator.js` (provided via a dedicated entry point or webpack alias).

## Layout and UI-state layer

Form state, submission, and server-side validation continue to be handled by InvenioRDM's stock components. Between those upper-level components and the individual field components, the extension inserts a layer to handle component layout and manage dynamic UI state.

**Assembles field components** — The stock `DepositFormApp` component is rendered with a new single child that provides the layout layer: `FormLayoutContainer`. This component receives the form layout values as props and uses them to dynamically construct the form, arranging the individual form field widget components. The layout can be an arrangement of stock InvenioRDM form components, custom field components, or entirely new custom widgets, all compiled into a single `componentsRegistry` from which the layout config can draw. Because it sits *inside* the stock form API components, `FormLayoutContainer` and its children have access to the Formik form state and the Redux context (including the merged form layout settings).

**Maintains form UI state** — The form has a dynamic UI display state effected by: the currently selected resource type; the currently selected page (if a multi-page layout is used); and the overall error state (combining client-side validation errors and server-side errors). The `FormLayoutContainer` component shares the current state with field components via a React context: `FormUIStateContext`.

**Layout layer selects field components from a registry** — FormLayoutContainer derives the step list from `commonFields`. For the current step it resolves which sections to show: it looks up `fieldsByType[currentResourceType]` (with `same_as` resolved to another type's config) and, per page, either uses that type-specific list of sections or falls back to the common subsections. That resolved list is passed to FormPage, which renders each section by looking up the section's `component` name in the **component registry** and rendering the corresponding React component with section props. Field-level customization (labels, placeholders, help, etc.) is applied via `currentFieldMods` from the `*_MODIFICATIONS` and `*_FIELD_VALUES` / `EXTRA_REQUIRED_FIELDS` configs, exposed via FormUIStateContext and applied in FieldComponentWrapper. Autosave and recovery are handled in the form flow; **useLocalStorageRecovery** (and the recovery modal) let the user restore data when returning to the form. Custom field slots are integrated by registering components and their field paths in the same **componentsRegistry** and, where needed, using the **CustomField** component (which reads from the InvenioRDM custom field UI config in `config.custom_fields.ui`).

## Global form data handling

All components have access to a `record` prop that includes the metadata for the record being currently edited (if a draft already exists).

The extension replaces the template `deposit.html`. That template has access to template variables from the view function in `invenio_app_rdm.records_ui.views.deposits`, including:

- **forms_config** (dict) — produced by the helper function `get_form_config` in the same file as the view function
- **searchbar_config**, **record** (dict), **files**, **preselectedCommunity**, **permissions**

The `forms_config` dictionary includes keys such as: **vocabularies**, **autocomplete_names**, **current_locale**, **default_locale**, **pids**, **quota**, **decimal_size_display**, **links**, **user_communities_memberships**, **custom_fields**, **publish_modal_extra**, **createUrl**, **apiUrl**.

The `pids` variable is a list with a configuration dictionary for each enabled PID scheme (at present only "doi" is supported). This extension will read a variable named **INVENIO_MODULAR_DEPOSIT_FORM_PIDS_OVERRIDES** and, if it has a key `"doi"`, use any values provided there to override the default PID config values with the same key.

## Form state management

- **FormValuesContext** (in `js/RDMDepositForm`) — a React context that hoists the Formik field variables up to the whole-form level.

## Core components not yet exposed

Some core components are not yet exposed (and must be duplicated) if you need to reference them outside the package. See the source and override guide for the current set of Overridable slots and component names.
