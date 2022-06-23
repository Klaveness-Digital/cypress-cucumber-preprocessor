# Test configuration

Some of Cypress' [configuration options](https://docs.cypress.io/guides/references/configuration) can be overridden per-test by leveraging tags. Below are all supported configuration options shown.

```gherkin
@animationDistanceThreshold(5)
@blockHosts('http://www.foo.com','http://www.bar.com')
@defaultCommandTimeout(5)
@execTimeout(5)
@includeShadowDom(true)
@includeShadowDom(false)
@keystrokeDelay(5)
@numTestsKeptInMemory(5)
@pageLoadTimeout(5)
@redirectionLimit(5)
@requestTimeout(5)
@responseTimeout(5)
@retries(5)
@retries(runMode=5)
@retries(openMode=5)
@retries(runMode=5,openMode=10)
@retries(openMode=10,runMode=5)
@screenshotOnRunFailure(true)
@screenshotOnRunFailure(false)
@scrollBehavior('center')
@scrollBehavior('top')
@scrollBehavior('bottom')
@scrollBehavior('nearest')
@slowTestThreshold(5)
@viewportHeight(720)
@viewportWidth(1280)
@waitForAnimations(true)
@waitForAnimations(false)
Feature: a feature
  Scenario: a scenario
    Given a table step
```
