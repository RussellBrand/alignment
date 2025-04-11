// Test setup file for Vitest
const { afterAll, beforeAll } = require("vitest");

// Global setup
beforeAll(async () => {
  console.log("Setting up tests");
});

// Global teardown
afterAll(async () => {
  console.log("Tearing down tests");
});
