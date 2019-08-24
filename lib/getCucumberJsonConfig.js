const cosmiconfig = require("cosmiconfig");
const log = require("debug")("cypress:cucumber");

exports.getCucumberJsonConfig = () => {
  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();

  const cucumberJson =
    loaded && loaded.config && loaded.config.cucumberJson
      ? loaded.config.cucumberJson
      : { generate: false };
  log("cucumber.json", JSON.stringify(cucumberJson));

  return cucumberJson;
};
