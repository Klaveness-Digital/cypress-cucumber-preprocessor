global.jestExpect = global.expect;
global.expect = require("chai").expect;

window.Cypress = {
  env: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  log: jest.fn(),
  Promise: { each: (iterator, iteree) => iterator.map(iteree) }
};

const {
  defineParameterType,
  defineStep,
  when,
  then,
  given,
  and,
  but,
  before,
  after
} = require("../resolveStepDefinition");

const mockedPromise = jest.fn().mockImplementation(() => Promise.resolve(true));

window.defineParameterType = defineParameterType;
window.when = when;
window.then = then;
window.given = given;
window.and = and;
window.but = but;
window.before = before;
window.after = after;
window.defineStep = defineStep;
window.cy = {
  log: jest.fn(),
  logStep: mockedPromise,
  startScenario: mockedPromise,
  finishScenario: mockedPromise,
  startStep: mockedPromise,
  finishStep: mockedPromise,
  finishTest: mockedPromise,
  then: mockedPromise,
  end: mockedPromise
};
