module.exports = {
  verbose: false,
  testEnvironment: "jsdom",
  roots: ["<rootDir>/invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form"],
  moduleFileExtensions: ["js", "jsx", "json"],
  moduleNameMapper: {
    "^react/jsx-dev-runtime$": "<rootDir>/__mocks__/react-jsx-runtime.js",
    "^react/jsx-runtime$": "<rootDir>/__mocks__/react-jsx-runtime.js",
    "^axios$": "<rootDir>/__mocks__/axios.js",
    "^@js/invenio_app_rdm/deposit/config$": "<rootDir>/__mocks__/invenio_app_rdm_deposit_config.js",
    "^react-overridable$": "<rootDir>/__mocks__/react-overridable.js",
    "^@custom-test-utils/(.*)$": "<rootDir>/tests/js/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "^@translations/invenio_modular_deposit_form/i18next$":
      "<rootDir>/invenio_modular_deposit_form/assets/semantic-ui/translations/invenio_modular_deposit_form/i18next.js",
    "^@translations/invenio_rdm_records/i18next$":
      "<rootDir>/__mocks__/i18next_invenio_rdm_records.js",
    "^@js/invenio_modular_deposit_form/(.*)$":
      "<rootDir>/invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form/$1",
    "^@js/invenio_modular_deposit_form_transformations$":
      "<rootDir>/__mocks__/invenio_modular_deposit_form_transformations.js",
    // Specific rdm-records paths needed by depositReducer tests (before catch-all).
    "^@js/invenio_rdm_records/src/deposit/state/reducers/deposit$":
      "<rootDir>/__mocks__/invenio_rdm_records_deposit_reducer.js",
    "^@js/invenio_rdm_records/src/deposit/state/types$":
      "<rootDir>/__mocks__/invenio_rdm_records_deposit_types.js",
    "^@js/invenio_rdm_records$": "<rootDir>/__mocks__/invenio_rdm_records.js",
    "^@js/invenio_rdm_records/(.*)$": "<rootDir>/__mocks__/invenio_rdm_records.js",
    "^@js/invenio_vocabularies$": "<rootDir>/__mocks__/invenio_vocabularies_stub.js",
    "^@js/invenio_vocabularies/(.*)$":
      "<rootDir>/__mocks__/invenio_vocabularies_stub.js",
    "^@translations/invenio_vocabularies/i18next$":
      "<rootDir>/__mocks__/i18next_invenio_rdm_records.js",
    "^@js/invenio_app_rdm/deposit/ShareDraftButton$":
      "<rootDir>/__mocks__/ShareDraftButton_stub.js",
    // ShareDraftButton (loaded via field_components) imports app_rdm ShareModal + i18n.
    // LanguagesComponent tests do not exercise share UI; stub so the module graph loads.
    "^@js/invenio_app_rdm/landing_page/ShareOptions/ShareModal$":
      "<rootDir>/__mocks__/ShareModal_stub.js",
    "^@translations/invenio_app_rdm/i18next$":
      "<rootDir>/__mocks__/i18next_invenio_rdm_records.js",
    // Prefer this package's install over nested translation/node_modules trees.
    "^i18next$": "<rootDir>/node_modules/i18next",
    "^i18next-browser-languagedetector$":
      "<rootDir>/node_modules/i18next-browser-languagedetector",
    "^react-i18next$": "<rootDir>/node_modules/react-i18next",
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    // pnpm: allowlist must match the package after the optional
    // .pnpm/<pkg>@ver/node_modules/ prefix (see root jest.config.js).
    "/node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-invenio-forms|react-searchkit|axios|semantic-ui-react|@babel|@inveniosoftware)(/|$))",
  ],
  testMatch: ["**/*.test.js", "**/*.test.jsx"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "invenio_modular_deposit_form/assets/**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/*.test.{js,jsx}",
    "!**/*.spec.{js,jsx}",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  resetMocks: true,
  restoreMocks: true,
};
