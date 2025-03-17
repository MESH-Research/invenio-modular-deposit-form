// This file is part of Invenio-RDM-Records
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { jest } from "@jest/globals";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// // Clean up after each test
// afterEach(() => {
//   // Clean up any timers
//   jest.clearAllTimers();
//   // Clean up any mocks
//   jest.clearAllMocks();
// });

// // Handle TinyMCE cleanup
// beforeAll(() => {
//   window.tinymce = {
//     remove: jest.fn(),
//     init: jest.fn(),
//   };
// });

// afterAll(() => {
//   delete window.tinymce;
// });