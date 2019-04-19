/* eslint-disable global-require */
/* global jest */
const { resolveFeatureFromFile } = require("./setup");

describe("Tags inheritance", () => {
  window.Cypress = {
    env: () => "@inherited-tag and @own-tag",
    on: jest.fn(),
    off: jest.fn()
  };

  require("../cypress/support/step_definitions/tags_implementation_with_env_set");
  resolveFeatureFromFile("./cypress/integration/TagsInheritance.feature");
});
