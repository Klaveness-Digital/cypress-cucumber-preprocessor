@no-default-plugin
Feature: browserify + typescript
  Scenario:
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/plugins/index.js" or "setupNodeEvents.js" (depending on Cypress era) with:
      """
<<<<<<< HEAD
      import browserify from "@cypress/browserify-preprocessor";
      import { preprocessor } from "@klaveness/cypress-cucumber-preprocessor/browserify";
=======
      const browserify = require("@cypress/browserify-preprocessor");
      const { preprocessor } = require("@klaveness/cypress-cucumber-preprocessor/browserify");
>>>>>>> master

      module.exports = async (on, config) => {
        on(
          "file:preprocessor",
          preprocessor(config, {
            ...browserify.defaultOptions,
            typescript: require.resolve("typescript")
          })
        );
      };
      """
    And a file named "cypress/support/step_definitions/steps.ts" with:
      """
      import { Given } from "@klaveness/cypress-cucumber-preprocessor";
      Given("a step", function(this: Mocha.Context) {});
      """
    When I run cypress
    Then it passes
