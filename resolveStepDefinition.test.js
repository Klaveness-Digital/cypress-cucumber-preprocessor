const { Parser } = require("gherkin");
const { createTestFromScenario } = require("./createTestFromScenario");
const { when, then, given } = require("./resolveStepDefinition");

const feature = `Feature: Being a plugin

  As a cucumber cypress plugin
  I want to allow people to use gherkin syntax in cypress tests
  So they can create beautiful executable specification for their projects
`;

describe("Scenario Outline", () => {
  const spec = `
  ${feature}
   Scenario Outline: Using Scenario Outlines
    When I add <provided number> and <another provided number>
    Then I verify that the result is equal the <provided>

    Examples:
      | provided number | another provided number | provided |
      | 1               | 2                       | 3        |
      | 100             | 200                     | 300      |
  `;

  const gherkinAst = new Parser().parse(spec);

  let sum = 0;

  when("I add {int} and {int}", (a, b) => {
    sum = a + b;
  });

  then("I verify that the result is equal the {int}", result => {
    expect(sum).toEqual(result);
  });

  describe(gherkinAst.feature.name, () => {
    gherkinAst.feature.children.forEach(createTestFromScenario);
  });
});

describe("DocString", () => {
  const spec = `
  ${feature}
   Scenario: DocString
    When I use DocString for code like this:
    """
    expect(true).toEqual(true)
    variableToVerify = "hello world"
    """
    Then I ran it and verify that it executes it
  `;

  const gherkinAst = new Parser().parse(spec);

  let code = "";
  // eslint-disable-next-line prefer-const
  let variableToVerify = ""; // we are assigning this through eval

  when("I use DocString for code like this:", dataString => {
    code = dataString;
  });

  then("I ran it and verify that it executes it", () => {
    // eslint-disable-next-line no-eval
    eval(code);
    expect(variableToVerify).toEqual("hello world");
  });

  describe(gherkinAst.feature.name, () => {
    gherkinAst.feature.children.forEach(createTestFromScenario);
  });
});

describe("Data table", () => {
  const spec = `
  ${feature}
  Scenario: DataTable
    When I add all following numbers:
      | number | another number |
      | 1      | 2              |
      | 3      | 4              |
    Then I verify the datatable result is equal to 10
  `;

  const gherkinAst = new Parser().parse(spec);

  let sum = 0;
  when("I add all following numbers:", dataTable => {
    // console.log("a, ", dataTable.rawTable.slice(1))
    sum = dataTable.rawTable
      .slice(1)
      .reduce(
        (rowA, rowB) =>
          rowA.reduce((a, b) => parseInt(a, 10) + parseInt(b, 10)) +
          rowB.reduce((a, b) => parseInt(a, 10) + parseInt(b, 10))
      );
  });

  then("I verify the datatable result is equal to {int}", result => {
    expect(sum).toEqual(result);
  });

  describe(gherkinAst.feature.name, () => {
    gherkinAst.feature.children.forEach(createTestFromScenario);
  });
});

describe("Basic example", () => {
  const spec = `
  ${feature}
  Scenario: Basic example
    Given a feature and a matching step definition file
    When I run cypress tests
    Then they run properly
  `;

  const gherkinAst = new Parser().parse(spec);

  given("a feature and a matching step definition file", () => {
    expect(true).toEqual(true);
  });

  when("I run cypress tests", () => {
    expect(true).toEqual(true);
  });

  then("they run properly", () => {
    expect(true).toEqual(true);
  });

  describe(gherkinAst.feature.name, () => {
    gherkinAst.feature.children.forEach(createTestFromScenario);
  });
});

describe("Scenario outline string example", () => {
  const spec = `
  ${feature}
  Scenario Outline: Search the details of a phone
    Given a list of phones on phones store
    When I search the phone <brand> in search input
    Then <brand> <model> appears on the screen
    
    Examples:
    | brand   | model |
    | iPhone  | 6s   |
    | Samsung | S8  |
  `;

  const gherkinAst = new Parser().parse(spec);

  given("a list of phones on phones store", () => {
    expect(true).toEqual(true);
  });

  when("I search the phone {word} in search input", () => {
    expect(true).toEqual(true);
  });

  then("{word} {word} appears on the screen", (brand, model) => {
    expect(typeof model).toBe("string");
    expect(typeof brand).toBe("string");
  });

  describe(gherkinAst.feature.name, () => {
    gherkinAst.feature.children.forEach(createTestFromScenario);
  });
});
