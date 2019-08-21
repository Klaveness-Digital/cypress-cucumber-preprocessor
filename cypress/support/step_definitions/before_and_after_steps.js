/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */
const {
  Before,
  After,
  Given,
  Then,
  When
} = require("cypress-cucumber-preprocessor/steps");

let beforeCounter = 0;
let beforeWithTagCounter = 0;

Before(() => {
  beforeCounter += 1;
});

Before({ tags: "@withTaggedBefore" }, () => {
  beforeWithTagCounter += 1;
});

Before({ tags: "@willNeverRun" }, () => {
  throw new Error("XXX: before hook unexpectedly called.");
});

After({ tags: "@willNeverRun" }, () => {
  throw new Error("XXX: after hook unexpectedly called.");
});

After(() => {
  beforeCounter = 0;
});

After({ tags: "@withTaggedAfter" }, () => {
  beforeWithTagCounter = 0;
});

Given("I do something", () => {});

When("Something else", () => {});

Then("Before was called once", () => {
  expect(beforeCounter).to.equal(1);
});

Then("Before with tag was called once", () => {
  expect(beforeWithTagCounter).to.equal(1);
});

Then("Before was not called", () => {
  expect(beforeCounter).to.equal(1);
});
