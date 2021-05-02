const { After, Before } = require("@cucumber/cucumber");
const path = require("path");
const { promises: fs } = require("fs");
const { writeFile } = require("./helpers");

const projectPath = path.join(__dirname, "..", "..");
const { formatterHelpers } = require("@cucumber/cucumber");

Before(async function ({ gherkinDocument, pickle }) {
  const relativeUri = path.relative(process.cwd(), gherkinDocument.uri);

  const { line } = formatterHelpers.PickleParser.getPickleLocation({
    gherkinDocument,
    pickle,
  });

  this.tmpDir = path.join(projectPath, "tmp", `${relativeUri}_${line}`);

  await fs.rmdir(this.tmpDir, { recursive: true });

  await writeFile(
    path.join(this.tmpDir, "cypress.json"),
    JSON.stringify(
      {
        testFiles: "**/*.feature",
        video: false,
      },
      null,
      2
    )
  );

  await writeFile(
    path.join(this.tmpDir, "cypress", "plugins", "index.js"),
    `
      const { createEsbuildPlugin } = require("${projectPath}/esbuild");
      const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

      module.exports = (on, config) => {
        on(
          "file:preprocessor",
          createBundler({
            plugins: [createEsbuildPlugin(config)]
          })
        );
      }
    `
  );

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
    )
  );
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
