Feature: suite options
  Scenario: suite specific retry
    Given a file named "cypress/e2e/a.feature" with:
      """
      @retries(2)
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      let attempt = 0;
      Given("a step", () => {
        if (attempt++ === 0) {
          throw "some error";
        }
      });
      """
    When I run cypress
    Then it passes
