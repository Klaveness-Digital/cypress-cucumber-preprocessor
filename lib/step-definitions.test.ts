import util from "util";

import assert from "assert";

import { ICypressConfiguration } from "./cypress-configuration";

import {
  IPreprocessorConfiguration,
  PreprocessorConfiguration,
} from "./preprocessor-configuration";

import { getStepDefinitionPatterns } from "./step-definitions";

function example(
  filepath: string,
  cypressConfiguration: Pick<
    ICypressConfiguration,
    "projectRoot" | "integrationFolder"
  >,
  preprocessorConfiguration: Partial<IPreprocessorConfiguration>,
  expected: string[]
) {
  it(`should return [${expected.join(
    ", "
  )}] for ${filepath} with ${util.inspect(preprocessorConfiguration)} in ${
    cypressConfiguration.projectRoot
  }`, () => {
    const actual = getStepDefinitionPatterns(
      {
        cypress: cypressConfiguration,
        preprocessor: new PreprocessorConfiguration(preprocessorConfiguration),
      },
      filepath
    );

    const throwUnequal = () => {
      throw new Error(
        `Expected ${util.inspect(expected)}, but got ${util.inspect(actual)}`
      );
    };

    if (expected.length !== actual.length) {
      throwUnequal();
    }

    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== actual[i]) {
        throwUnequal();
      }
    }
  });
}

describe("getStepDefinitionPatterns()", () => {
  example(
    "/foo/bar/cypress/integration/baz.feature",
    {
      projectRoot: "/foo/bar",
      integrationFolder: "cypress/integration",
    },
    {},
    [
      "/foo/bar/cypress/integration/baz/**/*.{js,ts}",
      "/foo/bar/cypress/integration/baz.{js,ts}",
      "/foo/bar/cypress/support/step_definitions/**/*.{js,ts}",
    ]
  );

  it("should error when provided a path not within integrationFolder", () => {
    assert.throws(() => {
      getStepDefinitionPatterns(
        {
          cypress: {
            projectRoot: "/foo/bar",
            integrationFolder: "cypress/integration",
          },
          preprocessor: {
            stepDefinitions: [],
          },
        },
        "/foo/bar/cypress/features/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within cypress/integration");
  });

  it("should error when provided a path not within cwd", () => {
    assert.throws(() => {
      getStepDefinitionPatterns(
        {
          cypress: {
            projectRoot: "/baz",
            integrationFolder: "cypress/integration",
          },
          preprocessor: {
            stepDefinitions: [],
          },
        },
        "/foo/bar/cypress/integration/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within /baz");
  });
});
