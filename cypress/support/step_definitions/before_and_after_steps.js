/* global given, when, then, before, after */
/* eslint-env mocha */

let beforeCounter = 0;
let beforeWithTagCounter = 0;

before(() => {
  beforeCounter += 1;
});

before({ tags: "@withTaggedBefore" }, () => {
  beforeWithTagCounter += 1;
});

before({ tags: "@willNeverRun" }, () => {
  throw new Error("XXX: before hook unexpectedly called.");
});

after({ tags: "@willNeverRun" }, () => {
  throw new Error("XXX: after hook unexpectedly called.");
});

after(() => {
  beforeCounter = 0;
});

after({ tags: "@withTaggedAfter" }, () => {
  beforeWithTagCounter = 0;
});

given("I do something", () => {});

when("Something else", () => {});

then("Before was called once", () => {
  expect(beforeCounter).to.equal(1);
});

then("Before with tag was called once", () => {
  expect(beforeWithTagCounter).to.equal(1);
});

then("Before was not called", () => {
  expect(beforeCounter).to.equal(1);
});
