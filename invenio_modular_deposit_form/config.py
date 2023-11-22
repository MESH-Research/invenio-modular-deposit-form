# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""


INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS = {
    "1": [
        "previously_published",
        "doi",
        "resource_type",
        "combined_titles",
        "combined_dates",
        "abstract",
    ],
    "2": ["communities", "creators", "contributors", "ai", "funding"],
    "3": ["language", "subjects_keywords", "content_warning"],
    "4": ["alternate_identifiers", "related_works"],
    "5": ["file_upload", "metadata_only", "licenses"],
    "6": ["admin_metadata"],
    "7": ["submit_actions"],
}

INVENIO_MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE = {
    "audiovisual": None,
    "audiovisual-audioRecording": None,
    "audiovisual-documentary": None,
    "audiovisual-interviewRecording": None,
    "audiovisual-musicalRecording": None,
    "audiovisual-other": None,
    "audiovisual-performance": None,
    "audiovisual-podcastEpisode": None,
    "audiovisual-videoRecording": None,
    "dataset": None,
    "image": None,
    "image-chart": None,
    "image-diagram": None,
    "image-figure": None,
    "image-map": None,
    "image-visualArt": None,
    "image-photograph": None,
    "image-other": None,
    "instructionalResource": None,
    "instructionalResource-curriculum": None,
    "instructionalResource-lessonPlan": None,
    "instructionalResource-other": None,
    "instructionalResource-syllabus": None,
    "presentation": None,
    "presentation-conferencePaper": None,
    "presentation-conferencePoster": None,
    "presentation-presentationText": None,
    "presentation-slides": None,
    "presentation-other": None,
    "software": None,
    "software-3DModel": None,
    "software-application": None,
    "software-computationalModel": None,
    "software-computationalNotebook": None,
    "software-service": None,
    "software-other": None,
    "textDocument": None,
    "textDocument-abstract": {"4": ["journal_detail"]},
    "textDocument-bibliography": None,
    "textDocument-blogPost": None,
    "textDocument-book": {"4": ["publication_detail", "book_volume_pages", "series"]},
    "textDocument-bookSection": {
        "4": ["book_section_detail", "book_section_volume_pages", "series"]
    },
    "textDocument-conferenceProceeding": None,
    "textDocument-dataManagementPlan": None,
    "textDocument-documentation": None,
    "textDocument-essay": {
        "4": ["book_section_detail", "book_section_volume_pages", "series"]
    },
    "textDocument-interviewTranscript": None,
    "textDocument-journalArticle": {"4": ["journal_detail"]},
    "textDocument-legalComment": None,
    "textDocument-legalResponse": None,
    "textDocument-magazineArticle": None,
    "textDocument-monograph": {
        "4": ["publication_detail", "book_volume_pages", "series"]
    },
    "textDocument-newspaperArticle": {"4": ["journal_detail", "edition_section"]},
    "textDocument-onlinePublication": None,
    "textDocument-poeticWork": None,
    "textDocument-preprint": None,
    "textDocument-report": {
        "4": ["organization_detail", "book_volume_pages", "publisher", "series"]
    },
    "textDocument-review": {"4": ["journal_detail"]},
    "textDocument-technicalStandard": None,
    "textDocument-thesis": {"4": ["thesis_detail"]},
    "textDocument-whitePaper": {
        "4": ["organization_detail", "book_volume_pages", "publisher", "series"]
    },
    "textDocument-workingPaper": {
        "4": ["organization_detail", "book_volume_pages", "publisher", "series"]
    },
    "textDocument-other": None,
    "other": None,
    "other-catalog": None,
    "other-collection": None,
    "other-event": None,
    "other-interactiveResource": None,
    "other-notes": None,
    "other-patent": None,
    "other-peerReview": None,
    "other-physicalObject": None,
    "other-workflow": None,
}

INVENIO_MODULAR_DEPOSIT_FORM_LABEL_MODIFICATIONS = {
    "audiovisual": {"metadata.title": None},
    "audiovisual-audioRecording": {"metadata.title": "Recording title"},
    "audiovisual-documentary": {"metadata.title": "Documentary title"},
    "audiovisual-interviewRecording": {"metadata.title": "Interview title"},
    "audiovisual-musicalRecording": {"metadata.title": "Recording title"},
    "audiovisual-other": {"metadata.title": None},
    "audiovisual-performance": {"metadata.title": "Performance title"},
    "audiovisual-podcastEpisode": {"metadata.title": "Episode title"},
    "audiovisual-videoRecording": {"metadata.title": "Recording title"},
    "dataset": {"metadata.title": "Dataset title"},
    "image": {"metadata.title": "Image title"},
    "image-chart": {"metadata.title": "Chart title"},
    "image-diagram": {"metadata.title": "Diagram title"},
    "image-figure": {"metadata.title": "Figure title"},
    "image-map": {"metadata.title": "Map title"},
    "image-visualArt": {"metadata.title": "Artwork title"},
    "image-photograph": {"metadata.title": "Photograph title"},
    "image-other": {"metadata.title": "Image title"},
    "instructionalResource": {"metadata.title": "Resource title"},
    "instructionalResource-curriculum": {"metadata.title": "Curriculum title"},
    "instructionalResource-lessonPlan": {"metadata.title": "Lesson plan title"},
    "instructionalResource-other": {"metadata.title": "Resource title"},
    "instructionalResource-syllabus": {"metadata.title": "Syllabus title"},
    "presentation": {"metadata.title": "Presentation title"},
    "presentation-conferencePaper": {"metadata.title": "Paper title"},
    "presentation-conferencePoster": {"metadata.title": "Poster title"},
    "presentation-presentationText": {"metadata.title": "Presentation title"},
    "presentation-slides": {"metadata.title": "Presentation title"},
    "presentation-other": {"metadata.title": "Presentation title"},
    "software": {"metadata.title": "Software name"},
    "software-3DModel": {"metadata.title": "Model title"},
    "software-application": {"metadata.title": "Application name"},
    "software-computationalModel": {"metadata.title": "Model title"},
    "software-computationalNotebook": {"metadata.title": "Notebook name"},
    "software-service": {"metadata.title": "Service name"},
    "software-other": {"metadata.title": "Software name"},
    "textDocument": {"metadata.title": "Document title"},
    "textDocument-abstract": {"metadata.title": "Abstract title"},
    "textDocument-bibliography": {"metadata.title": "Bibliography title"},
    "textDocument-blogPost": {"metadata.title": "Post title"},
    "textDocument-book": {"metadata.title": "Book title"},
    "textDocument-bookSection": {"metadata.title": "Chapter/section title"},
    "textDocument-conferenceProceeding": {"metadata.title": None},
    "textDocument-dataManagementPlan": {"metadata.title": "Plan title"},
    "textDocument-documentation": {"metadata.title": "Documentation title"},
    "textDocument-editorial": {
        "metadata.title": "Editorial title",
        "custom_fields.journal:journal.title": "Newspaper/periodical name",
        "custom_fields.journal:journal.pages": "Article pages",
    },
    "textDocument-essay": {"metadata.title": "Essay title"},
    "textDocument-interviewTranscript": {"metadata.title": "Interview title"},
    "textDocument-journalArticle": {
        "metadata.title": "Article title",
        "custom_fields.journal:journal.pages": "Article pages",
    },
    "textDocument-legalComment": {"metadata.title": "Comment title"},
    "textDocument-legalResponse": {"metadata.title": "Response title"},
    "textDocument-magazineArticle": {
        "metadata.title": "Article title",
        "custom_fields.journal:journal.title": "Magazine/periodical title",
        "custom_fields.journal:journal.pages": "Article pages",
    },
    "textDocument-monograph": {"metadata.title": "Monograph title"},
    "textDocument-newspaperArticle": {
        "metadata.title": "Article title",
        "custom_fields.journal:journal.title": "Newspaper/periodical name",
        "custom_fields.journal:journal.pages": "Article pages",
    },
    "textDocument-onlinePublication": {"metadata.title": None},
    "textDocument-poeticWork": {"metadata.title": "Poem title"},
    "textDocument-preprint": {"metadata.title": "Preprint title"},
    "textDocument-report": {"metadata.title": "Report title"},
    "textDocument-review": {
        "metadata.title": "Review title",
        "custom_fields.journal:journal.title": "Magazine/periodical title",
        "custom_fields.journal:journal.pages": "Review pages",
    },
    "textDocument-technicalStandard": {"metadata.title": "Standard title"},
    "textDocument-thesis": {"metadata.title": "Thesis/dissertation title"},
    "textDocument-whitePaper": {"metadata.title": "White paper title"},
    "textDocument-workingPaper": {"metadata.title": "Working paper title"},
    "textDocument-other": {"metadata.title": "Document title"},
    "other": {"metadata.title": None},
    "other-catalog": {"metadata.title": "Catalog title"},
    "other-collection": {"metadata.title": "Collection title"},
    "other-event": {"metadata.title": "Event title"},
    "other-interactiveResource": {"metadata.title": "Resource title"},
    "other-notes": {"metadata.title": None},
    "other-patent": {"metadata.title": "Patent title"},
    "other-peerReview": {"metadata.title": "Review title"},
    "other-physicalObject": {"metadata.title": "Object title"},
    "other-workflow": {"metadata.title": "Workflow title"},
}

INVENIO_MODULAR_DEPOSIT_FORM_PLACEHOLDER_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_DESCRIPTION_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_ICON_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_HELP_TEXT_MODIFICATIONS = {}

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_FIELD_VALUES = {}

INVENIO_MODULAR_DEPOSIT_FORM_PRIORITY_FIELD_VALUES = {
    "audiovisual-audioRecording": {"metadata.creators.role": None}
}

INVENIO_MODULAR_DEPOSIT_FORM_EXTRA_REQUIRED_FIELDS = {
    "textDocument-journalArticle": ["custom_fields.journal:journal.title"]
}
