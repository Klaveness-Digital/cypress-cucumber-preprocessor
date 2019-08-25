const glob = require("glob");
const path = require("path");
const fs = require("fs");
const { Parser } = require("gherkin");
const log = require("debug")("cypress:cucumber");

const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
const { cucumberTemplate } = require("./cucumberTemplate");
const { getCucumberJsonConfig } = require("./getCucumberJsonConfig");
const {
  isNonGlobalStepDefinitionsMode
} = require("./isNonGlobalStepDefinitionsMode");

const createCucumber = (
  specs,
  globalToRequire,
  nonGlobalToRequire,
  cucumberJson
) =>
  `
    ${cucumberTemplate}
    
  window.cucumberJson = ${JSON.stringify(cucumberJson)};

  ${globalToRequire.join("\n")}

  ${specs
    .map(
      ({ spec, filePath, name }) => `
        describe(\`${name}\`, function() {
        ${nonGlobalToRequire &&
          nonGlobalToRequire
            .find(fileSteps => fileSteps[filePath])
            [filePath].join("\n")}
            
        createTestsFromFeature('${path.basename(filePath)}', \`${spec}\`);
        })
        `
    )
    .join("\n")}
  `;

module.exports = function(_, filePath) {
  log("compiling", filePath);

  const features = glob.sync(`${path.dirname(filePath)}/**/*.feature`);

  let globalStepDefinitionsToRequire = [];
  let nonGlobalStepDefinitionsToRequire;

  if (isNonGlobalStepDefinitionsMode()) {
    nonGlobalStepDefinitionsToRequire = features.map(featurePath => ({
      [featurePath]: getStepDefinitionsPaths(featurePath).map(
        sdPath => `require('${sdPath}')`
      )
    }));
  } else {
    globalStepDefinitionsToRequire = [
      ...new Set(
        features.reduce(
          requires =>
            requires.concat(
              getStepDefinitionsPaths(filePath).map(
                sdPath => `require('${sdPath}')`
              )
            ),
          []
        )
      )
    ];
  }

  const specs = features
    .map(featurePath => ({
      spec: fs.readFileSync(featurePath).toString(),
      filePath: featurePath
    }))
    .map(feature =>
      Object.assign({}, feature, {
        name: new Parser().parse(feature.spec.toString()).feature.name
      })
    );

  return createCucumber(
    specs,
    globalStepDefinitionsToRequire,
    nonGlobalStepDefinitionsToRequire,
    getCucumberJsonConfig()
  );
};
