# Using Invenio-Modular-Deposit-Form

To add the package's functionality to your own instance's upload form, simply
[install the package](./installation.md) in your InvenioRDM instance, rebuild
the front-end assets using `invenio-cli assets build`, and restart the instance.
If you have not enabled the built-in invenio-rdm-records custom fields and wish
to use them in your layout, you will also need to run `invenio rdm-records
custom-fields init`.

## Initial Defaults

When you have first installed the extension and visit your deposit form, you
will see the default configuration active. (The default config is defined in the
package file `invenio_modular_deposit_form/config/default.py`.) This default
setup includes:

### The default multi-page form layout

The form will be laid out with a left-hand sidebar menu and right-hand sidebar
with the form save and visibility widgets. In the middle column you will see the
current page's field inputs. A sticky footer bar includes forward/backward
form page navigation buttons as well as a message when form values are backed up
locally.

The pages follow the section divisions in the stock InvenioRDM deposit form, one
form page per section. If your instance has activated the built-in
invenio-rdm-records custom fields, these fields will appear on an extra form
page that is visible only when the relevant resource type is selected.

Changing the resource type will also produce other small changes to field
properties, primarily to the field labels. E.g., when you change the resource
type to `publication-journal`, the field label for `metadata.title` will change
to "Journal Title".

This layout is responsive. At tablet widths the left-hand menu sidebar
disappears and is replaced by a stepper component above the form pages. The
right-hand sidebar (with submission and access widgets) will move to the bottom
and be visible below the fields for each form page.

### Client-side validation active

When you enter an invalid value in a form field and then move away--either with
`tab` or with a mouse click--an error notification will immediately appear on
the field widget. Additionally, the sidebar menu (or top stepper) item for the
page with the error will be highlighted in pink, and a small red badge will
display the current number of errors on that page. An error feedback message
will also appear in the right sidebar above the submission widget, listing
fields with errors and providing links that jump to the page and section for
each error.

The default validation schema mirrors back-end (service layer) InvenioRDM
validation. It includes alerts if required fields remain empty, alerts for
invalid date formats, alerts for invalid identifiers (e.g., invalid URL or DOI
identifiers), and other field-specific constraints (like constraints on title
length). This picks up your instance's settings for things like allowed
identifier schemes.

Where appropriate, the default schema also includes validation for built-in
custom fields (journal, imprint, thesis, meeting, codemeta). Invalid ISBN, ISSN,
and URL identifiers (among others) are flagged.

### Autosave in local browser storage active

    - A note displayed in the navigation footer when values are stored locally.
    - A modal message will ask to restore the backed-up values when refreshing
      the browser or returning to the form (when autosaved values have not been
      saved to the back-end yet).

### Modal warning messages on page change _disabled_

## Customizing the form

### Alternate pre-built form layouts

The 

### Customizing the form layout

### Customizing the validation schema

### Customizing form adaptations to resource types
