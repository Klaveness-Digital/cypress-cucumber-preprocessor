const { createTestFromScenario } = require("./createTestFromScenario");

const createTestsFromFeature = parsedFeature =>
  describe(parsedFeature.feature.name, () => {
    parsedFeature.feature.children.forEach(createTestFromScenario);
  });

module.exports = {
  createTestsFromFeature
};
