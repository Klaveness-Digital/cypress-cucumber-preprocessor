exports.cucumberTemplate = `  
const {
  resolveAndRunStepDefinition,
  defineParameterType,
  given,
  when,
  then,
  and,
  but,
  Before,
  After,
  defineStep
} = require("cypress-cucumber-preprocessor/lib/resolveStepDefinition");
const Given = (window.Given = window.given = given);
const When = (window.When = window.when = when);
const Then = (window.Then = window.then = then);
const And = (window.And = window.and = and);
const But = (window.But = window.but = but);
window.defineParameterType = defineParameterType;
window.defineStep = defineStep;
const {
  createTestsFromFeature
} = require("cypress-cucumber-preprocessor/lib/createTestsFromFeature");
`;
