module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js",
    "!src/server.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"]
};