import { Given } from "@cucumber/cucumber";
import path from "path";
import { promises as fs } from "fs";
import { isPost10, isPre10 } from "../support/helpers";
import { insertValuesInConfigFile } from "../support/configFileUpdater";

async function updateJsonConfiguration(
  absoluteConfigPath: string,
  additionalJsonContent: any
) {
  const existingConfig = JSON.parse(
    (await fs.readFile(absoluteConfigPath)).toString()
  );

  await fs.writeFile(
    absoluteConfigPath,
    JSON.stringify(
      {
        ...existingConfig,
        ...additionalJsonContent,
      },
      null,
      2
    )
  );
}

Given("additional preprocessor configuration", async function (jsonContent) {
  const absoluteConfigPath = path.join(
    this.tmpDir,
    ".cypress-cucumber-preprocessorrc"
  );

  await updateJsonConfiguration(absoluteConfigPath, JSON.parse(jsonContent));
});

Given("additional Cypress configuration", async function (jsonContent) {
  if (isPost10()) {
    await insertValuesInConfigFile(
      path.join(this.tmpDir, "cypress.config.js"),
      JSON.parse(jsonContent)
    );
  } else {
    await updateJsonConfiguration(
      path.join(this.tmpDir, "cypress.json"),
      JSON.parse(jsonContent)
    );
  }
});

Given(
  "if post-v10, additional Cypress configuration",
  async function (jsonContent) {
    if (isPost10()) {
      await insertValuesInConfigFile(
        path.join(this.tmpDir, "cypress.config.js"),
        JSON.parse(jsonContent)
      );
    }
  }
);

Given(
  "if pre-v10, additional Cypress configuration",
  async function (jsonContent) {
    if (isPre10()) {
      await updateJsonConfiguration(
        path.join(this.tmpDir, "cypress.json"),
        JSON.parse(jsonContent)
      );
    }
  }
);
