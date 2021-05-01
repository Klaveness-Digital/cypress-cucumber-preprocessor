import fs from "fs";

import path from "path";

import util from "util";

import debug from "./debug";

import { assert, assertAndReturn } from "./assertions";

/**
 * This is obviously a non-exhaustive list.
 */
const RECOGNIZED_CONFIGURATION_ATTRIBUTES = [
  "integrationFolder",
  "fixturesFolder",
  "supportFile",
  "testFiles",
  "ignoreTestFiles",
];

export function findLastIndex<T>(
  collection: ArrayLike<T>,
  predicate: (value: T) => boolean,
  beforeIndex = collection.length
): number {
  for (let i = beforeIndex - 1; i >= 0; --i) {
    if (predicate(collection[i])) {
      return i;
    }
  }

  return -1;
}

export function* traverseArgvMatching(
  argv: string[],
  name: string,
  allowEqual: boolean
) {
  let beforeIndex = argv.length,
    matchingIndex;

  while (
    (matchingIndex = findLastIndex(
      argv,
      (arg) => arg.startsWith(name),
      beforeIndex
    )) !== -1
  ) {
    if (argv[matchingIndex] === name) {
      if (argv.length - 1 === matchingIndex) {
        debug(`'${name}' argument missing`);
      } else {
        yield argv[matchingIndex + 1];
      }
    } else if (allowEqual && argv[matchingIndex][name.length] === "=") {
      yield argv[matchingIndex].slice(name.length + 1);
    }

    beforeIndex = matchingIndex;
  }
}

export function* combine<T>(...generators: Generator<T, unknown, unknown>[]) {
  for (const generator of generators) {
    yield* generator;
  }
}

export function findArgumentValue(
  argv: string[],
  name: string,
  allowEqual: boolean
): string | undefined {
  for (const value of traverseArgvMatching(argv, name, allowEqual)) {
    return value;
  }
}

export function toSnakeCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function capitalize(word: string) {
  return word.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export function toCamelCase(value: string) {
  return value
    .split("_")
    .map((word, index) =>
      index === 0 ? word.toLocaleLowerCase() : capitalize(word)
    )
    .join("");
}

export function resolveConfiguration(options: {
  argv?: string[];
  env?: Record<string, string>;
  cwd?: string;
}): Record<string, any> {
  const {
    argv = process.argv,
    env = process.env as Record<string, string>,
  } = options;

  const projectPath = resolveProjectPath(options);

  const cliOrigin: Record<string, string> = Object.fromEntries(
    Array.from(
      combine(
        traverseArgvMatching(argv, "--config", true),
        traverseArgvMatching(argv, "-c", false)
      )
    )
      .reverse()
      .flatMap((argument) => {
        const keypairExpr = /(?:^|,)([^=]+)=([^,$]+)/g;
        const entries: [string, string][] = [];
        let match;

        while ((match = keypairExpr.exec(argument)) !== null) {
          if (RECOGNIZED_CONFIGURATION_ATTRIBUTES.includes(match[1])) {
            entries.push([match[1], match[2]]);
          }
        }

        return entries;
      })
  );

  const envPrefixExpr = /^cypress_(.+)/i;

  const envOrigin: Record<string, string> = Object.fromEntries(
    Object.entries(env)
      .filter((entry) => {
        return envPrefixExpr.test(entry[0]);
      })
      .map<[string, string]>((entry) => {
        const match = entry[0].match(envPrefixExpr);

        assert(
          match,
          "cypress-cucumber-preprocessor: expected match after test"
        );

        return [assertAndReturn(match[1]), entry[1]];
      })
      .map((entry) => {
        return [
          entry[0].includes("_") ? toCamelCase(entry[0]) : entry[0],
          entry[1],
        ];
      })
      .filter((entry) => {
        return RECOGNIZED_CONFIGURATION_ATTRIBUTES.includes(entry[0]);
      })
  );

  let configOrigin: Record<string, any> = {};

  const cypressConfigPath = path.join(
    projectPath,
    resolveConfigurationFile(options)
  );

  if (fs.existsSync(cypressConfigPath)) {
    const content = fs.readFileSync(cypressConfigPath).toString("utf8");

    configOrigin = JSON.parse(content);
  }

  const configuration = Object.assign(
    {
      integrationFolder: "cypress/integration",
      fixturesFolder: "cypress/fixtures",
      supportFile: "cypress/support/index.js",
      testFiles: "**/*.*",
      ignoreTestFiles: "*.hot-update.js",
    },
    configOrigin,
    envOrigin,
    cliOrigin
  );

  debug(`resolved configuration of ${util.inspect(configuration)}`);

  return configuration;
}

export function resolveEnvironment(options: {
  argv?: string[];
  env?: Record<string, string>;
  cwd?: string;
}): Record<string, any> {
  const {
    argv = process.argv,
    env = process.env as Record<string, string>,
  } = options;

  const projectPath = resolveProjectPath(options);

  const cliOrigin: Record<string, string> = Object.fromEntries(
    Array.from(
      combine(
        traverseArgvMatching(argv, "--env", true),
        traverseArgvMatching(argv, "-e", false)
      )
    )
      .slice(0, 1)
      .flatMap((argument) => {
        const keypairExpr = /(?:^|,)([^=]+)=([^,$]+)/g;
        const entries: [string, string][] = [];
        let match;

        while ((match = keypairExpr.exec(argument)) !== null) {
          entries.push([match[1], match[2]]);
        }

        return entries;
      })
  );

  const envPrefixExpr = /^cypress_(.+)/i;

  const envOrigin: Record<string, string> = Object.fromEntries(
    Object.entries(env)
      .filter((entry) => {
        return envPrefixExpr.test(entry[0]);
      })
      .map<[string, string]>((entry) => {
        const match = entry[0].match(envPrefixExpr);

        assert(
          match,
          "cypress-cucumber-preprocessor: expected match after test"
        );

        return [assertAndReturn(match[1]), entry[1]];
      })
  );

  const cypressConfigPath = path.join(
    projectPath,
    resolveConfigurationFile(options)
  );

  let configOrigin: Record<string, any> = {};

  if (fs.existsSync(cypressConfigPath)) {
    const content = fs.readFileSync(cypressConfigPath).toString("utf8");

    const cypressConfig = JSON.parse(content);

    if (cypressConfig.env) {
      configOrigin = cypressConfig.env;
    }
  }

  const cypressEnvironmentFilePath = path.join(projectPath, "cypress.env.json");

  let cypressEnvOrigin: Record<string, any> = {};

  if (fs.existsSync(cypressEnvironmentFilePath)) {
    const content = fs
      .readFileSync(cypressEnvironmentFilePath)
      .toString("utf8");

    cypressEnvOrigin = JSON.parse(content);
  }

  const environment = Object.assign(
    {},
    cypressEnvOrigin,
    configOrigin,
    envOrigin,
    cliOrigin
  );

  debug(`resolved environment of ${util.inspect(environment)}`);

  return environment;
}

export function resolveConfigurationFile(options: { argv?: string[] }): string {
  const { argv = process.argv } = options;

  return (
    findArgumentValue(argv, "--config-file", true) ||
    findArgumentValue(argv, "-C", false) ||
    "cypress.json"
  );
}

export function resolveProjectPath(options: {
  argv?: string[];
  cwd?: string;
}): string {
  const { argv = process.argv, cwd = process.cwd() } = options;

  const customProjectPath =
    findArgumentValue(argv, "--project", true) ||
    findArgumentValue(argv, "-P", false);

  if (customProjectPath) {
    if (path.isAbsolute(customProjectPath)) {
      return customProjectPath;
    } else {
      return path.join(cwd, customProjectPath);
    }
  } else {
    return cwd;
  }
}
