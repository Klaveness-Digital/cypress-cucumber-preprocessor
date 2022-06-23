# https://github.com/badeball/cypress-cucumber-preprocessor/issues/736

Feature: create output directories
  Background:
    Given additional preprocessor configuration
      """
      {
        "messages": {
          "enabled": true,
          "output": "foo/cucumber-messages.ndjson"
        },
        "json": {
          "enabled": true,
          "output": "bar/cucumber-report.json"
        }
      }
      """
    And I've ensured cucumber-json-formatter is installed

  Scenario:
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@klaveness/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    When I run cypress
    Then it passes
