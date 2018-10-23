/* global then, when */
/* eslint-env mocha */

when("I assign a variable to 'this' object", function() {
  this.testVariable = "testValue";
});

then("'this' object contains the given value", function() {
  expect(this.testVariable).to.equal("testValue");
});
