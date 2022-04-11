import path from "path";
import { promises as fs } from "fs";
import child_process from "child_process";
import { assertAndReturn } from "../lib/assertions";

function aggregatedTitle(test: Mocha.Suite | Mocha.Test): string {
  if (test.parent?.title) {
    return `${aggregatedTitle(test.parent)} - ${test.title}`;
  } else {
    return test.title;
  }
}

async function writeFile(filePath: string, fileContent: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileContent);
}

const projectPath = path.join(__dirname, "..");

describe("Run all specs", () => {
  beforeEach(async function () {
    const title = aggregatedTitle(
      assertAndReturn(
        this.test?.ctx?.currentTest,
        "Expected hook to have a context and a test"
      )
    );

    this.tmpDir = path.join(projectPath, "tmp", title.replace(/[\(\)\?]/g, ""));

    await fs.rm(this.tmpDir, { recursive: true, force: true });

    await writeFile(
      path.join(this.tmpDir, "cypress.json"),
      JSON.stringify({
        testFiles: "**/*.feature",
        video: false,
      })
    );

    await writeFile(
      path.join(this.tmpDir, "cypress", "plugins", "index.js"),
      `
        const { createEsbuildPlugin } = require("@klaveness/cypress-cucumber-preprocessor/esbuild");
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

    await fs.mkdir(path.join(this.tmpDir, "node_modules", "@klaveness"), {
      recursive: true,
    });

    await fs.symlink(
      projectPath,
      path.join(
        this.tmpDir,
        "node_modules",
        "@klaveness",
        "cypress-cucumber-preprocessor"
      )
    );
  });

  it("should work fine with seemingly (?) ambiguous step definitions", async function () {
    const feature = `
      Feature:
        Scenario:
          Given a step
    `;

    const steps = `
      const { Given } = require("@klaveness/cypress-cucumber-preprocessor");
      Given("a step", function() {});
    `;

    await writeFile(
      path.join(this.tmpDir, "cypress", "integration", "a.feature"),
      feature
    );

    await writeFile(
      path.join(this.tmpDir, "cypress", "integration", "a.ts"),
      steps
    );

    await writeFile(
      path.join(this.tmpDir, "cypress", "integration", "b.feature"),
      feature
    );

    await writeFile(
      path.join(this.tmpDir, "cypress", "integration", "b.ts"),
      steps
    );

    child_process.spawnSync(
      path.join(projectPath, "node_modules", ".bin", "cypress"),
      ["open"],
      { cwd: this.tmpDir, stdio: "inherit" }
    );
  });
});
