import { configureStore } from "@reduxjs/toolkit";

/**
 * Minimal Redux store for Jest in this package. Parent repo tests use InvenioRDM rootReducer;
 * here `@js/invenio_rdm_records` is mocked to `{}`, so we use a no-op store that holds
 * `preloadedState` as-is (sufficient for components that only read `getState()`).
 */
export const sampleState = {
  deposit: {
    config: {
      custom_fields: {
        error_labels: {},
      },
    },
    record: {},
    editorState: {},
    permissions: {},
    actionState: null,
    actionStateExtra: {},
  },
  files: {},
};

export function setupStore(preloadedState = {}) {
  const staticReducer = (state = preloadedState) => state;
  return configureStore({
    reducer: staticReducer,
    preloadedState,
  });
}
