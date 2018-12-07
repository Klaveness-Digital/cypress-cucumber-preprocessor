// We know this is a duplicate of ./resolveStepDefinition.
// We will remove that one soon and leave only this one in a future version.

const {
  given,
  when,
  then,
  defineParameterType
} = require("./lib/resolveStepDefinition");

module.exports = {
  given,
  when,
  then,
  Given: given,
  When: when,
  Then: then,
  defineParameterType
};
