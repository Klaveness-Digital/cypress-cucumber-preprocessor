Feature: configuration overrides
  Scenario: overriding stepDefinitions through -e
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "foobar.js" with:
      """
      const { Given } = require("@klaveness/cypress-cucumber-preprocessor");
      Given("a step", function() {});
      """
    When I run cypress with "-e stepDefinitions=foobar.js"
    Then it passes

  Scenario: overriding stepDefinitions through environment variables
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "foobar.js" with:
      """
      const { Given } = require("@klaveness/cypress-cucumber-preprocessor");
      Given("a step", function() {});
      """
    When I run cypress with environment variables
      | Key                     | Value     |
      | CYPRESS_stepDefinitions | foobar.js |
    Then it passes
