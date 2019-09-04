const glob = require("glob");
const cosmiconfig = require("cosmiconfig");
const process = require("process");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const { getStepDefinitionPathsFrom } = require("./getStepDefinitionPathsFrom");

const getStepDefinitionsPaths = filePath => {
  let paths = [];
  const featureBase = stepDefinitionPath();
  const appRoot = process.cwd();
  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  if (loaded && loaded.config && loaded.config.nonGlobalStepDefinitions) {
    let nonGlobalPath = getStepDefinitionPathsFrom(filePath);
    let commonPath = loaded.config.commonPath || `${featureBase}/common/`;

    if (loaded.config.nonGlobalStepBaseDir) {
      const stepBase = `${appRoot}/${loaded.config.nonGlobalStepBaseDir}`;
      nonGlobalPath = nonGlobalPath.replace(featureBase, stepBase);
      commonPath = `${nonGlobalPath}/${loaded.config.commonPath ||
        `${stepBase}/common/`}`;
    }

    const nonGlobalPattern = `${nonGlobalPath}/**/*.+(js|ts)`;
    const commonDefinitionsPattern = `${commonPath}**/*.+(js|ts)`;

    paths = paths.concat(
      glob.sync(nonGlobalPattern),
      glob.sync(commonDefinitionsPattern)
    );
  } else {
    const pattern = `${featureBase}/**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(pattern));
  }
  return paths;
};

module.exports = { getStepDefinitionsPaths };
