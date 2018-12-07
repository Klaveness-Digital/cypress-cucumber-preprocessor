[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![CircleCI](https://circleci.com/gh/TheBrainFamily/cypress-cucumber-preprocessor.svg?style=shield)](https://circleci.com/gh/TheBrainFamily/cypress-cucumber-preprocessor)
# Run cucumber/gherkin-syntaxed specs with cypress.io

Follow the Setup steps, or if you prefer to hack on a working example, take a look at [https://github.com/TheBrainFamily/cypress-cucumber-example](https://github.com/TheBrainFamily/cypress-cucumber-example
)

## Setup

### Installation
Install this plugin:

```shell
npm install --save-dev cypress-cucumber-preprocessor
```

### Cypress Configuration
Add it to your plugins:

cypress/plugins/index.js
```javascript
const cucumber = require('cypress-cucumber-preprocessor').default
module.exports = (on, config) => {
  on('file:preprocessor', cucumber())
}
```

Step definition files are by default in: cypress/support/step_definitions. If you want to put them somewhere please use [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) format. For example, add to your package.json :

```javascript
  "cypress-cucumber-preprocessor": {
    "step_definitions": "cypress/support/step_definitions/"
  }
```

## Usage
### Feature files

Put your feature files in cypress/integration/

Example: cypress/integration/Google.feature
```gherkin
Feature: The Facebook

  I want to open a social network page

  Scenario: Opening a social network page
    Given I open Google page
    Then I see "google" in the title
```

### Step definitions

Put your step definitions in cypress/support/step_definitions

Examples:
cypress/support/step_definitions/google.js
```javascript
import { Given } from "cypress-cucumber-preprocessor/steps";

const url = 'https://google.com'
Given('I open Google page', () => {
  cy.visit(url)
})
```

cypress/support/step_definitions/shared.js
```javascript
import { Then } from "cypress-cucumber-preprocessor/steps";

Then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})
```

Since Given/When/Then are on global scope please use
```javascript
/* global Given, When, Then */
```
to make IDE/linter happy

or import them directly

### Running

Run your cypress the way you would usually do, for example:

```bash
./node_modules/.bin/cypress open
```

click on a .feature file on the list of specs, and see the magic happening!

### Background section

Adding a background section to your feature will enable you to run steps before every scenario. For example, we have a counter that needs to be reset before each scenario. We can create a given step for resetting the counter. 

```javascript
let counter = 0;

Given("counter has been reset", () => {
  counter = 0;
});

When("counter is incremented", () => {
  counter += 1;
});

Then("counter equals {int}", value => {
  expect(counter).to.equal(value);
});
```

```gherkin
Feature: Background Section
  
   Background:
    Given counter has been reset

   Scenario: Basic example #1
     When counter is incremented
     Then counter equals 1
    
   Scenario: Basic example #2
     When counter is incremented
     When counter is incremented
     Then counter equals 2
```

### Sharing context

You can share context between step definitions using `cy.as()` alias.

Example:
```javascript
Given('I go to the add new item page', () => {
  cy.visit('/addItem');
});

When('I add a new item', () => { 
  cy.get('input[name="addNewItem"]').as('addNewItemInput');
  cy.get('@addNewItemInput').type('My item');
  cy.get('button[name="submitItem"]').click();
})

Then('I see new item added', () => {
  cy.get('td:contains("My item")');
});

Then('I can add another item', () => {
  expect(cy.get('@addNewItemInput').should('be.empty');
});

```

For more information please visit: https://docs.cypress.io/api/commands/as.html


### Tagging tests
You can use tags to select which test should run using [cucumber's tag expressions](https://github.com/cucumber/cucumber/tree/master/tag-expressions).
Keep in mind we are using newer syntax, eg. `'not @foo and (@bar or @zap)'`.
In order to initialize tests using tags you will have to run cypress and pass TAGS environment variable.

Example:
  ```cypress run -e TAGS='not @foo and (@bar or @zap)'```

## Custom Parameter Type Resolves

Thanks to @Oltodo we can now use Custom Parameter Type Resolves. 
Here is an [example](cypress/support/step_definitions/customParameterTypes.js) with related [.feature file](cypress/integration/CustomParameterTypes.feature)

## Cucumber Expressions

We use https://docs.cucumber.io/cucumber/cucumber-expressions/ to parse your .feature file, please use that document as your reference 

## Development

Install all dependencies:
```bash
npm install
```

Link the package:
```bash
npm link 
npm link cypress-cucumber-preprocessor
```

Run tests:
```bash
npm test
```

## Disclaimer

Please let me know if you find any issues or have suggestions for improvements.

## WebStorm Support

If you want WebStorm to resolve your steps, use the capitalized Given/When/Then function names (instead of the initial given/when/then). 
Unfortunately, at this point WebStorm only understands regexp syntax:
 ```javascript
 Given(/^user navigated to the Start page?/, () => { });
```
Or a backtick syntax but without Cucumber Expressions :-(.
In other words, this works:
```javascript
Given(`user navigated to the start page`, () => { });
Then(/(.*?) is chosen/, choice => {})
```

But this doesn't:

```javascript
Then(`{word} is chosen`, choice => {})
```
 (See #56)


## TypeScript

If you want to use TypeScript put this in your plugins/index.js:

```javascript
const cucumber = require("cypress-cucumber-preprocessor").default;
const browserify = require("@cypress/browserify-preprocessor");

module.exports = (on) => {
  const options = browserify.defaultOptions;

  options.browserifyOptions.plugin.unshift(['tsify']);
  // Or, if you need a custom tsconfig.json for your test files:
  // options.browserifyOptions.plugin.unshift(['tsify', {project: 'path/to/other/tsconfig.json'}]);
  
  on("file:preprocessor", cucumber(options));
};
```

...and install tsify. I'm assuming you already have typescript installed. :-)

```bash
npm install tsify
```

Then in your .ts files you need to make sure you either require/import the functions defining step definitions, or declare them as global:

```typescript
declare const Given, When, Then;
// OR
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
```

## Using Webpack

You can also use a Webpack loader to process feature files (TypeScript supported). To see how it is done please take 
a look here 
[cypress-cucumber-webpack-typescript-example](https://github.com/TheBrainFamily/cypress-cucumber-webpack-typescript-example)

## TODO

(Maybe?) Option to customize mocha template ( #3 )

## Credit where it's due!

Based/inspired on great work on https://github.com/sitegeist/gherkin-testcafe , although, with this package we don't have to run cypress programmatically - with an external runner, we can use cypress as we are used to :)

Thanks to the Cypress team for the fantastic work and very exciting tool! :-)

Thanks to @fcurella for fantastic work with making the preprocessor reactive to file changes. :-)
