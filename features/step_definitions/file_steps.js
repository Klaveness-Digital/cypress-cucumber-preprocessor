const { Given, Then } = require("@cucumber/cucumber");
const stripIndent = require("strip-indent");
const path = require("path");
const { promises: fs, constants } = require("fs");
const { writeFile } = require("../support/helpers");

Given("a file named {string} with:", async function (filePath, fileContent) {
  const absoluteFilePath = path.join(this.tmpDir, filePath);

  await writeFile(absoluteFilePath, stripIndent(fileContent));
});

Given("an empty file named {string}", async function (filePath) {
  const absoluteFilePath = path.join(this.tmpDir, filePath);

  await writeFile(absoluteFilePath, "");
});

Then(
  "I should nonetheless see a file named {string}",
  async function (filePath) {
    const absoluteFilePath = path.join(this.tmpDir, filePath);

    try {
      await fs.access(absoluteFilePath, constants.F_OK);
    } catch (e) {
      if (e.code === "ENOENT") {
        throw new Error(`Expected ${filePath} to exist, but it doesn't`);
      } else {
        throw e;
      }
    }
  }
);
