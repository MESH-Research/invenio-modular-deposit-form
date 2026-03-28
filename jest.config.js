module.exports = {
  verbose: true,
  testEnvironment: "jsdom",
  roots: ["<rootDir>/invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form"],
  moduleFileExtensions: ["js", "jsx", "json"],
  moduleNameMapper: {
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
    "^@js/invenio_rdm_records$": "<rootDir>/__mocks__/invenio_rdm_records.js",
    "^@js/invenio_rdm_records/(.*)$": "<rootDir>/__mocks__/invenio_rdm_records.js",
    "^@js/invenio_vocabularies$": "<rootDir>/__mocks__/invenio_vocabularies_stub.js",
    "^@js/invenio_app_rdm/deposit/ShareDraftButton$":
      "<rootDir>/__mocks__/ShareDraftButton_stub.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(react-invenio-forms|react-searchkit|axios|semantic-ui-react|@babel|@inveniosoftware)/)",
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
