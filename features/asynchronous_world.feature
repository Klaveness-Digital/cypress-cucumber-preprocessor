Feature: asynchronous world

  Scenario: Assigning to world asynchronously
    Given a file named "cypress/integration/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step asynchronously assigning to World
          And a step accessing said assignment synchronously
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const assert = require("assert")
      const { Given } = require("@badeball/cypress-cucumber-preprocessor/methods");
      Given("a step asynchronously assigning to World", function() {
        cy.then(() => {
          this.foo = "bar";
        });
      });
      Given("a step accessing said assignment synchronously", function() {
        assert.equal(this.foo, "bar");
      });
      """
    When I run cypress
    Then it passes
