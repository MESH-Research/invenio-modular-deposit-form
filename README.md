# Invenio Modular Deposit Form

Version 0.1.0.dev1

**ALPHA**

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
                "new_version",  # when editing existing records only
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

## Rationale

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

If you wish to enable client-side form validation, you can provide a validator in your instance folder in a file called `validator.js` this should be placed in the assets subfolder you have created in a location like `site/my_instance_name/assets/semantic-ui/js/invenio_modular_deposit_form_extras`.

This validator.js file may export one of two objects:

validationSchema: This should be a `yup` schema. If provided, it will be passed to the Formik form validation handler via the `validationSchema` property, which will handle the validation and update the form's `errors` object as necessary.

validate: This can be a custom validation function which will be passed to the Formik form `validate` property.

If neither of these objects is exported in a file with that name, the client-side validation will simply be deactivated.

*FIXME: at present this requires a patch to DepositFormApp and DepositBootstrap to pass the `validate` and `validationSchema` props.*

**TextField components are aware not just of their own `touched` state, but also the `touched` state of parents**

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

### The componentsMap object

The `componentsMap` object must have the following structure:

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

Normally, if you want to override a React component this should be done using the `overridable` API. This extension does allow for a second method, however. If you include a component definition in your componentsMap.js file that duplicates the key of a build-in component, your definition will supersede the built-in one. This offers a conventient way to *change the metadata fields handled by a component*.

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

- By default the imprint:imprint.pages field is used for *total pages* in a publication,
while the journal:journal.pages field is used for *page numbers in a larger work*. So the
BookSectionPages component uses the journal:journal.pages field. If this is not how these
fields are interpreted in your InvenioRDM schema, you may override this component.

## Form state management

- FormValuesContext (in js/RDMDepositForm): a new React context API context that hoists the Formik field variables up to the whole-form level

## Core components that are not yet exposed (and must be duplicated)
