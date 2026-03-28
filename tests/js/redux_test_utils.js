import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

import { setupStore } from "./redux_store";

/**
 * Renders UI inside Redux Provider. Same API as kcworks-next/tests/js/redux_test_utils.js
 * but without InvenioRDM store imports (not resolvable under this package's Jest mocks).
 */
function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export { renderWithProviders };
