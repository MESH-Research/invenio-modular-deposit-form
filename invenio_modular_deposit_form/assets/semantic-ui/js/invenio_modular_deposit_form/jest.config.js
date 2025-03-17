export default {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/setupTests.js"],
  extensionsToTreatAsEsm: [".jsx", ".ts"],
  transformIgnorePatterns: ["node_modules/(?!(semantic-ui-react)/)"],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@translations/(.*)$": "<rootDir>/testing_translations/$1",
    "^@js/(.*)$": "<rootDir>/testing_modules/$1",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/testing_modules/",
    "/testing_translations/"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/testing_modules/",
    "/testing_translations/"
  ],
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  // Add these configurations to help with import
  // errors after test environment teardown
  testTimeout: 10000, // Increase timeout to 10 seconds
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  // Ensure we wait for pending tasks
  injectGlobals: true,
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
