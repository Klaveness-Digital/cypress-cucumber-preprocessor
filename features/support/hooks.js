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
      const { compile } = require("${projectPath}/lib/template");
      const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

      const FeatureOnLoadPlugin = {
        name: "feature",
        setup(build) {
          const fs = require("fs");

          build.onLoad({ filter: /\.feature$/ }, async args => {
            const content = await fs.promises.readFile(args.path, "utf8");

            return {
              contents: await compile(content, args.path),
              loader: "js"
            };
          });
        }
      };

      module.exports = (on, config) => {
        on(
          "file:preprocessor",
          createBundler({
            plugins: [FeatureOnLoadPlugin]
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
