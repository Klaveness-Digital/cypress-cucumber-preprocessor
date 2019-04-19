/* eslint-disable global-require */

const { resolveFeatureFromFile } = require("./setup.js");

describe("Scenario Outline", () => {
  require("../cypress/support/step_definitions/scenario_outline_integer");
  require("../cypress/support/step_definitions/scenario_outline_string");
  require("../cypress/support/step_definitions/scenario_outline_data_table");
  resolveFeatureFromFile("./cypress/integration/ScenarioOutline.feature");
});

describe("DocString", () => {
  require("../cypress/support/step_definitions/docString");
  resolveFeatureFromFile("./cypress/integration/DocString.feature");
});

describe("Data table", () => {
  require("../cypress/support/step_definitions/dataTable");
  resolveFeatureFromFile("./cypress/integration/DataTable.feature");
});

describe("Basic example", () => {
  require("../cypress/support/step_definitions/basic");
  resolveFeatureFromFile("./cypress/integration/Plugin.feature");
});

describe("Background section", () => {
  require("../cypress/support/step_definitions/backgroundSection");
  resolveFeatureFromFile("./cypress/integration/BackgroundSection.feature");
});

describe("Regexp", () => {
  require("../cypress/support/step_definitions/regexp");
  resolveFeatureFromFile("./cypress/integration/RegularExpressions.feature");
});

describe("Custom Parameter Types", () => {
  require("../cypress/support/step_definitions/customParameterTypes");
  resolveFeatureFromFile("./cypress/integration/CustomParameterTypes.feature");
});

describe("Tags implementation", () => {
  require("../cypress/support/step_definitions/tags_implementation");
  resolveFeatureFromFile("./cypress/integration/TagsImplementation.feature");
});

describe("Tags with env TAGS set", () => {
  window.Cypress = {
    env: () => "@test-tag and not @ignore-tag",
    on: jest.fn(),
    off: jest.fn()
  };
  require("../cypress/support/step_definitions/tags_implementation_with_env_set");
  resolveFeatureFromFile(
    "./cypress/integration/TagsImplementationWithEnvSet.feature"
  );

  resolveFeatureFromFile(
    "./cypress/integration/TagsImplementationWithEnvSetScenarioLevel.feature"
  );
});

describe("Smart tagging", () => {
  window.Cypress = {
    env: () => "",
    on: jest.fn(),
    off: jest.fn()
  };
  require("../cypress/support/step_definitions/smart_tagging");
  resolveFeatureFromFile("./cypress/integration/SmartTagging.feature");
});

describe("And and But", () => {
  require("../cypress/support/step_definitions/and_and_but_steps");
  resolveFeatureFromFile("./cypress/integration/AndAndButSteps.feature");
});

describe("defineStep", () => {
  require("../cypress/support/step_definitions/usingDefineSteps");
  resolveFeatureFromFile("./cypress/integration/DefineStep.feature");
});
