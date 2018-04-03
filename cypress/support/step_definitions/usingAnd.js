/* global then, when */
/* eslint-env mocha */

let stepCounter = 0;
when("I do something", () => {
  stepCounter += 1;
});

then("Something else", () => {
  stepCounter += 2;
});

when("I happily work", () => {
  expect(stepCounter).to.equal(3);
});
