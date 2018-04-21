# Changelog
All notable changes to this project will be documented in this file.

## [1.0.0] - 2018-04-21

### Added
Regular expressions working in step definitions ( #42 - thanks to @stevepkuo for reporting !)
### Changed
Scenarios run as single steps now. ( #44 / #43  - thanks so much to @BenoitAverty not only for the PR but for the courage to question the status quo/think outside of the box here :) )
This has a downside of less readable/uglier test reports, but allows realistically testing of real-world web applications. We will revisit once Cypress makes necessary adjustments - cypress-io/cypress#686

## [0.6.0] - 2018-04-09
### Added
Support for typescript ( #32 - thanks to @StefanNieuwenhuis  for the PR !)
## [0.5.0] - 2018-04-04

### Added
Support for Background section ( #21 - thanks to @jmozgawa for implementing this! )

## [0.4.0] - 2018-04-03
### Fixed
Requiring files ( #30 - reported by @0xR )

### Changed
Given, When, Then are interchangeable now. Also - And/But works as well. ( #31 , #28 - thanks to @GregorD1 @jbbn and @imageica for reporting )
fileServerFolder option is not the preferred way to set path to step_definition anymore. We use cosmiconfig now. ( #16 - thanks to @reaktivo @dvelasquez for reporting and discussion )

## [0.3.0] - 2018-03-14
### Changed
Scenario will skip steps after the first failing one ( #23 - reported by @reaktivo )

## [0.2.0] - 2018-02-28
### Added
Support for Scenario Outlines ( #11 Thanks @mbaranovski !)

### Tests
Wallaby and jest configurations for super nice development experience ( Thanks @mbaranovski !)

## [0.1.0] - 2018-02-18
### Added
Support for datatables and docstrings ( #7 Thanks @fcurella !)

Allow custom dir config ( #5 Thanks @dvelasquez !)

Tests and CircleCI integration! (@lgandecki)

Changelog!

### Changed
Readme: fix configuration error (#11 Thanks @alopezsanchez !)

Updated Readme with TODO

### Code Style
Added and enforced prettier with eslint (@lgandecki)
