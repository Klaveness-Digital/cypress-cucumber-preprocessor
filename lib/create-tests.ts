import { messages } from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import { v4 as uuid } from "uuid";

import { assertAndReturn } from "./assertions";

import DataTable from "./data_table";

import { assignRegistry, freeRegistry, Registry } from "./registry";

import { traverseGherkinDocument, mapTagName } from "./ast-helpers";

import { YieldType } from "./types";

import { TASK_APPEND_MESSAGES, TASK_TEST_STEP_STARTED } from "./constants";

type Node = ReturnType<typeof parse>;

interface CompositionContext {
  registry: Registry;
  gherkinDocument: messages.IGherkinDocument;
  pickles: messages.IPickle[];
  testFilter: Node;
  messages: {
    enabled: boolean;
    stack: messages.IEnvelope[];
  };
}

const INTERNAL_PROPERTY_NAME = "_cypress-cucumber-preprocessor-do-not-use";

/**
 * From messages.TestStepFinished.TestStepResult.Status.
 */
const Status = {
  Unknown: "UNKNOWN" as unknown as 0,
  Passed: "PASSED" as unknown as 1,
  Skipped: "SKIPPED" as unknown as 2,
  Pending: "PENDING" as unknown as 3,
  Undefined: "UNDEFINED" as unknown as 4,
  Ambiguous: "AMBIGUOUS" as unknown as 5,
  Failed: "FAILED" as unknown as 6,
};

function createFeature(
  context: CompositionContext,
  feature: messages.GherkinDocument.IFeature
) {
  describe(feature.name || "<unamed feature>", () => {
    if (feature.children) {
      for (const child of feature.children) {
        if (child.scenario) {
          createScenario(context, child.scenario);
        } else if (child.rule) {
          createRule(context, child.rule);
        }
      }
    }
  });
}

function createRule(
  context: CompositionContext,
  rule: messages.GherkinDocument.Feature.FeatureChild.IRule
) {
  describe(rule.name || "<unamed rule>", () => {
    if (rule.children) {
      for (const child of rule.children) {
        if (child.scenario) {
          createScenario(context, child.scenario);
        }
      }
    }
  });
}

function createWeakCache<K extends object, V>(mapper: (key: K) => V) {
  return {
    cache: new WeakMap<K, V>(),

    get(key: K) {
      const cacheHit = this.cache.get(key);

      if (cacheHit) {
        return cacheHit;
      }

      const value = mapper(key);
      this.cache.set(key, value);
      return value;
    },
  };
}

const gherkinDocumentsAstIdMaps = createWeakCache(
  (key: messages.IGherkinDocument) => {
    const astIdMap = new Map<
      string,
      YieldType<ReturnType<typeof traverseGherkinDocument>>
    >();

    for (const node of traverseGherkinDocument(key)) {
      if ("id" in node && node.id) {
        astIdMap.set(node.id, node);
      }
    }

    return astIdMap;
  }
);

function createScenario(
  context: CompositionContext,
  scenario: messages.GherkinDocument.Feature.IScenario
) {
  if (scenario.examples) {
    const exampleIds = scenario.examples
      .map((examples) => {
        return assertAndReturn(
          examples.tableBody,
          "Expected to find a table body"
        ).map((row) =>
          assertAndReturn(row.id, "Expected table row to have an id")
        );
      })
      .reduce((acum, el) => acum.concat(el), []);

    for (let i = 0; i < exampleIds.length; i++) {
      const exampleId = exampleIds[i];

      const pickle = assertAndReturn(
        context.pickles.find(
          (pickle) => pickle.astNodeIds && pickle.astNodeIds.includes(exampleId)
        ),
        `Expected to find a pickle associated with id = ${exampleId}`
      );

      const baseName = assertAndReturn(
        pickle.name,
        "Expected pickle to have a name"
      );

      const exampleName = `${baseName} (example #${i + 1})`;

      createPickle(context, { ...scenario, name: exampleName }, pickle);
    }
  } else {
    const scenarioId = assertAndReturn(
      scenario.id,
      "Expected scenario to have an id"
    );

    const pickle = assertAndReturn(
      context.pickles.find(
        (pickle) => pickle.astNodeIds && pickle.astNodeIds.includes(scenarioId)
      ),
      `Expected to find a pickle associated with id = ${scenarioId}`
    );

    createPickle(context, scenario, pickle);
  }
}

function createPickle(
  context: CompositionContext,
  scenario: messages.GherkinDocument.Feature.IScenario,
  pickle: messages.IPickle
) {
  const { registry, gherkinDocument, pickles, testFilter, messages } = context;

  const testCaseId = uuid();

  const definitionIds: string[] = [];

  if (pickle.steps) {
    for (const step of pickle.steps) {
      const id = uuid();

      definitionIds.push(id);

      messages.stack.push({
        stepDefinition: {
          id,
          pattern: {
            source: "a step",
            type: "CUCUMBER_EXPRESSION" as unknown as messages.StepDefinition.StepDefinitionPattern.StepDefinitionPatternType,
          },
          sourceReference: {
            uri: "not available",
            location: { line: 0 },
          },
        },
      });
    }
  }

  const testCase: messages.IEnvelope = {
    testCase: {
      id: testCaseId,
      pickleId: pickle.id,
      testSteps: pickle.steps?.map((step, i) => {
        return {
          id: step.id,
          pickleStepId: step.id,
          stepDefinitionIds: [definitionIds[i]],
        };
      }),
    },
  };

  messages.stack.push(testCase);

  const astIdMap = gherkinDocumentsAstIdMaps.get(gherkinDocument);

  const tags = pickle.tags ? pickle.tags.map(mapTagName) : [];

  if (!testFilter.evaluate(tags)) {
    return;
  }

  let attempt = 0;

  it(scenario.name || "<unamed scenario>", { env: { tags } }, function () {
    assignRegistry(registry);

    const testCaseStartedId = uuid();

    const testCaseStarted: messages.IEnvelope = {
      testCaseStarted: {
        id: testCaseStartedId,
        testCaseId,
        attempt: attempt++,
      },
    };

    messages.stack.push(testCaseStarted);

    window.testState = {
      gherkinDocument,
      pickles,
      pickle,
    };

    if (!pickle.steps) {
      this[INTERNAL_PROPERTY_NAME] = {
        pickle,
        testCaseStartedId,
        remainingSteps: [],
      };
    }

    if (pickle.steps) {
      const remainingSteps = [...pickle.steps];

      this[INTERNAL_PROPERTY_NAME] = {
        pickle,
        testCaseStartedId,
        remainingSteps,
      };

      for (const pickleStep of pickle.steps) {
        const text = assertAndReturn(
          pickleStep.text,
          "Expected pickle step to have a text"
        );

        const scenarioStep = assertAndReturn(
          astIdMap.get(
            assertAndReturn(
              pickleStep.astNodeIds?.[0],
              "Expected to find at least one astNodeId"
            )
          ),
          `Expected to find scenario step associated with id = ${pickleStep.astNodeIds?.[0]}`
        );

        cy.wrap(null, { log: false }).then(() => {
          Cypress.log({
            name: "step",
            displayName: assertAndReturn(
              "keyword" in scenarioStep && scenarioStep.keyword,
              "Expected to find a keyword in the scenario step"
            ),
            message: text as unknown as any[], // This property was wrongfully typed in 3.x.y.
          });
        });

        const argument: DataTable | string | undefined = pickleStep.argument
          ?.dataTable
          ? new DataTable(pickleStep.argument.dataTable)
          : pickleStep.argument?.docString?.content
          ? pickleStep.argument.docString.content
          : undefined;

        cy.then(() => {
          const testStepStarted: messages.IEnvelope = {
            testStepStarted: {
              testStepId: pickleStep.id,
              testCaseStartedId,
            },
          };

          messages.stack.push(testStepStarted);

          if (messages.enabled) {
            cy.task(TASK_TEST_STEP_STARTED, pickleStep.id, { log: false });
          }
        })
          .then(() => registry.runStepDefininition(this, text, argument))
          .then((result) => {
            if (result === "pending") {
              const testStepFinished: messages.IEnvelope = {
                testStepFinished: {
                  testStepId: pickleStep.id,
                  testCaseStartedId,
                  testStepResult: {
                    status: Status.Pending,
                  },
                },
              };

              messages.stack.push(testStepFinished);

              remainingSteps.shift();

              for (const skippedStep of remainingSteps) {
                const skippedTestStepStarted: messages.IEnvelope = {
                  testStepStarted: {
                    testStepId: skippedStep.id,
                    testCaseStartedId,
                  },
                };

                messages.stack.push(skippedTestStepStarted);

                const skippedTestStepFinished: messages.IEnvelope = {
                  testStepFinished: {
                    testStepId: skippedStep.id,
                    testCaseStartedId,
                    testStepResult: {
                      status: Status.Skipped,
                    },
                  },
                };

                messages.stack.push(skippedTestStepFinished);
              }

              for (let i = 0, count = remainingSteps.length; i < count; i++) {
                remainingSteps.pop();
              }

              this.skip();
            } else {
              const testStepFinished: messages.IEnvelope = {
                testStepFinished: {
                  testStepId: pickleStep.id,
                  testCaseStartedId,
                  testStepResult: {
                    status: Status.Passed,
                  },
                },
              };

              messages.stack.push(testStepFinished);

              remainingSteps.shift();
            }
          });
      }
    }
  });
}

function collectTagNamesFromGherkinDocument(
  gherkinDocument: messages.IGherkinDocument
) {
  const tagNames: string[] = [];

  for (const node of traverseGherkinDocument(gherkinDocument)) {
    if ("tags" in node && node.tags) {
      for (const tag of node.tags) {
        tagNames.push(mapTagName(tag));
      }
    }
  }

  return tagNames;
}

export default function createTests(
  registry: Registry,
  source: string,
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[],
  messagesEnabled: boolean
) {
  const noopNode = { evaluate: () => true };

  const environmentTags = Cypress.env("TAGS");

  const messages: messages.IEnvelope[] = [];

  messages.push({
    source: { data: source, uri: gherkinDocument.uri },
  });

  messages.push({
    gherkinDocument: {
      ...gherkinDocument,
    },
  });

  for (const pickle of pickles) {
    messages.push({
      pickle,
    });
  }

  const testFilter = collectTagNamesFromGherkinDocument(
    gherkinDocument
  ).includes("@focus")
    ? parse("@focus")
    : environmentTags
    ? parse(environmentTags)
    : noopNode;

  if (gherkinDocument.feature) {
    createFeature(
      {
        registry,
        gherkinDocument,
        pickles,
        testFilter,
        messages: {
          enabled: messagesEnabled,
          stack: messages,
        },
      },
      gherkinDocument.feature
    );
  }

  afterEach(function () {
    freeRegistry();

    const currentTest = assertAndReturn(
      this.currentTest,
      "Expected to find current test"
    );

    const { pickle, testCaseStartedId, remainingSteps, lastKnownStatus } =
      assertAndReturn(
        currentTest.ctx?.[INTERNAL_PROPERTY_NAME],
        "Expected to find internal properties"
      );

    if (remainingSteps.length > 0) {
      const error = assertAndReturn(
        this.currentTest?.err?.message,
        "Expected to find an error message"
      );

      const failedStep = assertAndReturn(
        remainingSteps.shift(),
        "Expected there to be a remaining step"
      );

      const failedTestStepFinished: messages.IEnvelope = error.includes(
        "Step implementation missing"
      )
        ? {
            testStepFinished: {
              testStepId: failedStep.id,
              testCaseStartedId,
              testStepResult: {
                status: Status.Undefined,
              },
            },
          }
        : {
            testStepFinished: {
              testStepId: failedStep.id,
              testCaseStartedId,
              testStepResult: {
                status: Status.Failed,
                message: this.currentTest?.err?.message,
              },
            },
          };

      messages.push(failedTestStepFinished);

      for (const skippedStep of remainingSteps) {
        const skippedTestStepStarted: messages.IEnvelope = {
          testStepStarted: {
            testStepId: skippedStep.id,
            testCaseStartedId,
          },
        };

        messages.push(skippedTestStepStarted);

        const skippedTestStepFinished: messages.IEnvelope = {
          testStepFinished: {
            testStepId: skippedStep.id,
            testCaseStartedId,
            testStepResult: {
              status: Status.Skipped,
            },
          },
        };

        messages.push(skippedTestStepFinished);
      }
    }

    const testCaseFinished: messages.IEnvelope = {
      testCaseFinished: {
        testCaseStartedId,
      },
    };

    messages.push(testCaseFinished);
  });

  after(() => {
    if (messagesEnabled) {
      cy.task(TASK_APPEND_MESSAGES, messages, { log: false });
    }
  });
}
