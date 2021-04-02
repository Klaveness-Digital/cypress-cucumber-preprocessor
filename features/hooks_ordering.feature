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
      const assert = require("assert")
      const {
        Given,
        Before,
        After
      } = require("@badeball/cypress-cucumber-preprocessor/methods")
      let counter;
      before(function() {
        counter = 0;
      })
      Before(function() {
        assert.equal(counter++, 0, "Expected Before() to be called before beforeEach()")
      })
      beforeEach(function() {
        assert.equal(counter++, 1, "Expected beforeEach() to be called after before()")
      })
      Before(function() {
        assert.equal(counter++, 2, "Expected Before() to also be called after beforeEach()")
      })
      Given("a background step", function() {
        assert.equal(counter++, 3, "Expected a background step to be called after Before()")
      })
      Given("an ordinary step", function() {
        assert.equal(counter++, 4, "Expected an ordinary step to be called after a background step")
      })
      After(function() {
        assert.equal(counter++, 5, "Expected After() to be called after ordinary steps")
      })
      afterEach(function() {
        assert.equal(counter++, 6, "Expected afterEach() to be called after After()")
      })
      After(function() {
        assert.equal(counter++, 7, "Expected After() to also be called after afterEach")
      })
      after(function() {
        assert.equal(counter++, 8, "Expected after() to be called after afterEach()")
      })
      """
    When I run cypress
    Then it passes
