import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./debug";

import { isString, isStringOrStringArray, isBoolean } from "./type-guards";

function hasOwnProperty<X extends {}, Y extends string>(
  value: X,
  property: Y
): value is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(value, property);
}

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
    case "messages": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (messages), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (messages.enabled), but got ${util.inspect(
            value
          )}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (messages.output), but got ${util.inspect(
              value
            )}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "json": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (json), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (json.enabled), but got ${util.inspect(value)}`
        );
      }
      let formatter: string | undefined;
      if (hasOwnProperty(value, "formatter")) {
        if (isString(value.formatter)) {
          formatter = value.formatter;
        } else {
          throw new Error(
            `Expected a string (json.formatter), but got ${util.inspect(value)}`
          );
        }
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (json.output), but got ${util.inspect(value)}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        formatter,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "filterSpecs": {
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a boolean (filterSpecs), but got ${util.inspect(value)}`
        );
      }
      return { [key]: value };
    }
    case "omitFiltered": {
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a boolean (omitFiltered), but got ${util.inspect(value)}`
        );
      }
      return { [key]: value };
    }
    default:
      return {};
  }
}

export interface IPreprocessorConfiguration {
  readonly stepDefinitions: string | string[];
  readonly messages?: {
    enabled: boolean;
    output?: string;
  };
  readonly json?: {
    enabled: boolean;
    formatter?: string;
    output?: string;
  };
  readonly filterSpecs?: boolean;
  readonly omitFiltered?: boolean;
}

export class PreprocessorConfiguration implements IPreprocessorConfiguration {
  constructor(private explicitValues: Partial<IPreprocessorConfiguration>) {}

  get stepDefinitions() {
    return (
      this.explicitValues.stepDefinitions ?? [
        "cypress/integration/[filepath]/**/*.{js,ts}",
        "cypress/integration/[filepath].{js,ts}",
        "cypress/support/step_definitions/**/*.{js,ts}",
      ]
    );
  }

  get messages() {
    return {
      enabled:
        this.json.enabled || (this.explicitValues.messages?.enabled ?? false),
      output:
        this.explicitValues.messages?.output ?? "cucumber-messages.ndjson",
    };
  }

  get json() {
    return {
      enabled: this.explicitValues.json?.enabled ?? false,
      formatter:
        this.explicitValues.json?.formatter ?? "cucumber-json-formatter",
      output: this.explicitValues.json?.output || "cucumber-report.json",
    };
  }

  get filterSpecs() {
    return this.explicitValues.filterSpecs ?? false;
  }

  get omitFiltered() {
    return this.explicitValues.omitFiltered ?? false;
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
