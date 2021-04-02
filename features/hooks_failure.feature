Feature: hooks failure
  Scenario: step fails with after hook
    Given a file named "cypress/integration/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          When a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { When, After } = require("@badeball/cypress-cucumber-preprocessor/methods");
      When("a step", function() {
        throw new Error("foobar");
      });
      After(() => {
        cy.writeFile("after-hook.txt", "");
      });
      """
    When I run cypress
    Then it fails
    But I should nonetheless see a file named "after-hook.txt"
