/* global when then */
when("I run one successful step", () => {
  expect(true).to.equal(true);
});

when("I run another that's unsuccessful", () => {
  expect(true).to.equal(false);
});

then("I don't run the last step", () => {
  throw new Error("this test should be skipped");
});
