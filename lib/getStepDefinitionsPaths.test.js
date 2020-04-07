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

    jest.mock("fs");
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
});
