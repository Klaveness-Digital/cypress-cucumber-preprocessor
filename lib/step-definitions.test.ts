import util from "util";

import assert from "assert";

import { Configuration, IConfiguration } from "./configuration";

import { getStepDefinitionDirectories } from "./step-definitions";

function example(
  filepath: string,
  cwd: string,
  explicitValues: Partial<IConfiguration>,
  expected: string[]
) {
  it(`should return [${expected.join(
    ", "
  )}] for ${filepath} with ${util.inspect(explicitValues)} in ${cwd}`, () => {
    const actual = getStepDefinitionDirectories(
      filepath,
      new Configuration(explicitValues),
      cwd
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

describe("getStepDefinitionDirectories()", () => {
  example("/foo/bar/cypress/integration/baz.feature", "/foo/bar", {}, [
    "/foo/bar/cypress/support/step_definitions",
  ]);

  example(
    "/foo/bar/cypress/integration/baz.feature",
    "/foo/bar",
    { stepDefinitionsFolder: "cypress/integration/step_definitions" },
    ["/foo/bar/cypress/integration/step_definitions"]
  );

  example(
    "/foo/bar/cypress/integration/baz.feature",
    "/foo/bar",
    {
      globalStepDefinitions: false,
    },
    ["/foo/bar/cypress/integration/baz", "/foo/bar/cypress/integration/common"]
  );

  example(
    "/foo/bar/cypress/integration/baz.feature",
    "/foo/bar",
    {
      globalStepDefinitions: false,
      stepDefinitionsFolder: "cypress/support",
    },
    ["/foo/bar/cypress/support/baz", "/foo/bar/cypress/support/common"]
  );

  example(
    "/foo/bar/cypress/integration/baz.feature",
    "/foo/bar",
    {
      globalStepDefinitions: false,
      stepDefinitionsCommonFolder: "universal",
    },
    [
      "/foo/bar/cypress/integration/baz",
      "/foo/bar/cypress/integration/universal",
    ]
  );

  example(
    "/foo/bar/cypress/features/baz.feature",
    "/foo/bar",
    {
      globalStepDefinitions: false,
      integrationFolder: "cypress/features",
    },
    ["/foo/bar/cypress/features/baz", "/foo/bar/cypress/features/common"]
  );

  it("should error when provided a path not within integrationFolder", () => {
    assert.throws(() => {
      getStepDefinitionDirectories(
        "/foo/bar/cypress/features/baz.feature",
        new Configuration({}),
        "/foo/bar"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within cypress/integration");
  });

  it("should error when provided a path not within cwd", () => {
    assert.throws(() => {
      getStepDefinitionDirectories(
        "/foo/bar/cypress/integration/baz.feature",
        new Configuration({}),
        "/baz"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within /baz");
  });
});
