Feature: mixing feature and non-feature specs
  Background:
    Given additional Cypress configuration
      """
      {
        "testFiles": "**/*.{spec.js,feature}"
      }
      """

  Scenario: one feature and non-feature specs
    Given a file named "cypress/integration/a.feature" with:
      """
      @foo
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { When, isFeature, doesFeatureMatch } = require("@klaveness/cypress-cucumber-preprocessor");
      When("a step", function() {
        expect(isFeature()).to.be.true;
        expect(doesFeatureMatch("@foo")).to.be.true;
      });
      """
    And a file named "cypress/integration/b.spec.js" with:
      """
      const { isFeature } = require("@klaveness/cypress-cucumber-preprocessor");
      it("should work", () => {
        expect(isFeature()).to.be.false;
      });
      """
    When I run cypress
    Then it passes
    And it should appear to have ran spec "a.feature" and "b.spec.js"
