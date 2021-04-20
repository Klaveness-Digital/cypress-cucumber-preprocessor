import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./debug";

export interface IPreprocessorConfiguration {
  readonly globalStepDefinitions: boolean;
  readonly stepDefinitionsFolder: string;
  readonly stepDefinitionsCommonFolder: string;
  readonly integrationFolder: string;
}

export class PreprocessorConfiguration implements IPreprocessorConfiguration {
  constructor(private explicitValues: Partial<IPreprocessorConfiguration>) {}

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

  return new PreprocessorConfiguration((result && result.config) || {});
}
