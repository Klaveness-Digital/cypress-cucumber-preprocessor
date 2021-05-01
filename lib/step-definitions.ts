import path from "path";

import glob from "glob";

import util from "util";

import isPathInside from "is-path-inside";

import debug from "./debug";

import { ICypressConfiguration } from "./cypress-configuration";

import { IPreprocessorConfiguration } from "./preprocessor-configuration";

export async function getStepDefinitionPaths(
  configuration: {
    cypress: ICypressConfiguration;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): Promise<string[]> {
  const files = (
    await Promise.all(
      getStepDefinitionPatterns(configuration, filepath).map((pattern) =>
        util.promisify(glob)(pattern, { nodir: true })
      )
    )
  ).reduce((acum, el) => acum.concat(el), []);

  if (files.length === 0) {
    debug("found no step definitions");
  } else {
    debug(`found step definitions ${util.inspect(files)}`);
  }

  return files;
}

function trimFeatureExtension(filepath: string) {
  return filepath.replace(/\.feature$/, "");
}

export function getStepDefinitionPatterns(
  configuration: {
    cypress: Pick<ICypressConfiguration, "projectRoot" | "integrationFolder">;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): string[] {
  const fullIntegrationFolder = path.isAbsolute(
    configuration.cypress.integrationFolder
  )
    ? configuration.cypress.integrationFolder
    : path.join(
        configuration.cypress.projectRoot,
        configuration.cypress.integrationFolder
      );

  if (!isPathInside(filepath, fullIntegrationFolder)) {
    throw new Error(`${filepath} is not inside ${fullIntegrationFolder}`);
  }

  if (!isPathInside(filepath, configuration.cypress.projectRoot)) {
    throw new Error(
      `${filepath} is not inside ${configuration.cypress.projectRoot}`
    );
  }

  debug(
    `looking for step definitions using ${util.inspect(
      configuration.preprocessor.stepDefinitions
    )}`
  );

  const filepathReplacement = trimFeatureExtension(
    path.relative(fullIntegrationFolder, filepath)
  );

  debug(`replacing [filepath] with ${util.inspect(filepathReplacement)}`);

  return (typeof configuration.preprocessor.stepDefinitions === "string"
    ? [configuration.preprocessor.stepDefinitions]
    : configuration.preprocessor.stepDefinitions
  ).map((pattern) =>
    path.join(
      configuration.cypress.projectRoot,
      pattern.replace("[filepath]", filepathReplacement)
    )
  );
}
