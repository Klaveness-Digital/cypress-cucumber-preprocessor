import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./debug";

import { isBoolean, isString } from "./type-guards";

function validateConfigurationEntry(
  key: string,
  value: unknown
): Partial<IPreprocessorConfiguration> {
  switch (key) {
    case "globalStepDefinitions":
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a string (globalStepDefinitions), but got ${util.inspect(
            value
          )}`
        );
      }
      return { [key]: value };
    case "stepDefinitionsFolder":
      if (!isString(value)) {
        throw new Error(
          `Expected a string (stepDefinitionsFolder), but got ${util.inspect(
            value
          )}`
        );
      }
      return { [key]: value };
    case "stepDefinitionsCommonFolder":
      if (!isString(value)) {
        throw new Error(
          `Expected a string (stepDefinitionsCommonFolder), but got ${util.inspect(
            value
          )}`
        );
      }
      return { [key]: value };
    case "integrationFolder":
      if (!isString(value)) {
        throw new Error(
          `Expected a string (integrationFolder), but got ${util.inspect(
            value
          )}`
        );
      }
      return { [key]: value };
    default:
      return {};
  }
}

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
    const { config: rawConfig } = result;

    if (typeof rawConfig !== "object" || rawConfig == null) {
      throw new Error(
        `Malformed configuration, expected an object, but got ${util.inspect(
          rawConfig
        )}`
      );
    }

    const config: Partial<IPreprocessorConfiguration> = Object.assign(
      {},
      ...Object.entries(rawConfig).map((entry) =>
        validateConfigurationEntry(...entry)
      )
    );

    debug(`resolved configuration ${util.inspect(config)}`);

    return new PreprocessorConfiguration(config);
  } else {
    debug("resolved no configuration");

    return new PreprocessorConfiguration({});
  }
}
