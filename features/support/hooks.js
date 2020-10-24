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
      const { preprocessor } = require("${projectPath}");

      module.exports = (on, config) => {
        on("file:preprocessor", preprocessor())
      }
    `
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
