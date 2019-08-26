const cosmiconfig = require("cosmiconfig");

exports.isNonGlobalStepDefinitionsMode = () => {
  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  return loaded && loaded.config && loaded.config.nonGlobalStepDefinitions;
};
