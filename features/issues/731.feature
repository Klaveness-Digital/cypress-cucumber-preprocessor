# https://github.com/badeball/cypress-cucumber-preprocessor/issues/731

Feature: blank titles
  Scenario: blank scenario outline title
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario Outline:
          Given a step

          Examples:
            | value |
            | foo   |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", () => {})
      """
    When I run cypress
    Then it passes
