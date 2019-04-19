/* eslint-disable global-require */
/* global jest */
const fs = require("fs");
const { createTestsFromFeature } = require("./createTestsFromFeature");

const {
  defineParameterType,
  defineStep,
  when,
  then,
  given,
  and,
  but
} = require("./resolveStepDefinition");

const mockedPromise = jest.fn().mockImplementation(() => Promise.resolve(true));

window.defineParameterType = defineParameterType;
window.when = when;
window.then = then;
window.given = given;
window.and = and;
window.but = but;
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

window.before = jest.fn();
window.after = jest.fn();

window.Cypress = {
  env: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
};

const resolveFeatureFromFile = featureFile => {
  const spec = fs.readFileSync(featureFile);
  createTestsFromFeature(featureFile, spec);
};

module.exports = {
  resolveFeatureFromFile
};
