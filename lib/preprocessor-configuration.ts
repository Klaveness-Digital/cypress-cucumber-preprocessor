import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./debug";

import { isStringOrStringArray } from "./type-guards";

function validateConfigurationEntry(
  key: string,
  value: unknown
): Partial<IPreprocessorConfiguration> {
  switch (key) {
    case "stepDefinitions":
      if (!isStringOrStringArray(value)) {
        throw new Error(
          `Expected a string or array of strings (stepDefinitions), but got ${util.inspect(
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
  readonly stepDefinitions: string | string[];
}

export class PreprocessorConfiguration implements IPreprocessorConfiguration {
  constructor(private explicitValues: Partial<IPreprocessorConfiguration>) {}

  get stepDefinitions() {
    return (
      this.explicitValues.stepDefinitions || [
        "cypress/integration/[filepath]/**/*.{js,ts}",
        "cypress/integration/[filepath].{js,ts}",
        "cypress/support/step_definitions/**/*.{js,ts}",
      ]
    );
  }
}

export async function resolve(searchFrom?: string) {
  const result = await cosmiconfig("cypress-cucumber-preprocessor").search(
    searchFrom
  );

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
