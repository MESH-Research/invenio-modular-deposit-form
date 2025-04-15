import { FormErrorManager } from "./FormErrorManager";

const formPages = [
  {
      "section": "page-1",
      "label": "Type & Title",
      "component": "FormPage",
      "subsections": [
          {
              "section": "resource_type",
              "label": "Resource Type",
              "component": "ResourceTypeComponent",
              "wrapped": true,
              "required": true,
          },
          {
              "section": "doi",
              "label": "Digital Object Identifier",
              "icon": "linkify",
              "component": "DoiComponent",
              "wrapped": true,
          },
          {
              "section": "combined_titles",
              "label": "Title",
              "component": "TitleComponent",
              "wrapped": true,
              "icon": "book",
          },
          {
              "section": "combined_dates",
              "label": "Dates",
              "component": "CombinedDatesComponent",
              "wrapped": true,
              "helpText": "",
          },
          {
              "section": "abstract",
              "label": "Abstract or Description",
              "component": "AbstractComponent",
              "wrapped": true,
          },
      ],
  },
  {
      "section": "page-2",
      "label": "Details",
      "subsections": [
          {
              "section": "publisher",
              "label": "Publisher",
              "component": "PublisherComponent",
              "wrapped": true,
              "description": "",
          },
          {
              "section": "language",
              "label": "Languages",
              "component": "LanguagesComponent",
              "placeholder": "e.g., English, French, Swahili",
              "description": "Search for the language(s) of the resource (e.g.," +
                  ' "en", "fre", "Swahili"). Press enter to ' +
                  "select each language.",
              "wrapped": true,
          },
          {
              "section": "alternate_identifiers",
              "label": "URL and Other Identifiers",
              "icon": "linkify",
              "component": "AlternateIdentifiersComponent",
              "wrapped": true,
          },
      ],
  },
  {
      "section": "page-3",
      "label": "Contributors & Funding",
      "subsections": [
          {
              "section": "creators",
              "label": "Creators and Contributors",
              "component": "CreatorsComponent",
              "wrapped": true,
              "addButtonLabel": "Add Contributor",
              "modal": {
                  "addLabel": "Add Contributor",
                  "editLabel": "Edit Contributor",
              },
          },
          {
              "section": "ai",
              "label": "AI Use",
              "component": "AIComponent",
              "icon": "microchip",
              "wrapped": true,
              "description": (
                  "Briefly describe how generative artificial " +
                  "intelligence tools (e.g., ChatGPT, MS Copilot, " +
                  "Adobe Firefly, Midjourney, etc.) were used in " +
                  "the production of this work."
              ),
              "helpText": (
                  "This text will be displayed on the detail page " +
                  "for the work."
              ),
          },
      ],
  },
];

const formPageFields = {
  "page-1": ["metadata.title", "metadata.description"],
  "page-2": ["metadata.resource_type", "metadata.publisher"],
  "page-3": ["metadata.creators"],
};

const errors = {
  metadata: {
    title: "A title is required",
    resource_type: "A resource type is required",
  },
};

const touched = {
  metadata: {
    publication_date: true,
    resource_type: true,
    title: true,
    dates: true,
    description: true,
  },
  pids: {
    doi: true,
  },
};

const initialTouched = {};

const initialErrors = {
  metadata: {
    title: "A title is required",
    creators: "At least one creator must be listed",
  },
};

const initialValues = {
  access: {
    embargo: {
      active: false,
    },
    files: "public",
    record: "public",
    status: "open",
  },
  metadata: {
    creators: [],
    description:
      "This series is designed to help folks at all stages of career",
    publication_date: "2025-01-09",
    publisher: "Knowledge Commons",
    resource_type: "textDocument-other",
    title: "",
    additional_titles: [],
    additional_descriptions: [],
    contributors: [],
    dates: [],
    languages: [],
    identifiers: [],
    related_identifiers: [],
    references: [],
    subjects: [],
    funding: [],
    version: "",
    rights: [],
  },
  id: "xbewq-y5w20",
  parent: {
    id: "d3hp2-dd570",
    pids: {
      doi: {
        client: "datacite",
        identifier: "10.17613/d3hp2-dd570",
        provider: "datacite",
      },
    },
  },
  pids: {
    doi: {
      client: "datacite",
      identifier: "10.17613/xbewq-y5w20",
      provider: "datacite",
    },
  },
  custom_fields: {
    "kcr:ai_usage": {
      ai_used: false,
    },
  },
};

const values = {
  ...initialValues,
  metadata: {
    ...initialValues.metadata,
    resource_type: "",
    creators: [
      {
        person_or_org: {
          family_name: "Hart Davidson",
          given_name: "William",
          identifiers: [
            {
              identifier: "@billhd",
              scheme: "kc_username",
            },
            {
              identifier: "0000-0001-8147-1610",
              scheme: "orcid",
            },
          ],
          name: "Hart Davidson, William",
          type: "personal",
        },
        role: "author",
        affiliations: [
          {
            id: "05hs6h993",
            name: "Michigan State University",
          },
        ],
        __key: 0,
      },
    ],
  },
};

const startingState = {
  formPages: [ ...formPages ],
  formPageFields: { ...formPageFields },
  initialErrors: { ...initialErrors },
  errors: { ...errors },
  touched: { ...touched },
  initialValues: { ...initialValues },
  values: { ...values },
};

const mockSetFieldError = jest.fn();
const mockSetPagesWithErrors = jest.fn();
const mockSetPagesWithFlaggedErrors = jest.fn();

describe("FormErrorManager", () => {
  it("should be defined", () => {
    expect(FormErrorManager).toBeDefined();
  });

  it("should instantiate a FormErrorManager instance", () => {
    expect(new FormErrorManager(...Object.values(startingState))).toBeInstanceOf(
      FormErrorManager
    );
  });

  it("should update the form error state with backend errors and flagged pages with errors", () => {
    const formErrorManager = new FormErrorManager(...Object.values(startingState));
    formErrorManager.updateFormErrorState(
      mockSetFieldError,
      mockSetPagesWithErrors,
      mockSetPagesWithFlaggedErrors
    );
    expect(mockSetFieldError).toHaveBeenCalledWith(
      "metadata.title",
      "A title is required"
    );
    expect(mockSetPagesWithErrors).toHaveBeenCalledWith(["page-1"]);
    expect(mockSetPagesWithFlaggedErrors).toHaveBeenCalledWith(["page-1"]);
  });

  describe("constructor", () => {
    it("should initialize the form error manager", () => {
      const formErrorManager = new FormErrorManager(...Object.values(startingState));
      expect(formErrorManager).toBeInstanceOf(FormErrorManager);
    });
  });

  describe("errorsToFieldSets", () => {
    it("should return the correct error pages", () => {
      const formErrorManager = new FormErrorManager(...Object.values(startingState));
      const fieldSets = formErrorManager.errorsToFieldSets();
      expect(fieldSets).toEqual({
        errorFields: ["metadata.title", "metadata.resource_type"],
        touchedErrorFields: ["metadata.title", "metadata.resource_type"],
        initialErrorFields: ["metadata.title", "metadata.creators"],
        initialErrorFieldsUntouched: ["metadata.creators"],
        initialErrorFieldsUnchanged: ["metadata.title"],
        initialErrorFieldsUnflagged: [],
      });
    });
  });

  describe("addBackendErrors", () => {
    it("should add backend errors to the form error state", () => {
      const formErrorManager = new FormErrorManager(...Object.values(startingState));
      formErrorManager.addBackendErrors(mockSetFieldError);
      expect(mockSetFieldError).toHaveBeenCalledTimes(2);
      expect(mockSetFieldError).toHaveBeenCalledWith("metadata.resource_type", "A resource type is required");
    });
  });

  describe("getErrorPages", () => {
    it("should return the correct error pages", () => {
      const formErrorManager = new FormErrorManager(...Object.values(startingState));
      const fieldState = formErrorManager.errorsToFieldSets();
      const [errorPages, flaggedErrorPages] = formErrorManager.getErrorPages(formErrorManager.formPages, formErrorManager.formPageFields, ...Object.values(fieldState));
      expect(errorPages).toEqual(["page-1"]);
      expect(flaggedErrorPages).toEqual(["page-1"]);
    });
  });
});
