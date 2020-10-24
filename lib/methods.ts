import registry from "./registry";

const {
  Given,
  When,
  Then,
  Step,
  defineParameterType,
  Before,
  After,
} = registry.methods;

export { Given, When, Then, Step, defineParameterType, Before, After };
