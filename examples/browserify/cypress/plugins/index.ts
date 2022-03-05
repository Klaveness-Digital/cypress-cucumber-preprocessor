import * as browserify from "@cypress/browserify-preprocessor";
import { preprocessor } from "@klaveness/cypress-cucumber-preprocessor/browserify";

export default (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): void => {
  on(
    "file:preprocessor",
    preprocessor(config, {
      ...browserify.defaultOptions,
      typescript: require.resolve("typescript"),
    })
  );
};
