import {
  FORM_UI_ACTION,
  formUIStateReducer,
  getInitialFormUIState,
} from "./formUIStateReducer";

describe("formUIStateReducer SET_SUBMISSION_BUTTON_STATE", () => {
  const base = getInitialFormUIState([]);

  it("returns the same state reference when button flags are unchanged", () => {
    const state = {
      ...base,
      hasClientValidationErrors: true,
      hasDraftBlockingClientErrors: false,
    };
    const next = formUIStateReducer(state, {
      type: FORM_UI_ACTION.SET_SUBMISSION_BUTTON_STATE,
      payload: {
        hasClientValidationErrors: true,
        hasDraftBlockingClientErrors: false,
      },
    });
    expect(next).toBe(state);
  });

  it("returns a new state when a button flag changes", () => {
    const state = {
      ...base,
      hasClientValidationErrors: false,
      hasDraftBlockingClientErrors: false,
    };
    const next = formUIStateReducer(state, {
      type: FORM_UI_ACTION.SET_SUBMISSION_BUTTON_STATE,
      payload: {
        hasClientValidationErrors: true,
        hasDraftBlockingClientErrors: true,
      },
    });
    expect(next).not.toBe(state);
    expect(next.hasClientValidationErrors).toBe(true);
    expect(next.hasDraftBlockingClientErrors).toBe(true);
  });
});
