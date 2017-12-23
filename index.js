'use strict'

const fs = require('fs');

const browserify = require('@cypress/browserify-preprocessor')

const log = require('debug')('cypress:cucumber')


const createCucumber = (spec, definitions) => {
  const cucumberFile =  `
  const {Parser, Compiler} = require('gherkin');
  const {resolveAndRunStepDefinition, loadStepDefinitions} = require('./resolveStepDefinition');
  const definitions = ${definitions}
  loadStepDefinitions(definitions)
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);
  gherkinAst.feature.children.forEach(createTestFromScenario);
  
  function createTestFromScenario (scenario) {
    console.log("Gandecki scenario", scenario);
    describe(scenario.name, function() {
        scenario.steps.map(
          step => it(step.text, function() {
            resolveAndRunStepDefinition(step)
          })
        )
      }
    )
  }`
  console.log("Gandecki cucumberFile", cucumberFile);
  return cucumberFile
}

// export a function that returns another function, making it easy for users
// to configure like so:
//
// on('file:preprocessor', cucumberPreprocessor(options))
//
console.log("process.cwd before running", process.cwd())

const preprocessor = () => {
  console.log("process.cwd when running", process.cwd())
  console.log("Gandecki __dirname", __dirname);
  // we return function that accepts the arguments provided by
  // the event 'file:preprocessor'
  return (file) => {
    log('get', file.filePath)
    if (file.filePath.match('.feature$')) {
      const spec = fs.readFileSync(file.filePath).toString()
      const definitions = JSON.stringify([fs.readFileSync(`${__dirname}/google.js`).toString()])
      console.log("Gandecki definitions", definitions);
      const valueFile = createCucumber(spec, definitions)
      console.log("Gandecki valueFile", valueFile);

      fs.writeFileSync(`${__dirname}/temporary.js`, valueFile)

      file.filePath = `${__dirname}/temporary.js`

    }
    return browserify()(file)

  }
}

module.exports = preprocessor
