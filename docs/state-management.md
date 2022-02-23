# State management

A step definition can transfer state to a subsequent step definition by storing state in instance variables, as shown below.

```ts
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

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
