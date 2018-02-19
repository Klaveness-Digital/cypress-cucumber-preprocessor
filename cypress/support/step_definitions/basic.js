const { given, when, then } = require("cypress-cucumber-preprocessor"); // eslint-disable-line

given("a feature and a matching step definition file", () => {
  expect(true).to.equal(true);
});

when("I run cypress tests", () => {
  expect(true).to.equal(true);
});

then("they run properly", () => {
  expect(true).to.equal(true);
});
