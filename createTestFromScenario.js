/* eslint-disable prefer-template */

const { resolveAndRunStepDefinition } = require("./resolveStepDefinition");

const stepTest = step =>
  it(`${step.keyword} ${step.text}`, () => {
    resolveAndRunStepDefinition(step);
  });

const createTestFromScenario = scenario => {
  describe(scenario.name, () => {
    if (scenario.examples) {
      scenario.examples.forEach(example => {
        const exampleValues = [];

        example.tableBody.forEach((row, rowIndex) => {
          example.tableHeader.cells.forEach((header, headerIndex) => {
            exampleValues[rowIndex] = Object.assign(
              {},
              exampleValues[rowIndex],
              {
                [header.value]: row.cells[headerIndex].value
              }
            );
          });
        });

        exampleValues.forEach((_, index) => {
          scenario.steps.forEach(step => {
            const newStep = Object.assign({}, step);
            Object.entries(exampleValues[index]).forEach(column => {
              if (newStep.text.includes("<" + column[0] + ">")) {
                newStep.text = newStep.text.replace(
                  "<" + column[0] + ">",
                  column[1]
                );
              }
            });

            stepTest(newStep);
          });
        });
      });
    } else {
      scenario.steps.forEach(step => stepTest(step));
    }
  });
};

module.exports = {
  createTestFromScenario
};
