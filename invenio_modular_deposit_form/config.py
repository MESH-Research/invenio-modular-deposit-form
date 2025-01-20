# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Mesh Research.
#
# Invenio Modular Deposit Form is free software; you can redistribute it
# and/or modify it under the terms of the MIT License; see LICENSE file for
# more details.

"""An InvenioRDM extension that adds a more modular and customizable version of the record deposit form."""

INVENIO_MODULAR_DEPOSIT_FORM_DEFAULT_RESOURCE_TYPE = "textDocument-journalArticle"

INVENIO_MODULAR_DEPOSIT_FORM_COMMON_FIELDS = [
    {
        "section": "top",
        "component": "FormPages",
        "subsections": [
            {
                "section": "page-1",
                "title": "Type & Title",
                "component": "FormPage",
                "subsections": [
                    {
                        "section": "resource_type",
                        "title": "Resource Type",
                        "component": "ResourceTypeComponent",
                    },
                    {
                        "section": "doi",
                        "title": "Digital Object Identifier",
                        "component": "DoiComponent",
                    },
                    {
                        "section": "combined_titles",
                        "title": "Title",
                        "component": "CombinedTitlesComponent",
                    },
                    {
                        "section": "combined_dates",
                        "title": "Dates",
                        "component": "CombinedDatesComponent",
                    },
                    {
                        "section": "abstract",
                        "title": "Description",
                        "component": "AbstractComponent",
                    },
                ],
            },
            {
                "section": "page-2",
                "title": "Submission Details",
                "subsections": [
                    {
                        "section": "publisher",
                        "title": "Publisher",
                        "component": "PublisherComponent",
                    },
                    {
                        "section": "language",
                        "title": "Language",
                        "component": "LanguagesComponent",
                    },
                    {
                        "section": "alternate_identifiers",
                        "title": "Alternate Identifiers",
                        "component": "AlternateIdentifiersComponent",
                    },
                ],
            },
            {
                "section": "page-3",
                "title": "Contributors & Funding",
                "subsections": [
                    {
                        "section": "creators",
                        "title": "Creators",
                        "component": "CreatorsComponent",
                    },
                    {
                        "section": "contributors",
                        "title": "Contributors",
                        "component": "ContributorsComponent",
                    },
                    {"section": "ai", "title": "AI Use", "component": "AIComponent"},
                    {
                        "section": "funding",
                        "title": "Funding",
                        "component": "FundingComponent",
                    },
                ],
            },
            {
                "section": "page-4",
                "title": "Make It Findable",
                "subsections": [
                    {
                        "section": "subjects_keywords",
                        "title": "Subjects",
                        "component": "SubjectsKeywordsComponent",
                    },
                    {
                        "section": "content_warning",
                        "title": "Content Warning",
                        "component": "ContentWarningComponent",
                    },
                    {
                        "section": "related_works",
                        "title": "Related Works",
                        "component": "RelatedWorksComponent",
                    },
                ],
            },
            {
                "section": "page-5",
                "title": "Access",
                "subsections": [
                    {
                        "section": "communities",
                        "title": "Communities",
                        "component": "CommunitiesComponent",
                    },
                    {
                        "section": "access",
                        "title": "Access",
                        "component": "AccessComponent",
                    },
                    {
                        "section": "admin_metadata",
                        "title": "Administrative Metadata",
                        "component": "AdminMetadataComponent",
                        "props": {"restrict_to": ["administrator"]},
                    },
                ],
            },
            {
                "section": "page-6",
                "title": "Files",
                "subsections": [
                    {
                        "section": "file_upload",
                        "title": "Files Upload",
                        "component": "FilesUploadComponent",
                    },
                    {
                        "section": "metadata_only",
                        "title": "Metadata Only",
                        "component": "MetadataOnlyComponent",
                    },
                    {
                        "section": "licenses",
                        "title": "Licenses",
                        "component": "LicensesComponent",
                    },
                ],
            },
            {
                "section": "page-7",
                "title": "Publish",
                "subsections": [
                    {
                        "section": "submit_actions",
                        "title": "Publish",
                        "component": "SubmitActionsComponent",
                    },
                ],
            },
        ],
    }
]

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
    "textDocument-abstract": {
        "page-2": [
            {
                "same_as": "textDocument-journalArticle",
            }
        ]
    },
    "textDocument-bibliography": None,
    "textDocument-blogPost": None,
    "textDocument-book": {
        "page-2": [
            {
                "section": "publication_detail",
                "title": "Publication Details",
                "component": "PublicationDetailsComponent",
            },
            {
                "section": "book_volume_pages",
                "title": "Volume & Pages",
                "component": "BookVolumePagesComponent",
            },
            {"section": "series", "title": "Series", "component": "SeriesComponent"},
        ]
    },
    "textDocument-bookSection": {
        "page-2": [
            {
                "section": "book_section_detail",
                "title": "Book Section Details",
                "component": "BookSectionDetailComponent",
            },
            {
                "section": "book_section_volume_pages",
                "title": "Volume & Pages",
                "component": "BookSectionVolumePagesComponent",
            },
            {"section": "series", "title": "Series", "component": "SeriesComponent"},
        ]
    },
    "textDocument-conferenceProceeding": None,
    "textDocument-dataManagementPlan": None,
    "textDocument-documentation": None,
    "textDocument-essay": {"page-2": [{"same_as": "textDocument-bookSection"}]},
    "textDocument-interviewTranscript": None,
    "textDocument-journalArticle": {
        "page-2": [
            {
                "section": "journal_detail",
                "title": "Journal Details",
                "component": "JournalDetailComponent",
            }
        ]
    },
    "textDocument-legalComment": None,
    "textDocument-legalResponse": None,
    "textDocument-magazineArticle": None,
    "textDocument-monograph": {"page-2": [{"same_as": "textDocument-book"}]},
    "textDocument-newspaperArticle": {"4": ["journal_detail", "edition_section"]},
    "textDocument-onlinePublication": None,
    "textDocument-poeticWork": None,
    "textDocument-preprint": None,
    "textDocument-report": {
        "page-2": [
            {
                "section": "organization_detail",
                "title": "Organization Details",
                "component": "OrganizationDetailsComponent",
            },
            {
                "section": "book_volume_pages",
                "title": "Volume & Pages",
                "component": "BookVolumePagesComponent",
            },
            {
                "section": "publisher",
                "title": "Publisher",
                "component": "PublisherComponent",
            },
            {"section": "series", "title": "Series", "component": "SeriesComponent"},
        ]
    },
    "textDocument-review": {"page-2": [{"same_as": "textDocument-journalArticle"}]},
    "textDocument-technicalStandard": None,
    "textDocument-thesis": {"4": ["thesis_detail"]},
    "textDocument-whitePaper": {"page-2": [{"same_as": "textDocument-report"}]},
    "textDocument-workingPaper": {"page-2": [{"same_as": "textDocument-report"}]},
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

INVENIO_MODULAR_DEPOSIT_FORM_COMMUNITY_TERM = "community"
