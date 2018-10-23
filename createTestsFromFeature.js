const { createTestFromScenario } = require("./createTestFromScenario");
const { shouldProceedCurrentStep, getEnvTags } = require("./tagsHelper");

const createTestsFromFeature = parsedFeature => {
  const featureTags = parsedFeature.feature.tags;
  const hasEnvTags = !!getEnvTags();
  const hasFeatureTags = featureTags && featureTags.length > 0;

  let featureShouldRun = true;
  if (hasEnvTags) {
    if (hasFeatureTags) {
      featureShouldRun = shouldProceedCurrentStep(featureTags);
    } else {
      featureShouldRun = false;
    }
  }

  const taggedScenarioShouldRun = parsedFeature.feature.children.some(
    section =>
      section.tags &&
      section.tags.length &&
      shouldProceedCurrentStep(section.tags)
  );

  // eslint-disable-next-line prefer-arrow-callback
  describe(parsedFeature.feature.name, function() {
    if (featureShouldRun || taggedScenarioShouldRun) {
      const backgroundSection = parsedFeature.feature.children.find(
        section => section.type === "Background"
      );
      const otherSections = parsedFeature.feature.children.filter(
        section => section.type !== "Background"
      );
      otherSections.forEach(section => {
        const scenarioHasTags = section.tags.length > 0;
        const shouldRun =
          hasEnvTags && scenarioHasTags
            ? shouldProceedCurrentStep(section.tags.concat(featureTags)) // concat handles inheritance of tags from feature
            : featureShouldRun;
        if (shouldRun) {
          createTestFromScenario(section, backgroundSection);
        }
      });
    }
  });
};

module.exports = {
  createTestsFromFeature
};
