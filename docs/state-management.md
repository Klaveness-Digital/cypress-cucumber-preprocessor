# State management

A step definition can transfer state to a subsequent step definition by storing state in instance variables, as shown below.

```ts
import { Given } from "@klaveness/cypress-cucumber-preprocessor";

Given("a step asynchronously assigning to World", function() {
  cy.then(() => {
    this.foo = "bar";
  });
});

Given("a step accessing said assignment synchronously", function() {
  expect(this.foo).to.equal("bar");
});
```

Please note that if you use arrow functions, you won’t be able to share state between steps!

## Replicating `setWorldConstructor`

Even though `setWorldConstructor` isn't implemented, it's behavior can be closely replicated like shown below.

```gherkin
# cypress/integration/math.feature
Feature: Replicating setWorldConstructor()
  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2
```

```ts
// cypress/support/index.ts
beforeEach(function () {
  const world = {
    variable: 0,

    setTo(number) {
      this.variable = number;
    },

    incrementBy(number) {
      this.variable += number;
    }
  };

  Object.assign(this, world);
});
```

```ts
// cypress/support/step_definitions/steps.js
import { Given, When, Then } from "@klaveness/cypress-cucumber-preprocessor";

Given("a variable set to {int}", function(number) {
  this.setTo(number);
});

When("I increment the variable by {int}", function(number) {
  this.incrementBy(number);
});

Then("the variable should contain {int}", function(number) {
  expect(this.variable).to.equal(number);
});
````
