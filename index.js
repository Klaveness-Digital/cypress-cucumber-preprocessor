'use strict'

const fs = require('fs');

const browserify = require('@cypress/browserify-preprocessor')

const log = require('debug')('cypress:cucumber')

const glob = require('glob')

// export a function that returns another function, making it easy for users
// to configure like so:
//
// on('file:preprocessor', cucumberPreprocessor(options))


const preprocessor = () => {
  // we return function that accepts the arguments provided by
  // the event 'file:preprocessor'
  return (file) => {
    log('get', file.filePath)
    if (file.filePath.match('.feature$')) {

      const pattern = `${process.cwd()}/cypress/support/step_definitions/**.js`
      const stepDefinitionsPaths = [].concat(glob.sync(pattern));

      const definitions = []
      stepDefinitionsPaths.forEach(path => {
          definitions.push(
            `{ ${fs.readFileSync(path).toString()} }`
          )
        }
      )

      const spec = fs.readFileSync(file.filePath).toString()
      const valueFile = createCucumber(spec, JSON.stringify(definitions))

      const parts = file.filePath.split("/")
      const originalFileName = parts[parts.length -1];
      const temporaryFileName = `${__dirname}/temporary-${originalFileName}.js`

      fs.writeFileSync(temporaryFileName, valueFile)

      file.filePath = temporaryFileName

    }
    return browserify()(file)

  }
}

module.exports = preprocessor

//This is the template for the file that we will send back to cypress instead of the text of a feature file
const createCucumber = (spec, definitions) => {
  const cucumberFile =  `
  ${eval(definitions).join('\n')}
  const {Parser, Compiler} = require('gherkin');
  const {resolveAndRunStepDefinition} = require('./resolveStepDefinition');
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);
  gherkinAst.feature.children.forEach(createTestFromScenario);
  
  function createTestFromScenario (scenario) {
    describe(scenario.name, () => {
        scenario.steps.map(
          step => it(step.text, () => {
            resolveAndRunStepDefinition(step)
          })
        )
      }
    )
  }`
  return cucumberFile
}