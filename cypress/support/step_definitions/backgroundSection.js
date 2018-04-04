/* global given, then */

let counter = 0;

given("counter is incremented", () => {
  counter += 1;
});

then("counter equals {int}", value => {
  expect(counter).to.equal(value);
});
