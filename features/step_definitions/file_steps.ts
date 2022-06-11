import { Given } from "@cucumber/cucumber";
import stripIndent from "strip-indent";
import path from "path";
import { isPost10, isPre10, writeFile } from "../support/helpers";

Given("a file named {string} with:", async function (filePath, fileContent) {
  const absoluteFilePath = path.join(this.tmpDir, filePath);

  await writeFile(absoluteFilePath, stripIndent(fileContent));
});

Given(
  "a file named {string} or {string} \\(depending on Cypress era) with:",
  async function (filePathPre10, filePathPost10, fileContent) {
    await writeFile(
      path.join(this.tmpDir, isPre10() ? filePathPre10 : filePathPost10),
      stripIndent(fileContent)
    );
  }
);

Given("an empty file named {string}", async function (filePath) {
  const absoluteFilePath = path.join(this.tmpDir, filePath);

  await writeFile(absoluteFilePath, "");
});
