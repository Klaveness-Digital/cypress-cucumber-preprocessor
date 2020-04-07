const path = require("path");
const glob = require("glob");
const { getConfig } = require("./getConfig");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const { getStepDefinitionPathsFrom } = require("./getStepDefinitionPathsFrom");

const getStepDefinitionsPaths = filePath => {
  const appRoot = process.cwd();
  let paths = [];
  const config = getConfig();
  if (config && config.nonGlobalStepDefinitions) {
    const nonGlobalPattern = `${getStepDefinitionPathsFrom(
      filePath
    )}/**/*.+(js|ts)`;

    let commonPath = config.commonPath || `${stepDefinitionPath()}/common/`;

    if (config.commonPath) {
      commonPath = path.resolve(appRoot, commonPath);
    }
    const commonDefinitionsPattern = `${commonPath}**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(nonGlobalPattern));
    paths = paths.concat(glob.sync(commonDefinitionsPattern));
  } else {
    const pattern = `${stepDefinitionPath()}/**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(pattern));
  }
  return paths;
};

module.exports = { getStepDefinitionsPaths };
