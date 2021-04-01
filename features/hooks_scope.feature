Feature: hooks scope
  Scenario: hooks in support/index.js
    Given a file named "cypress/integration/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          When a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const assert = require("assert")
      const { When } = require("@badeball/cypress-cucumber-preprocessor/methods");
      When("a step", function() {
        assert.equal(this.foo, "bar");
      });
      """
    And a file named "cypress/support/index.js" with:
      """
      const { Before } = require("@badeball/cypress-cucumber-preprocessor/methods");
      Before(function () {
        this.foo = "bar";
      });
      """
    When I run cypress
    Then it passes
