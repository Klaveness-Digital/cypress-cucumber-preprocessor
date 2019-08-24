const glob = require("glob");
const path = require("path");
const fs = require("fs");
const { Parser } = require("gherkin");
const log = require("debug")("cypress:cucumber");

const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
const { cucumberTemplate } = require("./cucumberTemplate");
const { getCucumberJsonConfig } = require("./getCucumberJsonConfig");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (specs, toRequire, cucumberJson) =>
  `
    ${cucumberTemplate}
    
  window.cucumberJson = ${JSON.stringify(cucumberJson)};

  ${toRequire.join("\n")}

  ${specs
    .map(
      ({ spec, filePath, name }) =>
        `
        describe(\`${name}\`, function() {
        createTestsFromFeature('${filePath}', \`${spec}\`);
        })
        `
    )
    .join("\n")}
  `;

module.exports = function(_, filePath) {
  log("compiling", filePath);

  const features = glob.sync(`${path.dirname(filePath)}/**/*.feature`);

  const stepDefinitionsToRequire = [
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

  const specs = features
    .map(featurePath => ({
      spec: fs.readFileSync(featurePath).toString(),
      filePath: path.basename(featurePath)
    }))
    .map(feature =>
      Object.assign({}, feature, {
        name: new Parser().parse(feature.spec.toString()).feature.name
      })
    );

  return createCucumber(
    specs,
    stepDefinitionsToRequire,
    getCucumberJsonConfig()
  );
};
