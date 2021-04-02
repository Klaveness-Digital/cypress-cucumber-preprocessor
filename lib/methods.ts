import registry from "./registry";

const {
  defineStep,
  Step,
  defineParameterType,
  Before,
  After,
} = registry.methods;

export {
  defineStep as Given,
  defineStep as When,
  defineStep as Then,
  defineStep as And,
  defineStep as But,
  defineStep,
  Step,
  defineParameterType,
  Before,
  After,
};
