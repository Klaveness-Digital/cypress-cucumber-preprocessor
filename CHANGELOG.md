# Changelog

All notable changes to this project will be documented in this file.

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
