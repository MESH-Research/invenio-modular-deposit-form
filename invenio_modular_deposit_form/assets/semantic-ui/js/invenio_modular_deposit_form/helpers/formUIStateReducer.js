/**
 * Reducer and actions for form UI state (current page, error pages, resource type, field maps).
 * Used with useReducer in FormLayoutContainer.
 */

export const FORM_UI_ACTION = {
  SET_CURRENT_FORM_PAGE: "SET_CURRENT_FORM_PAGE",
  SET_PAGES_WITH_ERRORS: "SET_PAGES_WITH_ERRORS",
  SET_PAGES_WITH_FLAGGED_ERRORS: "SET_PAGES_WITH_FLAGGED_ERRORS",
  SET_CURRENT_RESOURCE_TYPE: "SET_CURRENT_RESOURCE_TYPE",
  SET_CURRENT_TYPE_FIELDS: "SET_CURRENT_TYPE_FIELDS",
  SET_FORM_PAGE_FIELDS: "SET_FORM_PAGE_FIELDS",
};

const defaultState = {
  currentFormPage: "",
  pagesWithErrors: {},
  pagesWithFlaggedErrors: {},
  currentResourceType: "",
  currentTypeFields: {},
  formPageFields: {},
};

export function getInitialFormUIState(formPages, defaultResourceType, fieldsByType) {
  const firstSection = formPages[0]?.section ?? "";
  return {
    ...defaultState,
    currentFormPage: firstSection,
    currentResourceType: defaultResourceType ?? "",
    currentTypeFields: fieldsByType?.[defaultResourceType] ?? {},
  };
}

export function formUIStateReducer(state, action) {
  switch (action.type) {
    case FORM_UI_ACTION.SET_CURRENT_FORM_PAGE:
      return { ...state, currentFormPage: action.payload };
    case FORM_UI_ACTION.SET_PAGES_WITH_ERRORS:
      return { ...state, pagesWithErrors: action.payload };
    case FORM_UI_ACTION.SET_PAGES_WITH_FLAGGED_ERRORS:
      return { ...state, pagesWithFlaggedErrors: action.payload };
    case FORM_UI_ACTION.SET_CURRENT_RESOURCE_TYPE:
      return { ...state, currentResourceType: action.payload };
    case FORM_UI_ACTION.SET_CURRENT_TYPE_FIELDS:
      return { ...state, currentTypeFields: action.payload };
    case FORM_UI_ACTION.SET_FORM_PAGE_FIELDS:
      return { ...state, formPageFields: action.payload };
    default:
      return state;
  }
}
