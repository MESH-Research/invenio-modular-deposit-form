<!-- Copyright (C) 2023-2024 Mesh Research.

Invenio Modular Deposit Form is free software; you can redistribute it
and/or modify it under the terms of the MIT License; see LICENSE file for
more details. -->

# Changes

## Unreleased

- Files / Uppy: warn before leaving a form page when files are staged in the
  Dashboard but the upload button has not been clicked
  (`MODULAR_DEPOSIT_FORM_USE_UPPY_INCOMPLETE_WARNING`, default True). Registers
  `FileUploaderAreaWithUppyWatch` only when that flag is on and the instance has
  not already overridden the file-uploader area slot. Separate from the
  page-error confirm modal (`MODULAR_DEPOSIT_FORM_USE_CONFIRM_MODAL`, default
  False)
- Layout / packaging: move `replacement_components` to
  `field_components/patched` and rename its nested field forks folder
  to `rdm_fields` (import paths updated throughout); nest `ShareDraftButton`
  under `rdm_fields/` with `DepositShareModal` / `depositShareRecord` in
  `rdm_fields/share_components/`; move the deposit app shell (store, reducer,
  `DepositFormApp`, bootstrap) out to `patched_rdm_core/` beside
  `field_components/`; move `utils.js` into `helpers/`
- Hidden fields notices (footer): warn when the current resource type hides
  fields that still have errors or non-empty values on this page, with
  switch-to-type suggestions (`HiddenFieldsNotices` / `HiddenFieldsBanner`,
  `hiddenSectionErrors` helpers + tests); default / alternate / Zenodo layouts
  mount these under `StickyFooter`
- Layout: new `StickyFooter` container for nested footer subsections (notices +
  nav); `FormPageNavigationBar` can render without its own column when nested
  (`asColumn: false`); footer region respects spacer columns; footer drop
  shadow fix
- Sharing: share modal no longer crashes / strips settings on new drafts
  - Required wrapping of some upstream behaviour to better integrate modal form
    with our Formik (DepositShareModal, ShareDraftButton, depositShareRecord +
    tests)
- Local recovery: no longer prompts for recovery if a user has just
  saved/published or made no changes to an existing draft; cleaner detection of
  unsaved changes; preserve `files.count` in Formik so recovery equality checks
  do not false-trigger
- Resource type selector: better responsive widescreen shortcuts; z-index and
  styling improvements
- Layout / mobile:
  - sticky footer behaviour and mobile width fixed;
  - layout improvements to form rows, accordion headers, additional titles;
  - better responsive layout for DnD array fields;
  - more mobile-friendly recovery modal
- Submission / access: horizontal components updated for main-column layout; no
  longer import KCWorks overrides directly
- Input controls:
  - less redundant markup (SelectField, TextField, TextArea, etc.);
  - RemoteSelect / SelectField option-filtering fixes;
  - stop forwarding React-only props to DOM; PropTypes / warning cleanups
    (TextField and related)
  - RichInputField: local-controlled editor content with debounced Formik sync
    (default 2.5s; flush on blur / unmount / pagehide) so local-storage
    recovery sees mid-edit rich text without per-keystroke form updates
    (`formikSyncDebounceMs` prop)
- Form feedback: layout class tweaks; FormFeedbackSummary link-button markup
  cleanup (disabled count-badge experiment removed)
- Field labels: expanded `readableFieldLabels` for journal / imprint / meeting /
  thesis / code custom fields; `getReadableFieldLabel` walks ancestors
- Access / DOI components: optional empty label for AccessRights; safer empty
  `optionalDOItransitions` object for DOI field
- Build / packaging:
  - pnpm/corepack CI fixes; pinned pnpm version hash;
  - bump-my-version for release number management;
  - docs build: drop unnecessary `__version__` import
- Compatibility: remaining KCWorks-specific blockers removed so a clean
  InvenioRDM install works again
- Chore: move ClientValidationMetaContext into validation folder; minor reorgs
- Testing: utils.test.js cleanup; mock invenio-rdm-records in Jest; add
  semantic-ui-react to package.json for tests; hiddenSectionErrors suite

## Version 0.4.0 (2026-09-09)

### Features and redesign

- More layout customizationn options
  - Added header, footer, and sidebar layout regions; sticky sidebars; hide
    empty pages by resource type; per-type page labels; configurable sidebar
    menu label
  - Added collapsible section option and configurable top communities
    banner/in-page component
  - Added entry-point as a customization mechanism for validators and components
    registry
- New ORCID API client for creatibutors names typeahead
  - combined live queries with local Names typeahead search
- responsive layout improvements
  - Added mobile version of top stepper
  - move save/publish to the final page on tablet/mobile (default layout)
  - new central tracking of viewport changes in form ui state
  - responsive modifications to resource type selector
  - etc.
- Overhauled client-side validation
  - better handling of EDTF dates
  - better handling of DOI/PIDs field
  - validation of imprint fields and other built-in custom fields
  - etc.  
    identifier schemes; draft- vs publish-blocking errors)
- Overhauled FormFeedback / error navigation
  - reworked page/section error links
  - logic improvements to FormErrorManager
  - separated action status toasts from validation messages
  - etc.
- Improved enabling/disabling behaviour for submission buttons
- Improved accessibility
  - added keyboard nav for accordion components
  - improved focus management on several components (esp. with modals)
  - improved aria properties and screen reader-friendly html for PID and
    resource-type components
  - etc.
- New field components
  - Added forked upstream field components to facilitate a11y, validation, and
    theming improvements
    - titles, descriptions, creatibutors, subjects, related works, dates,
      identifiers, languages, PIDs, licenses, funding, ArrayField, and related
      input widgets
  - Added alternate field variants (flat creatibutors, horizontal
    submission/access, funding, licenses, and others)
  - Added missing InvenioRDM v13/v14 field components; updated template/config
    for v13/v14
- Improved error handling
  - More graceful CSRF error handling on DOI reservation and submission
  - Fixed DOI reservation 403 handling; PID reserve/links after draft save
- Broad docs overhaul
- Many other bug fixes and UX tweaks

## Version 0.3.4-dev0 (2025-09-10)

- Added new message to upload form for collection publication review

## Version 0.3.3-dev1 (2025-01-09)

- Fixed bug in search results sort order in community selection modal for upload
  form (original fix only worked in detail page)

## Version 0.3.1-dev0 (2024-12-10)

- Fixed bug in search results sort order in community selection modal
- Added handling for '/' in community search query string

## Version 0.3.0-dev0 (2024-12-06)

- Added proper messages to collections widget for published records
- Added clearer titles to form when editing an existing record or creating a new
  version
- Changed default publisher from "unknown" to "Knowledge Commons"

## Version 0.1.0

- Initial public release.
