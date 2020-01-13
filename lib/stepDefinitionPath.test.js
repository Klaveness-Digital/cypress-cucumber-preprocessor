const fs = require("fs");
const cosmiconfig = require("cosmiconfig");
const stepDefinitionPath = require("./stepDefinitionPath.js");

jest.mock("fs", () => ({
  existsSync: jest.fn()
}));

jest.mock("cosmiconfig");

const defaultNonGlobalStepDefinitionsPath = "cypress/integration";

describe("load path from step definitions", () => {
  beforeEach(() => {
    cosmiconfig.mockReset();
    fs.existsSync.mockReset();
  });

  test("Should throw an error if nonGlobalStepDefinitions and stepDefinitions are not set and the default is wrong", () => {
    const COMICONFIG_FILEPATH = "package.json";
    const loadMock = jest.fn().mockReturnValue({
      config: {
        nonGlobalStepDefinitions: true
      },
      filepath: COMICONFIG_FILEPATH
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.existsSync.mockReturnValue(false);

    const errorMessage = `We've tried to resolve your step definitions at ${defaultNonGlobalStepDefinitionsPath}, but that doesn't seem to exist. As of version 2.0.0 it's required to set step_definitions in your cypress-cucumber-preprocessor configuration. Currently your configuration is in: ${COMICONFIG_FILEPATH}. Look for nonGlobalStepDefinitions and add stepDefinitions right next to it. It should match your cypress configuration has set for integrationFolder. We no longer rely on getting information from that file as it was unreliable and problematic across Linux/MacOS/Windows especially since the config file could have been passed as an argument to cypress.`;
    expect(stepDefinitionPath).throw(errorMessage);
  });

  test("Should throw an error if nonGlobalStepDefinitions and stepDefinitions are set but the folder doesn't exist", () => {
    const COMICONFIG_FILEPATH = "package.json";
    const stepDefinitions = "cypress/stepDefinitions";
    const loadMock = jest.fn().mockReturnValue({
      config: {
        nonGlobalStepDefinitions: true,
        stepDefinitions
      },
      filepath: COMICONFIG_FILEPATH
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.existsSync.mockReturnValue(false);

    const errorMessage = `We've tried to resolve your step definitions at ${stepDefinitions}, but that doesn't seem to exist. As of version 2.0.0 it's required to set step_definitions in your cypress-cucumber-preprocessor configuration. Currently your configuration is in: ${COMICONFIG_FILEPATH}. Look for nonGlobalStepDefinitions and add stepDefinitions right next to it. It should match your cypress configuration has set for integrationFolder. We no longer rely on getting information from that file as it was unreliable and problematic across Linux/MacOS/Windows especially since the config file could have been passed as an argument to cypress.`;
    expect(stepDefinitionPath).throw(errorMessage);
  });

  test("should use the default stepDefinitions path for nonGlobalStepDefinitions", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        nonGlobalStepDefinitions: true
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.existsSync.mockReturnValue(true);

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/${defaultNonGlobalStepDefinitionsPath}`
    );
  });

  test("should use the stepDefinitions path for nonGlobalStepDefinitions", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        stepDefinitions: "./e2e/support/step-definitions",
        nonGlobalStepDefinitions: true
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.existsSync.mockReturnValue(true);

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/e2e/support/step-definitions`
    );
  });

  test("should use the stepDefinitions path", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        stepDefinitions: "./e2e/support/step-definitions"
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.existsSync.mockReturnValue(true);

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/e2e/support/step-definitions`
    );
  });

  test("should return default path if stepDefinition are not configured and nonGlobalStepDefinitions are not set", () => {
    const appRoot = process.cwd();
    cosmiconfig.mockReturnValue({
      load: jest.fn()
    });

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/cypress/support/step_definitions`
    );
  });

  test("should allow the backward compatible use of step_definitions in cosmiconfig", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        step_definitions: "./e2e/support/step-definitions"
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.existsSync.mockReturnValue(true);

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/e2e/support/step-definitions`
    );
  });
});
