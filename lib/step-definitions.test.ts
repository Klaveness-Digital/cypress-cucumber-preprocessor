import util from "util";

import assert from "assert";

import { ICypressConfiguration } from "./cypress-configuration";

import {
  IPreprocessorConfiguration,
  PreprocessorConfiguration,
} from "./preprocessor-configuration";

import { getStepDefinitionPatterns, pathParts } from "./step-definitions";

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

describe("pathParts()", () => {
  const relativePath = "foo/bar/baz";
  const expectedParts = ["foo/bar/baz", "foo/bar", "foo"];

  it(`should return ${util.inspect(expectedParts)} for ${util.inspect(
    relativePath
  )}`, () => {
    assert.deepStrictEqual(pathParts(relativePath), expectedParts);
  });
});

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

  example(
    "/cypress/integration/foo/bar/baz.feature",
    {
      projectRoot: "/",
      integrationFolder: "cypress/integration",
    },
    {
      stepDefinitions: "cypress/integration/[filepath]/step_definitions/*.ts",
    },
    ["/cypress/integration/foo/bar/baz/step_definitions/*.ts"]
  );

  example(
    "/cypress/integration/foo/bar/baz.feature",
    {
      projectRoot: "/",
      integrationFolder: "cypress/integration",
    },
    {
      stepDefinitions: "cypress/integration/[filepart]/step_definitions/*.ts",
    },
    [
      "/cypress/integration/foo/bar/baz/step_definitions/*.ts",
      "/cypress/integration/foo/bar/step_definitions/*.ts",
      "/cypress/integration/foo/step_definitions/*.ts",
      "/cypress/integration/step_definitions/*.ts",
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
