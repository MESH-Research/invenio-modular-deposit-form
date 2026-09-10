<!-- Copyright (C) 2023-2024 Mesh Research.

Invenio Modular Deposit Form is free software; you can redistribute it
and/or modify it under the terms of the MIT License; see LICENSE file for
more details. -->

# Changes

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
