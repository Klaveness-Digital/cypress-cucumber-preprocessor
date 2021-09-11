import { Given, Then } from "@cucumber/cucumber";
import stripIndent from "strip-indent";
import path from "path";
import { promises as fs, constants } from "fs";
import { writeFile } from "../support/helpers";

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
    } catch (e: any) {
      if (e.code === "ENOENT") {
        throw new Error(`Expected ${filePath} to exist, but it doesn't`);
      } else {
        throw e;
      }
    }
  }
);
