// Part of invenio-modular-deposit-form
// Copyright (C) 2026 MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { render, screen } from "@testing-library/react";
import { FormUIStateContext, useFormUIState } from "./FormUIStateManager.jsx";

describe("useFormUIState", () => {
  it("throws when used outside FormUIStateContext.Provider", () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});

    const BadConsumer = () => {
      useFormUIState();
      return null;
    };

    try {
      expect(() => render(<BadConsumer />)).toThrow(
        "useFormUIState must be used within FormUIStateManager"
      );
    } finally {
      err.mockRestore();
    }
  });

  it("returns context value when wrapped in FormUIStateContext.Provider", () => {
    const mockValue = {
      formUIState: { currentFormPage: "files", currentResourceType: "publication" },
      formUIDispatch: jest.fn(),
      handleFormPageChange: jest.fn(),
    };

    const Consumer = () => {
      const ctx = useFormUIState();
      return (
        <span data-testid="page">{ctx.formUIState.currentFormPage}</span>
      );
    };

    render(
      <FormUIStateContext.Provider value={mockValue}>
        <Consumer />
      </FormUIStateContext.Provider>
    );

    expect(screen.getByTestId("page")).toHaveTextContent("files");
  });
});
