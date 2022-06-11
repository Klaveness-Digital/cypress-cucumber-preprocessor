import { version as cypressVersion } from "cypress/package.json";
import { After, Before, formatterHelpers } from "@cucumber/cucumber";
import path from "path";
import assert from "assert";
import { promises as fs } from "fs";
import { isPost10, writeFile } from "./helpers";

const projectPath = path.join(__dirname, "..", "..");

Before(async function ({ gherkinDocument, pickle }) {
  assert(gherkinDocument.uri, "Expected gherkinDocument.uri to be present");

  const relativeUri = path.relative(process.cwd(), gherkinDocument.uri);

  const { line } = formatterHelpers.PickleParser.getPickleLocation({
    gherkinDocument,
    pickle,
  });

  this.tmpDir = path.join(projectPath, "tmp", `${relativeUri}_${line}`);

  await fs.rm(this.tmpDir, { recursive: true, force: true });

  await writeFile(
    path.join(this.tmpDir, ".cypress-cucumber-preprocessorrc"),
    "{}"
  );

  await writeFile(path.join(this.tmpDir, "cypress", "support", "e2e.js"), "");

  if (isPost10()) {
    await writeFile(
      path.join(this.tmpDir, "cypress.config.js"),
      `
        const { defineConfig } = require("cypress");
        const setupNodeEvents = require("./setupNodeEvents.js");
  
        module.exports = defineConfig({
          e2e: {
            specPattern: "cypress/e2e/**/*.feature",
            video: false,
            setupNodeEvents
          }
        })
      `
    );
  } else {
    await writeFile(
      path.join(this.tmpDir, "cypress.json"),
      JSON.stringify(
        {
          testFiles: "**/*.feature",
          integrationFolder: "cypress/e2e",
          supportFile: "cypress/support/e2e.js",
          video: false,
          nodeVersion: "system",
        },
        null,
        2
      )
    );
  }

  await fs.mkdir(path.join(this.tmpDir, "node_modules", "@badeball"), {
    recursive: true,
  });

  await fs.symlink(
    projectPath,
    path.join(
      this.tmpDir,
      "node_modules",
      "@badeball",
      "cypress-cucumber-preprocessor"
    ),
    "dir"
  );
});

Before({ tags: "not @no-default-plugin" }, async function () {
  if (isPost10()) {
    await writeFile(
      path.join(this.tmpDir, "setupNodeEvents.js"),
      `
        const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
        const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
        const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

        module.exports = async function setupNodeEvents(on, config) {
          await addCucumberPreprocessorPlugin(on, config);

          on(
            "file:preprocessor",
            createBundler({
              plugins: [createEsbuildPlugin(config)],
            })
          );

          return config;
        };
      `
    );
  } else {
    await writeFile(
      path.join(this.tmpDir, "cypress", "plugins", "index.js"),
      `
        const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
        const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
        const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

        module.exports = async (on, config) => {
          await addCucumberPreprocessorPlugin(on, config);

          on(
            "file:preprocessor",
            createBundler({
              plugins: [createEsbuildPlugin(config)]
            })
          );

          return config;
        }
      `
    );
  }
});

After(function () {
  if (
    this.lastRun != null &&
    this.lastRun.exitCode !== 0 &&
    !this.verifiedLastRunError
  ) {
    throw new Error(
      `Last run errored unexpectedly. Output:\n\n${this.lastRun.output}`
    );
  }
});

function addCucumberPreprocessorPlugin(on: any, config: any) {
  throw new Error("Function not implemented.");
}

function createBundler(arg0: { plugins: any[] }): any {
  throw new Error("Function not implemented.");
}

function createEsbuildPlugin(config: any) {
  throw new Error("Function not implemented.");
}
