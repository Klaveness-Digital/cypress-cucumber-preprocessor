const {CucumberExpression, ParameterTypeRegistry} = require('cucumber-expressions');

const parameterTypeRegistry = new ParameterTypeRegistry();
console.log(parameterTypeRegistry)

module.exports = function defineSteps({given, when, then}) {
  given('I am open Googles search page', () => {
    cy.visit('https://example.cypress.io')
  });

  when('I am typing my search request {string} on Google', (searchRequest) => {
    cy.title().should('include', searchRequest)
  });

  then('I am pressing {string} key on Google', (key) => {
    return cy.get("something")
  });

  then('I should see that the first Googles result is {string}', (expectedSearchResult) => {
    cy.get('#rso a')

    // return t.expect(firstLink.innerText).contains(expectedSearchResult);
  });
}