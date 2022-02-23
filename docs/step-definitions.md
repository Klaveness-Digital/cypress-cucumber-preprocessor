# Step definitions

Step definitions are resolved using search paths that are configurable through the `stepDefinitions` property. The preprocessor uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), which means you can place configuration options in EG. `.cypress-cucumber-preprocessorrc.json` or `package.json`. The default search paths are shown below.

```json
{
  "stepDefinitions": [
    "cypress/integration/[filepath]/**/*.{js,ts}",
    "cypress/integration/[filepath].{js,ts}",
    "cypress/support/step_definitions/**/*.{js,ts}",
  ]
}
```

This means that if you have a file `cypress/integration/duckduckgo.feature`, it will match step definitions found in

* `cypress/integration/duckduckgo/steps.ts`
* `cypress/integration/duckduckgo.ts`
* `cypress/support/step_definitions/duckduckgo.ts`

## Hierarchy

There's also a `[filepart]` option available. Given a configuration shown below

```json
{
  "stepDefinitions": [
    "cypress/integration/[filepart]/step_definitions/**/*.{js,ts}"
  ]
}
```

... and a feature file `cypress/integration/foo/bar/baz.feature`, the preprocessor would look for step definitions in

* `cypress/integration/foo/bar/baz/step_definitions/**/*.{js,ts}`
* `cypress/integration/foo/bar/step_definitions/**/*.{js,ts}`
* `cypress/integration/foo/step_definitions/**/*.{js,ts}`
* `cypress/integration/step_definitions/**/*.{js,ts}`
