import React from "react";
import { render, cleanup } from "@testing-library/react";
import { AbstractComponent } from "./field_components";
import { afterEach } from "@jest/globals";

describe("AbstractComponent", () => {
  test("renders", () => {
    const { getByTestId } = render(<AbstractComponent />);
    expect(getByTestId("metadata.descriptions-field")).toBeInTheDocument();
  });
});

// Run cleanup after each test
afterEach(() => {
  cleanup();
  // If you're using TinyMCE, you might also need to clean it up
  if (window.tinymce) {
    window.tinymce.remove();
  }
});