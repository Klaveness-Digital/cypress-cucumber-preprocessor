@no-default-plugin
Feature: webpack + typescript
  Scenario:
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/plugins/index.js" or "setupNodeEvents.js" (depending on Cypress era) with:
      """
      const webpack = require("@cypress/webpack-preprocessor");

      module.exports = async (on, config) => {
        on(
          "file:preprocessor",
          webpack({
            webpackOptions: {
              resolve: {
                extensions: [".ts", ".js"]
              },
              module: {
                rules: [
                  {
                    test: /\.ts$/,
                    exclude: [/node_modules/],
                    use: [
                      {
                        loader: "ts-loader"
                      }
                    ]
                  },
                  {
                    test: /\.feature$/,
                    use: [
                      {
                        loader: "@klaveness/cypress-cucumber-preprocessor/webpack",
                        options: config
                      }
                    ]
                  }
                ]
              }
            }
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
