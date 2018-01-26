const path = require('path');

const { CucumberExpression, ParameterTypeRegistry } = require('cucumber-expressions');

const parameterTypeRegistry = new ParameterTypeRegistry();

class StepDefinitionRegistry {
  constructor() {
    this.definitions = {};
    this.runtime = {};
    this.latestType = '';

    ['given', 'when', 'then'].forEach((keyword) => {
      this.definitions[keyword] = [];
      this.runtime[keyword] = (expression, implementation) => {
        this.definitions[keyword].push({

          implementation,
          expression: new CucumberExpression(expression, parameterTypeRegistry),
        });
      };
    });

    this.load = definitionFactoryFunction => definitionFactoryFunction(this.runtime);

    this.resolve = (type, text) => {
      if (type === 'and') {
        type = this.latestType;
      }

      if (this.definitions[type]) {
        this.latestType = type;
        return this.definitions[type].filter(({ expression }) => expression.match(text))[0];
      }
    };
  }

}

const stepDefinitionRegistry = new StepDefinitionRegistry();

function resolveStepDefinition(step) {
  const stepDefinition = stepDefinitionRegistry.resolve(step.keyword.toLowerCase().trim(), step.text);

  return stepDefinition || {};
}

module.exports = {
  resolveAndRunStepDefinition: (step) => {
    const { expression, implementation } = resolveStepDefinition(step);
    if (expression && implementation) {
      return implementation(
        ...expression.match(step.text).map(match => match.getValue()),
      );
    }
    throw new Error(`Step implementation missing for: ${step.text}`);
  },
  given: (expression, implementation) => {
    stepDefinitionRegistry.runtime.given(expression, implementation);
  },
  when: (expression, implementation) => {
    stepDefinitionRegistry.runtime.when(expression, implementation);
  },
  then: (expression, implementation) => {
    stepDefinitionRegistry.runtime.then(expression, implementation);
  },
};
