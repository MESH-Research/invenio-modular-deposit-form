module.exports = {
  verbose: true,
  testEnvironment: "jsdom",
  roots: ["<rootDir>/invenio_modular_deposit_form/assets/semantic-ui/js/invenio_modular_deposit_form"],
  moduleFileExtensions: ["js", "jsx", "json"],
  moduleNameMapper: {
    "^@custom-test-utils/(.*)$": "<rootDir>/tests/js/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "^@translations/invenio_modular_deposit_form/i18next$":
      "<rootDir>/invenio_modular_deposit_form/assets/semantic-ui/translations/invenio_modular_deposit_form/i18next.js",
    "^@js/invenio_rdm_records$": "<rootDir>/__mocks__/invenio_rdm_records.js",
    "^@js/invenio_rdm_records/(.*)$": "<rootDir>/__mocks__/invenio_rdm_records.js",
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
