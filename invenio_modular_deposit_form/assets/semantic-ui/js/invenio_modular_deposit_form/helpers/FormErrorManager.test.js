import { FormErrorManager } from "./FormErrorManager";
import { FORM_UI_ACTION } from "./formUIStateReducer";
import {
  mockFormikContext,
  mockSetFieldError,
} from "@custom-test-utils/formik_test_utils";

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
              "component": "TitlesComponent",
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
  "page-1": ["metadata.resource_type", "pids.doi", "metadata.title", "metadata.publication_date", "metadata.dates", "metadata.description"],
  "page-2": ["custom_fields.journal:journal.title", "custom_fields.journal:journal.volume", "custom_fields.journal:journal.issue", "custom_fields.journal:journal.pages", "custom_fields.journal:journal.issn", "metadata.publisher", "custom_fields.imprint:imprint.place", "metadata.languages", "metadata.identifiers"],
  "page-3": ["metadata.creators", "custom_fields.kcr:ai_usage"],
};

const formSectionFields = [
  { pageId: "page-1", sectionId: "main", fields: formPageFields["page-1"] },
  { pageId: "page-2", sectionId: "main", fields: formPageFields["page-2"] },
  { pageId: "page-3", sectionId: "main", fields: formPageFields["page-3"] },
];

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
    publisher: true,
    languages: true,
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
    publisher: "A publisher is required",
  },
  custom_fields: {
    "kcr:ai_usage": {
      ai_used: "AI use must be boolean",
    },
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
    publisher: "",
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
      ai_used: "no",
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
  custom_fields: {
    ...initialValues.custom_fields,
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

const formikFromStartingState = {
  ...mockFormikContext,
  errors: startingState.errors,
  touched: startingState.touched,
  initialErrors: startingState.initialErrors,
  initialValues: startingState.initialValues,
  values: startingState.values,
};

const mockDispatch = jest.fn();

const mockStore = {
  getState: () => ({
    deposit: {
      actionState: null,
      config: { formSectionFields },
    },
  }),
};

describe("FormErrorManager", () => {
  it("should be defined", () => {
    expect(FormErrorManager).toBeDefined();
  });

  it("should instantiate a FormErrorManager instance", () => {
    expect(new FormErrorManager(formikFromStartingState, mockStore)).toBeInstanceOf(
      FormErrorManager
    );
  });

  it("should update the form error state with backend errors and section error state", () => {
    const formErrorManager = new FormErrorManager(formikFromStartingState, mockStore);
    formErrorManager.updateFormErrorState(mockDispatch);
    expect(mockFormikContext.setFieldError).toHaveBeenCalledTimes(2);
    expect(mockFormikContext.setFieldError).toHaveBeenCalledWith(
      "custom_fields.kcr:ai_usage.ai_used",
      "AI use must be boolean"
    );
    expect(mockFormikContext.setFieldError).toHaveBeenCalledWith(
      "metadata.publisher",
      "A publisher is required"
    );
    expect(mockFormikContext.setFieldTouched).toHaveBeenCalledTimes(1);
    expect(mockFormikContext.setFieldTouched).toHaveBeenCalledWith(
      "custom_fields.kcr:ai_usage.ai_used",
      true
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: FORM_UI_ACTION.SET_SECTION_ERRORS_FLAGGED,
      payload: [
        { page: "page-1", section: "main", error_fields: ["metadata.resource_type", "metadata.title"], info_fields: [], warning_fields: [] },
        { page: "page-2", section: "main", error_fields: ["metadata.publisher"], info_fields: [], warning_fields: [] },
        { page: "page-3", section: "main", error_fields: ["custom_fields.kcr:ai_usage.ai_used"], info_fields: [], warning_fields: [] },
      ],
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: FORM_UI_ACTION.SET_SECTION_ERRORS_ALL,
      payload: [
        { page: "page-1", section: "main", error_fields: ["metadata.resource_type", "metadata.title"], info_fields: [], warning_fields: [] },
        { page: "page-2", section: "main", error_fields: ["metadata.publisher"], info_fields: [], warning_fields: [] },
        { page: "page-3", section: "main", error_fields: ["custom_fields.kcr:ai_usage.ai_used"], info_fields: [], warning_fields: [] },
      ],
    });
  });

  describe("constructor", () => {
    it("should initialize the form error manager", () => {
      const formErrorManager = new FormErrorManager(formikFromStartingState, mockStore);
      expect(formErrorManager).toBeInstanceOf(FormErrorManager);
    });
  });

  // covers cases where
  // error is only in form errors and touched (flagged already: resource_type)
  // error is in both form errors and initial errors and touched (flagged already: title)
  // error is only in initial errors and touched and unchanged (flag: publisher)
  // error is only in initial errors and untouched but changed (don't flag: creators)
  // error is only in initial errors and untouched and unchanged (flag: ai_usage)
  describe("errorsToFieldSets", () => {
    it("should return the correct error pages", () => {
      const formErrorManager = new FormErrorManager(formikFromStartingState, mockStore);
      const fieldSets = formErrorManager.errorsToFieldSets();
      expect(fieldSets).toEqual({
        errorFields: ["metadata.title", "metadata.resource_type"],
        touchedErrorFields: ["metadata.title", "metadata.resource_type"],
        initialErrorFields: ["metadata.title", "metadata.creators", "metadata.publisher", "custom_fields.kcr:ai_usage.ai_used"],
        initialErrorFieldsUntouched: ["metadata.creators", "custom_fields.kcr:ai_usage.ai_used"],
        initialErrorFieldsUnchanged: ["metadata.title", "metadata.publisher", "custom_fields.kcr:ai_usage.ai_used"],
        initialErrorFieldsUnflagged: ["metadata.creators"],
        initialErrorFieldsToFlag: ["metadata.publisher", "custom_fields.kcr:ai_usage.ai_used"],
      });
    });
  });

  describe("addBackendErrors", () => {
    it("should add unchanged backend errors to the form error state and update touched state if backend error field is unchanged and untouched", () => {
      const formErrorManager = new FormErrorManager(formikFromStartingState, mockStore);
      formErrorManager.addBackendErrors(
        ["metadata.publisher", "custom_fields.kcr:ai_usage.ai_used"]
      );

      expect(mockFormikContext.setFieldError).toHaveBeenCalledTimes(2);
      expect(mockFormikContext.setFieldError).toHaveBeenCalledWith("metadata.publisher", "A publisher is required");
      expect(mockFormikContext.setFieldError).toHaveBeenCalledWith("custom_fields.kcr:ai_usage.ai_used", "AI use must be boolean");

      expect(mockFormikContext.setFieldTouched).toHaveBeenCalledTimes(1);
      expect(mockFormikContext.setFieldTouched).toHaveBeenCalledWith("custom_fields.kcr:ai_usage.ai_used", true);
    });
  });

  describe("getSectionErrorState", () => {
    it("should return the correct section error list", () => {
      const formErrorManager = new FormErrorManager(formikFromStartingState, mockStore);
      const fieldState = formErrorManager.errorsToFieldSets();
      const sectionErrorsFlagged = formErrorManager.getSectionErrorState(
        fieldState.touchedErrorFields,
        fieldState.initialErrorFieldsToFlag,
      );
      expect(sectionErrorsFlagged).toEqual([
        { page: "page-1", section: "main", error_fields: ["metadata.resource_type", "metadata.title"], info_fields: [], warning_fields: [] },
        { page: "page-2", section: "main", error_fields: ["metadata.publisher"], info_fields: [], warning_fields: [] },
        { page: "page-3", section: "main", error_fields: ["custom_fields.kcr:ai_usage.ai_used"], info_fields: [], warning_fields: [] },
      ]);
    });
  });

  describe("global API errors (e.g. CSRF)", () => {
    it("does not treat bare initialErrors.message as a form field path (avoids setFieldError loop)", () => {
      const formik = {
        ...mockFormikContext,
        errors: {},
        touched: {},
        initialErrors: {
          message: "CSRF cookie not set.",
          status: 400,
        },
        initialValues: { metadata: { title: "T" } },
        values: { metadata: { title: "T" } },
      };
      const store = {
        getState: () => ({
          deposit: {
            actionState: "DRAFT_SAVE_FAILED",
            config: { formSectionFields: [] },
          },
        }),
      };
      const dispatch = jest.fn();
      new FormErrorManager(formik, store).updateFormErrorState(dispatch);
      expect(mockSetFieldError).not.toHaveBeenCalledWith("message", expect.anything());
      expect(mockSetFieldError).not.toHaveBeenCalledWith("status", expect.anything());
    });
  });
});
