# Tags

Tests can be filtered using the (Cypress-) [environment variable](https://docs.cypress.io/guides/guides/environment-variables) `TAGS`. Note that the term "environment variable" here does **not** refer to OS-level environment variables.

A feature or scenario can have as many tags as you like, separated by spaces. Tags can be placed above the following Gherkin elements.

* `Feature`
* `scenario`
* `Scenario Outline`
* `Examples`

In `Scenario Outline`, you can use tags on different example like below.

```cucumber
Scenario Outline: Steps will run conditionally if tagged
  Given user is logged in
  When user clicks <link>
  Then user will be logged out

  @mobile
  Examples:
    | link                  |
    | logout link on mobile |

  @desktop
  Examples:
    | link                   |
    | logout link on desktop |
```

It is not possible to place tags above `Background` or steps (`Given`, `When`, `Then`, `And` and `But`).

## Tag inheritance

Tags are inherited by child elements. Tags that are placed above a `Feature` will be inherited by `Scenario`, `Scenario Outline`, or `Examples`. Tags that are placed above a `Scenario Outline` will be inherited by `Examples`.

## Running a subset of scenarios

Normally when running a subset of scenarios using `cypress run --env TAGS=@foo`, you could potentially encounter files containing no matching scenarios. The executable `cypress-tags` exist to first filter Gherkin documents with matching scenarios, thus saving you execution time.

```
$ npx cypress-tags --env TAGS=@foo
```

## Smart tagging

In the absence of a `TAGS` value and presence of a scenario with `@focus`, only said scenario will run. You can in other words use this tag as you would use `.only()` in Mocha.
