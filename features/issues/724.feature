# https://github.com/badeball/cypress-cucumber-preprocessor/issues/724

Feature: outputting merely messages
  Scenario: enabling *only* messages
    Given additional preprocessor configuration
      """
      {
        "messages": {
          "enabled": true
        }
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    When I run cypress
    Then it passes
    And there should be no JSON output
    But there should be a messages report
