/* eslint-disable no-eval */
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const log = require("debug")("cypress:cucumber");
const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (specs, toRequire) =>
  `
  const {resolveAndRunStepDefinition, defineParameterType, given, when, then, and, but, defineStep} = require('cypress-cucumber-preprocessor/lib/resolveStepDefinition');
  const Given = window.Given = window.given = given;
  const When = window.When = window.when = when;
  const Then = window.Then = window.then = then;
  const And = window.And = window.and = and;
  const But = window.But = window.but = but;
  window.defineParameterType = defineParameterType;
  window.defineStep = defineStep;

  const { createTestsFromFeature } = require('cypress-cucumber-preprocessor/lib/createTestsFromFeature');
  ${eval(toRequire).join("\n")}
  const {Parser, Compiler} = require('gherkin');

  ${specs
    .map(spec => `createTestsFromFeature(new Parser().parse(\`${spec}\`))`)
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

  const specs = features.map(featurePath =>
    fs.readFileSync(featurePath).toString()
  );

  return createCucumber(specs, stepDefinitionsToRequire);
};
