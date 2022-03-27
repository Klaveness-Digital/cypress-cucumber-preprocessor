# Expressions

A step definition’s *expression* can either be a regular expression or a [cucumber expression](https://github.com/cucumber/cucumber-expressions#readme). The examples in this section use cucumber expressions. If you prefer to use regular expressions, each *capture group* from the match will be passed as arguments to the step definition’s function.

```ts
Given(/I have {int} cukes in my belly/, (cukes: number) => {});
```

# Arguments

Steps can be accompanied by [doc strings](https://cucumber.io/docs/gherkin/reference/#doc-strings) or [data tables](https://cucumber.io/docs/gherkin/reference/#data-tables), both which will be passed to the step definition as the last argument, as shown below.

```gherkin
Feature: a feature
  Scenario: a scenario
    Given a table step
      | Cucumber     | Cucumis sativus |
      | Burr Gherkin | Cucumis anguria |
```

```ts
import { Given, DataTable } from "@badeball/cypress-cucumber-preprocessor";

Given(/^a table step$/, (table: DataTable) => {
  const expected = [
    ["Cucumber", "Cucumis sativus"],
    ["Burr Gherkin", "Cucumis anguria"]
  ];
  assert.deepEqual(table.raw(), expected);
});
```

See [here](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/data_table_interface.md) for `DataTable`'s interface.

# Custom parameter types

Custom parameter types can be registered using `defineParameterType()`. They share the same scope as tests and you can invoke `defineParameterType()` anywhere you define steps, though the order of definition is unimportant. The table below explains the various arguments you can pass when defining a parameter type.

| Argument      | Description |
| ------------- | ----------- |
| `name`        | The name the parameter type will be recognised by in output parameters.
| `regexp`      | A regexp that will match the parameter. May include capture groups.
| `transformer` | A function or method that transforms the match from the regexp. Must have arity 1 if the regexp doesn't have any capture groups. Otherwise the arity must match the number of capture groups in `regexp`. |

# Pending steps

You can return `"pending"` from a step defintion or a chain to mark a step as pending. This will halt the execution and Cypress will report the test as "skipped".

```ts
import { When } from "@badeball/cypress-cucumber-preprocessor";

When("a step", () => {
  return "pending";
});
```

```ts
import { When } from "@badeball/cypress-cucumber-preprocessor";

When("a step", () => {
  cy.then(() => {
    return "pending";
  });
});
```

# Nested steps

You can invoke other steps from a step using `Step()`, as shown below.

```ts
import { When, Step } from "@badeball/cypress-cucumber-preprocessor";

When("I fill in the entire form", function () {
  Step(this, 'I fill in "john.doe" for "Username"');
  Step(this, 'I fill in "password" for "Password"');
});
```

`Step()` optionally accepts a `DataTable` or `string` argument.

```ts
import {
  When,
  Step,
  DataTable
} from "@badeball/cypress-cucumber-preprocessor";

When("I fill in the entire form", function () {
  Step(
    this,
    "I fill in the value",
    new DataTable([
      ["Field", "Value"],
      ["Username", "john.doe"],
      ["Password", "password"]
    ])
  );
});
```

# Hooks

`Before()` and `After()` is similar to Cypress' `beforeEach()` and `afterEach()`, but they can be selected to conditionally run based on the tags of each scenario, as shown below.

```ts
import { Before } from "@badeball/cypress-cucumber-preprocessor";

Before(function () {
  // This hook will be executed before all scenarios.
});

Before({ tags: "@foo" }, function () {
  // This hook will be executed before scenarios tagged with @foo.
});

Before({ tags: "@foo and @bar" }, function () {
  // This hook will be executed before scenarios tagged with @foo and @bar.
});

Before({ tags: "@foo or @bar" }, function () {
  // This hook will be executed before scenarios tagged with @foo or @bar.
});
```
