import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./debug";

export interface IConfiguration {
  readonly globalStepDefinitions: boolean;
  readonly stepDefinitionsFolder: string;
  readonly stepDefinitionsCommonFolder: string;
  readonly integrationFolder: string;
}

export class Configuration implements IConfiguration {
  constructor(private explicitValues: Partial<IConfiguration>) {}

  get globalStepDefinitions() {
    if (this.explicitValues.globalStepDefinitions === false) {
      return false;
    }

    return this.explicitValues.globalStepDefinitions || true;
  }

  get stepDefinitionsFolder() {
    if (this.explicitValues.stepDefinitionsFolder) {
      return this.explicitValues.stepDefinitionsFolder;
    } else if (this.globalStepDefinitions) {
      return "cypress/support/step_definitions";
    } else {
      return this.integrationFolder;
    }
  }

  get stepDefinitionsCommonFolder() {
    return this.explicitValues.stepDefinitionsCommonFolder || "common";
  }

  get integrationFolder() {
    return this.explicitValues.integrationFolder || "cypress/integration";
  }
}

export async function resolve() {
  const result = await cosmiconfig("cypress-cucumber-preprocessor").search();

  if (result) {
    debug(`resolved configuration ${util.inspect(result.config)}`);
  } else {
    debug("resolved no configuration");
  }

  return new Configuration((result && result.config) || {});
}
