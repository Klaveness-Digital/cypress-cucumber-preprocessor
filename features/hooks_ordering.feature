Feature: hooks ordering

  Hooks should be executed in the following order:
   - before
   - beforeEach / Before
   - Background steps
   - Ordinary steps
   - afterEach / After
   - after
  .. where the order of exection defines order among beforeEach / Before and afterEach / After.

  Scenario: with all hooks incrementing a counter
    Given a file named "cypress/integration/a.feature" with:
      """
      Feature: a feature
        Background:
          Given a background step
        Scenario: a scenario
          Given an ordinary step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const {
        Given,
        Before,
        After
      } = require("@badeball/cypress-cucumber-preprocessor")
      let counter;
      before(function() {
        counter = 0;
      })
      Before(function() {
        expect(counter++, "Expected Before() to be called before beforeEach()").to.equal(0)
      })
      beforeEach(function() {
        expect(counter++, "Expected beforeEach() to be called after before()").to.equal(1)
      })
      Before(function() {
        expect(counter++, "Expected Before() to also be called after beforeEach()").to.equal(2)
      })
      Given("a background step", function() {
        expect(counter++, "Expected a background step to be called after Before()").to.equal(3)
      })
      Given("an ordinary step", function() {
        expect(counter++, "Expected an ordinary step to be called after a background step").to.equal(4)
      })
      After(function() {
        expect(counter++, "Expected After() to be called after ordinary steps").to.equal(5)
      })
      afterEach(function() {
        expect(counter++, "Expected afterEach() to be called after After()").to.equal(6)
      })
      After(function() {
        expect(counter++, "Expected After() to also be called after afterEach").to.equal(7)
      })
      after(function() {
        expect(counter++, "Expected after() to be called after afterEach()").to.equal(8)
      })
      """
    When I run cypress
    Then it passes
