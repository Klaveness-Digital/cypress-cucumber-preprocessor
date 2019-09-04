jest.mock("./stepDefinitionPath.js", () => () => "stepDefinitionPath");
jest.mock("glob", () => ({
  sync(pattern) {
    return pattern;
  }
}));

jest.mock("process", () => ({
  cwd: () => "cwd"
}));

describe("getStepDefinitionsPaths", () => {
  it("should return the default common folder", () => {
    jest.resetModules();
    jest.mock("cosmiconfig", () => () => ({
      load: () => ({
        config: {
          nonGlobalStepDefinitions: true
        }
      })
    }));
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "stepDefinitionPath/common/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });
  it("should return the common folder defined by the developper", () => {
    jest.resetModules();
    jest.mock("cosmiconfig", () => () => ({
      load: () => ({
        config: {
          nonGlobalStepDefinitions: true,
          commonPath: "myPath/"
        }
      })
    }));
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "myPath/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });

  it("should return the default non global step definition pattern", () => {
    jest.resetModules();
    jest.mock("cosmiconfig", () => () => ({
      load: () => ({
        config: {
          nonGlobalStepDefinitions: true
        }
      })
    }));
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
    const path = "stepDefinitionPath/test.feature";
    const actual = getStepDefinitionsPaths(path);
    const expected = "stepDefinitionPath/test/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });

  it("should return the overriden non global step definition pattern if nonGlobalStepBaseDir is defined", () => {
    jest.resetModules();
    jest.mock("cosmiconfig", () => () => ({
      load: () => ({
        config: {
          nonGlobalStepDefinitions: true,
          nonGlobalStepBaseDir: "nonGlobalStepBaseDir"
        }
      })
    }));
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
    const path = "stepDefinitionPath/test.feature";
    const actual = getStepDefinitionsPaths(path);
    const expected = "cwd/nonGlobalStepBaseDir/test/**/*.+(js|ts)";

    expect(actual).to.include(expected);
    expect(actual).to.not.include("stepDefinitionPath/test/**/*.+(js|ts)");
  });
});
