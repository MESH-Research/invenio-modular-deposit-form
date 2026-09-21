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

describe("formUIStateReducer SET_HAS_UNCONFIRMED_UPPY_UPLOADS", () => {
  const base = getInitialFormUIState([]);

  it("defaults hasUnconfirmedUppyUploads to false", () => {
    expect(base.hasUnconfirmedUppyUploads).toBe(false);
  });

  it("returns the same state reference when the flag is unchanged", () => {
    const state = { ...base, hasUnconfirmedUppyUploads: true };
    const next = formUIStateReducer(state, {
      type: FORM_UI_ACTION.SET_HAS_UNCONFIRMED_UPPY_UPLOADS,
      payload: true,
    });
    expect(next).toBe(state);
  });

  it("sets the flag when it changes", () => {
    const next = formUIStateReducer(base, {
      type: FORM_UI_ACTION.SET_HAS_UNCONFIRMED_UPPY_UPLOADS,
      payload: true,
    });
    expect(next).not.toBe(base);
    expect(next.hasUnconfirmedUppyUploads).toBe(true);
  });
});
