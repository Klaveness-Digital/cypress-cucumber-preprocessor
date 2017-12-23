// const glob = require('glob');
const path = require('path');

// const stepDefinitionsPaths = [].concat(glob.sync(pattern));

const {CucumberExpression, ParameterTypeRegistry} = require('cucumber-expressions');


const parameterTypeRegistry = new ParameterTypeRegistry();


// const stepDefinitionPaths = ['./google.js']
//
// A global registry to load load and resolve all step definitions
//

class StepDefinitionRegistry {
  constructor() {
    this.definitions = {};
    this.runtime = {};
    this.latestType = '';

    ['given', 'when', 'then'].forEach(keyword => {
      this.definitions[keyword] = [];
      this.runtime[keyword] = (expression, implementation) => {
        this.definitions[keyword].push({

          implementation,
          expression: new CucumberExpression(expression, parameterTypeRegistry)
        })
      };
    })

    this.load = definitionFactoryFunction => definitionFactoryFunction(this.runtime);

    this.resolve = (type, text) => {
      if (type === 'and') {
        type = this.latestType;
      }

      if (this.definitions[type]) {
        this.latestType = type;
        console.log("Gandecki text", text);
        return this.definitions[type].filter(({expression}) => expression.match(text))[0]
      }
    }
  }

};
//
// Initialize a sole instance of the registry
//
const stepDefinitionRegistry = new StepDefinitionRegistry();

//
// Load all step definitions
//



//
// Given a step from a gherkin AST, this will find the corresponding step definition or
// return an empty object, if there is none
//
function resolveStepDefinition(step) {
  const stepDefinition = stepDefinitionRegistry.resolve(step.keyword.toLowerCase().trim(), step.text);

  return stepDefinition || {};
};

module.exports = {
  resolveAndRunStepDefinition: (step, stepDefinitionRegistry) => {

    console.log('Gandecki stepDefinitionRegistry', stepDefinitionRegistry)
    const {expression, implementation} = resolveStepDefinition(step, stepDefinitionRegistry)
    if (expression && implementation) {
      return implementation(
        ...expression.match(step.text).map(match => match.getValue())
      )
    } else {
      console.warn(`Step implementation missing for: ${step.text}`)
    }
  },
  loadStepDefinitions: (stepDefinitions) => {
    stepDefinitions.forEach(stepDef => {
      console.log("Gandecki path", path);
      const definitionFactoryFunction = eval(stepDef)

      stepDefinitionRegistry.load(definitionFactoryFunction);
    });

  }
}
