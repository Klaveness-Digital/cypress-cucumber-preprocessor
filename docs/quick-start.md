# Installation

```
$ npm install @badeball/cypress-cucumber-preprocessor
```

# Configuration

[Configure](https://docs.cypress.io/guides/references/configuration) `testFiles` with `"**/*.feature"`, using EG. `cypress.json`.

```json
{
  "testFiles": "**/*.feature"
}
```

Configure your preferred bundler to process features files, with examples for

* [Browserify](../examples/browserify)
* [Webpack](../examples/webpack)
* [Esbuild](../examples/esbuild)

Read more about configuration options at [docs/configuration.md](configuration.md).

# Write a test

Write Gherkin documents anywhere in your configured integration folder (defaults to `cypress/integration`) and add a file for type definitions with a corresponding name (read more about how step definitions are resolved in [docs/step-definitions.md](step-definitions.md)). Reading [docs/cucumber-basics.md](cucumber-basics.md) is highly recommended.

```cucumber
# cypress/integration/duckduckgo.feature
Feature: duckduckgo.com
  Scenario: visting the frontpage
    When I visit duckduckgo.com
    Then I should see a search bar
```

```ts
// cypress/integration/duckduckgo.ts
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I visit duckduckgo.com", () => {
  cy.visit("https://www.duckduckgo.com");
});

Then("I should see a search bar", () => {
  cy.get("input").should(
    "have.attr",
    "placeholder",
    "Search the web without being tracked"
  );
});
```
