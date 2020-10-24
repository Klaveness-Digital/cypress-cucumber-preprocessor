import path from "path";

import glob from "glob";

import util from "util";

import isPathInside from "is-path-inside";

import debug from "./debug";

import { IConfiguration, resolve } from "./configuration";

export async function getStepDefinitionPaths(
  filepath: string
): Promise<string[]> {
  const configuration = await resolve();

  const patterns = getStepDefinitionDirectories(filepath, configuration).map(
    (directory) => `${directory}/**/*.@(js|ts)`
  );

  debug(`looking for step definitions using ${patterns.join(", ")}`);

  const files = (
    await Promise.all(patterns.map((pattern) => util.promisify(glob)(pattern)))
  ).reduce((acum, el) => acum.concat(el), []);

  if (files.length === 0) {
    debug("found no step definitions");
  } else {
    debug(`found step definitions in ${files.join(", ")}`);
  }

  return files;
}

function trimFeatureExtension(filepath: string) {
  return filepath.replace(/\.feature$/, "");
}

export function getStepDefinitionDirectories(
  filepath: string,
  configuration: IConfiguration,
  cwd: string = process.cwd()
): string[] {
  const fullIntegrationFolder = path.join(cwd, configuration.integrationFolder);

  if (!isPathInside(filepath, fullIntegrationFolder)) {
    throw new Error(`${filepath} is not inside ${fullIntegrationFolder}`);
  }

  if (!isPathInside(filepath, cwd)) {
    throw new Error(`${filepath} is not inside ${cwd}`);
  }

  if (configuration.globalStepDefinitions) {
    return [path.join(cwd, configuration.stepDefinitionsFolder)];
  } else {
    const relativeFilepath = path.relative(
      path.join(cwd, configuration.integrationFolder),
      filepath
    );

    return [
      path.join(
        cwd,
        configuration.stepDefinitionsFolder,
        trimFeatureExtension(relativeFilepath)
      ),
      path.join(
        cwd,
        configuration.stepDefinitionsFolder,
        configuration.stepDefinitionsCommonFolder
      ),
    ];
  }
}
