/* eslint-disable global-require */
jest.mock("./stepDefinitionPath.js", () => () => "stepDefinitionPath");
jest.mock("glob", () => ({
  sync(pattern) {
    return pattern;
  }
}));

let getConfig;

describe("getStepDefinitionsPaths", () => {
  beforeEach(() => {
    jest.resetModules();
    ({ getConfig } = require("./getConfig"));
    jest.unmock("path");
    jest.mock("./getConfig");
  });
  it("should return the default common folder", () => {
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "stepDefinitionPath/common/**/*.+(js|ts)";
    expect(actual).to.include(expected);
  });

  it("should return the common folder defined by the developer", () => {
    jest.mock("path", () => ({
      resolve(appRoot, commonPath) {
        return `./${appRoot}/${commonPath}`;
      },
      extname() {
        return ".js";
      }
    }));

    jest.spyOn(process, "cwd").mockImplementation(() => "cwd");

    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
      commonPath: "myPath/"
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "./cwd/myPath/**/*.+(js|ts)";
    expect(actual).to.include(expected);
  });
  it("should return the default non global step definition pattern", () => {
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true
    });
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
    const path = "stepDefinitionPath/test.feature";
    const actual = getStepDefinitionsPaths(path);
    const expected = "stepDefinitionPath/test/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });

  it("should return the overriden non global step definition pattern if nonGlobalStepBaseDir is defined", () => {
    jest.spyOn(process, "cwd").mockImplementation(() => "cwd");
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
      nonGlobalStepBaseDir: "nonGlobalStepBaseDir"
    });
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
    const path = "stepDefinitionPath/test.feature";
    const actual = getStepDefinitionsPaths(path);
    const expected = "cwd/nonGlobalStepBaseDir/test/**/*.+(js|ts)";

    expect(actual).to.include(expected);
    expect(actual).to.not.include("stepDefinitionPath/test/**/*.+(js|ts)");
  });
});
