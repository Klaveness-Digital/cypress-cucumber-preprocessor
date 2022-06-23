# Changelog

All notable changes to this project will be documented in this file.

## v11.2.0

- Enable `*.mjs` file extension by default, when looking for step definitions.

- Add a default export to `@badeball/cypress-cucumber-preprocessor/esbuild`.

- Add examples for CJS and ESM.

## v11.1.0

- Enable test configuration overrides, such as retrability of a single scenario, fixes [#697](https://github.com/badeball/cypress-cucumber-preprocessor/issues/697).

## v11.0.0

Breaking changes:

- Dropped support for Cypress v6.

Other changes:

- Added support for Cypress v10. :tada:

- Untitled scenario outline no longer errors, fixes [#731](https://github.com/badeball/cypress-cucumber-preprocessor/issues/731).

- Outputting *only* messages is now possible, fixes [#724](https://github.com/badeball/cypress-cucumber-preprocessor/issues/724).

- Allow absolute output paths, partially fixes [#736](https://github.com/badeball/cypress-cucumber-preprocessor/issues/736).

- Output directories are automatically created recursively, partially fixes [#736](https://github.com/badeball/cypress-cucumber-preprocessor/issues/736).

### Upgrading to Cypress v10

There's no changes to configuration options, but if your configuration looked like this pre-10

```json
{
  "stepDefinitions": [
    "cypress/integration/[filepath].{js,ts}",
    "cypress/support/step_definitions/**/*.{js,ts}"
  ]
}
```

.. then it should look like this post-10 (notice the removal of `cypress/integration`)

```json
{
  "stepDefinitions": [
    "[filepath].{js,ts}",
    "cypress/support/step_definitions/**/*.{js,ts}"
  ]
}
```

## v10.0.2

- Allow integration folders outside of project root, fixes [#719](https://github.com/badeball/cypress-cucumber-preprocessor/issues/719).

## v10.0.1

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/720) where internal calls to `cy.wrap` was being logged.

## v10.0.0

Breaking changes:

- Exported member `resolvePreprocessorConfiguration` now *requires* a `projectRoot` variable and a `environment` variable.

Other changes:

- Configuration values can now be overriden using (Cypress-) [environment variable](https://docs.cypress.io/guides/guides/environment-variables).

## v9.2.1

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/713) with returning chainables from step definitions.

## v9.2.0

- Allow handlers to be omitted and attached explicitly, fixes [#705](https://github.com/badeball/cypress-cucumber-preprocessor/issues/705) (undocumented, experimental and API is subject to change anytime).

## v9.1.3

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/704) where programmatically skipping a test would error.

## v9.1.2

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/701) where Before hooks would error.

## v9.1.1

- Add timestamps and durations to messages.

## v9.1.0

- Automatically skip tests marked with `@skip`.

## v9.0.5

- Correct types for `isFeature` and `doesFeatureMatch`.

## v9.0.4

- Prevent an error when `experimentalInteractiveRunEvents` is enabled.

## v9.0.3

- Fixed an issue where the preprocessor was throwing in interactive mode when JSON reports was enabled.

## v9.0.2

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/694) when running all specs.

## v9.0.1

Due to an publishing error from my side, this version is identical to v9.0.0.

## v9.0.0

This is the point where [badeball](https://github.com/badeball)'s fork becomes the mainline and replaces [TheBrainFamily](https://github.com/TheBrainFamily)'s implementation. This implementation has been re-written from scratch in TypeScript, has more thorough test coverage and is filled with a bunch of new feature. Read more about the transfer of ownership [here](https://github.com/badeball/cypress-cucumber-preprocessor/issues/689).

The changelog of the two ancestors can be found at

- [TheBrainFamily's history / changelog](https://github.com/badeball/cypress-cucumber-preprocessor/blob/7031d0283330bca814d6923d35d984224622b4cf/CHANGELOG.md)
- [badeball's history / changelog](https://github.com/badeball/cypress-cucumber-preprocessor/blob/v9.0.0/CHANGELOG.md)
