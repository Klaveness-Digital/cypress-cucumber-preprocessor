# Changelog

All notable changes to this project will be documented in this file.

## v7.0.1

- Reduce reliability on internal properties of cypress + mocha

## v7.0.0

Breaking changes

- Removed support for Cypress v4 and v5

Other changes

- Add Cypress v9 to supported versions

- Added support for reporting messages and thereby generating a JSON report

- Expanded readme and documentation by a lot, making them more inviting

- Updated dependency on @cucumber/cucumber-messages

## v6.0.0

- Removed `resolveCypressConfiguration` and `resolveCypressEnvironment` (these are now available as a separate library)

## v5.1.0

- Add Cypress v8 to supported versions

## v5.0.0

Breaking changes

- Further rewamped configuration of step definition location

## v4.1.0

- Fixed an issue preventing use with webpack

- Fixed an issue preventing use with browserify

## v4.0.0

Breaking changes

- Renaming `IConfiguration ~> IPreprocessorConfiguration`

- Options are no longer optional in `resolveConfiguration` and `resolveEnvironment`

- Rewamped configuration of step definition location

Other changes

- Configuration values are now validated

## v3.5.0

- Add Cypress v6 and v7 to supported versions

## v3.4.0

- Implement Before & After using beforeEach & afterEach (this makes them share semantics, such as running After hooks after test
failure)

## v3.3.0

- Export DataTable

## v3.2.0

- Refactoring to avoid including Lodash

## v3.1.0

- Allow hooks to be defined in `support/index.js`

## v3.0.0

Breaking changes

- Update dependency on `@cypress/browserify-preprocessor`

## v2.3.0

- Added `cypress-tags` executable

## v2.2.0

- Fixed types for Before() & After()

## v2.1.0

- Improve ability to retain values between step definitions

## v2.0.0

Breaking changes

- Removed support for Cypress v3

Other changes

- Added support for Cypress v4 and v5

## v1.0.0

Initial release.
