const { createTestFromScenario } = require("./createTestFromScenario");

const createTestsFromFeature = parsedFeature =>
  describe(parsedFeature.feature.name, () => {
    const backgroundSection = parsedFeature.feature.children.find(
      section => section.type === "Background"
    );
    const otherSections = parsedFeature.feature.children.filter(
      section => section.type !== "Background"
    );
    otherSections.forEach(section => {
      if (backgroundSection) {
        createTestFromScenario(backgroundSection);
      }
      createTestFromScenario(section);
    });
  });

module.exports = {
  createTestsFromFeature
};
