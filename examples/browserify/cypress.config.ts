import { defineConfig } from "cypress";
import * as browserify from "@cypress/browserify-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { preprocessor } from "@badeball/cypress-cucumber-preprocessor/browserify";

export async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    preprocessor(config, {
      ...browserify.defaultOptions,
      typescript: require.resolve("typescript"),
    })
  );

  // Make sure to return the config object as it might have been modified by the plugin.
  return config;
}

export default defineConfig({
  e2e: {
    specPattern: "**/*.feature",
    supportFile: false,
    setupNodeEvents,
  },
});
