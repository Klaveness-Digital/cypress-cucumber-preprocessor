import { messages } from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import { v4 as uuid } from "uuid";

import { assertAndReturn } from "./assertions";

import DataTable from "./data_table";

import { assignRegistry, freeRegistry, IHook, Registry } from "./registry";

import { collectTagNames, traverseGherkinDocument } from "./ast-helpers";

import { YieldType } from "./types";

import {
  HOOK_FAILURE_EXPR,
  INTERNAL_PROPERTY_NAME,
  TASK_APPEND_MESSAGES,
  TASK_TEST_STEP_STARTED,
} from "./constants";

import { getTags } from "./environment-helpers";

import { notNull } from "./type-guards";

declare global {
  namespace globalThis {
    var __cypress_cucumber_preprocessor_dont_use_this: true | undefined;
  }
}

type Node = ReturnType<typeof parse>;

interface CompositionContext {
  registry: Registry;
  gherkinDocument: messages.IGherkinDocument;
  pickles: messages.IPickle[];
  testFilter: Node;
  omitFiltered: boolean;
  messages: {
    enabled: boolean;
    stack: messages.IEnvelope[];
  };
}

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

const sourceReference: messages.ISourceReference = {
  uri: "not available",
  location: { line: 0 },
};

interface IStep {
  hook?: IHook;
  pickleStep?: messages.Pickle.IPickleStep;
}

export interface InternalProperties {
  pickle: messages.IPickle;
  testCaseStartedId: string;
  currentStep?: IStep;
  allSteps: IStep[];
  remainingSteps: IStep[];
}

function retrieveInternalProperties(): InternalProperties {
  return Cypress.env(INTERNAL_PROPERTY_NAME);
}

function findPickleById(context: CompositionContext, astId: string) {
  return assertAndReturn(
    context.pickles.find(
      (pickle) => pickle.astNodeIds && pickle.astNodeIds.includes(astId)
    ),
    `Expected to find a pickle associated with id = ${astId}`
  );
}

function collectExampleIds(
  examples: messages.GherkinDocument.Feature.Scenario.IExamples[]
) {
  return examples
    .map((examples) => {
      return assertAndReturn(
        examples.tableBody,
        "Expected to find a table body"
      ).map((row) =>
        assertAndReturn(row.id, "Expected table row to have an id")
      );
    })
    .reduce((acum, el) => acum.concat(el), []);
}

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
  const picklesWithinRule = rule.children
    ?.map((child) => child.scenario)
    .filter(notNull)
    .flatMap((scenario) => {
      if (scenario.examples) {
        return collectExampleIds(scenario.examples).map((exampleId) => {
          return findPickleById(context, exampleId);
        });
      } else {
        const scenarioId = assertAndReturn(
          scenario.id,
          "Expected scenario to have an id"
        );

        return findPickleById(context, scenarioId);
      }
    });

  if (picklesWithinRule) {
    if (context.omitFiltered) {
      const matches = picklesWithinRule.filter((pickle) =>
        context.testFilter.evaluate(collectTagNames(pickle.tags))
      );

      if (matches.length === 0) {
        return;
      }
    }
  }

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
    const exampleIds = collectExampleIds(scenario.examples);

    for (let i = 0; i < exampleIds.length; i++) {
      const exampleId = exampleIds[i];

      const pickle = findPickleById(context, exampleId);

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

    const pickle = findPickleById(context, scenarioId);

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
  const pickleSteps = pickle.steps ?? [];
  const scenarioName = scenario.name || "<unamed scenario>";
  const tags = collectTagNames(pickle.tags);
  const beforeHooks = registry.resolveBeforeHooks(tags);
  const afterHooks = registry.resolveAfterHooks(tags);
  const definitionIds = pickleSteps.map(() => uuid());

  const steps: IStep[] = [
    ...beforeHooks.map((hook) => ({ hook })),
    ...pickleSteps.map((pickleStep) => ({ pickleStep })),
    ...afterHooks.map((hook) => ({ hook })),
  ];

  for (const id of definitionIds) {
    messages.stack.push({
      stepDefinition: {
        id,
        pattern: {
          source: "a step",
          type: "CUCUMBER_EXPRESSION" as unknown as messages.StepDefinition.StepDefinitionPattern.StepDefinitionPatternType,
        },
        sourceReference,
      },
    });
  }

  const testSteps: messages.TestCase.ITestStep[] = [];

  for (const beforeHook of beforeHooks) {
    testSteps.push({
      id: beforeHook.id,
      hookId: beforeHook.id,
    });
  }

  for (let i = 0; i < pickleSteps.length; i++) {
    const step = pickleSteps[i];

    testSteps.push({
      id: step.id,
      pickleStepId: step.id,
      stepDefinitionIds: [definitionIds[i]],
    });
  }

  for (const afterHook of afterHooks) {
    testSteps.push({
      id: afterHook.id,
      hookId: afterHook.id,
    });
  }

  messages.stack.push({
    testCase: {
      id: testCaseId,
      pickleId: pickle.id,
      testSteps,
    },
  });

  const astIdMap = gherkinDocumentsAstIdMaps.get(gherkinDocument);

  if (!testFilter.evaluate(tags)) {
    if (!context.omitFiltered) {
      it.skip(scenarioName);
    }

    return;
  }

  let attempt = 0;

  const internalProperties: InternalProperties = {
    pickle,
    testCaseStartedId: uuid(),
    allSteps: steps,
    remainingSteps: [...steps],
  };

  const env = { [INTERNAL_PROPERTY_NAME]: internalProperties };

  it(scenarioName, { env }, function () {
    const { remainingSteps, testCaseStartedId } = retrieveInternalProperties();

    assignRegistry(registry);

    messages.stack.push({
      testCaseStarted: {
        id: testCaseStartedId,
        testCaseId,
        attempt: attempt++,
      },
    });

    window.testState = {
      gherkinDocument,
      pickles,
      pickle,
    };

    for (const step of steps) {
      if (step.hook) {
        const hook = step.hook;

        cy.then(() => {
          Cypress.log({
            name: "step",
            displayName: hook.keyword,
            message: "",
          });

          messages.stack.push({
            testStepStarted: {
              testStepId: hook.id,
              testCaseStartedId,
            },
          });

          if (messages.enabled) {
            cy.task(TASK_TEST_STEP_STARTED, hook.id, { log: false });
          }
        })
          .then(() => {
            registry.runHook(this, hook);
          })
          .then(() => {
            messages.stack.push({
              testStepFinished: {
                testStepId: hook.id,
                testCaseStartedId,
                testStepResult: {
                  status: Status.Passed,
                },
              },
            });

            remainingSteps.shift();
          });
      } else if (step.pickleStep) {
        const pickleStep = step.pickleStep;

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

        cy.then(() => {
          Cypress.log({
            name: "step",
            displayName: assertAndReturn(
              "keyword" in scenarioStep && scenarioStep.keyword,
              "Expected to find a keyword in the scenario step"
            ),
            message: text,
          });
        });

        const argument: DataTable | string | undefined = pickleStep.argument
          ?.dataTable
          ? new DataTable(pickleStep.argument.dataTable)
          : pickleStep.argument?.docString?.content
          ? pickleStep.argument.docString.content
          : undefined;

        cy.then(() => {
          internalProperties.currentStep = { pickleStep };

          messages.stack.push({
            testStepStarted: {
              testStepId: pickleStep.id,
              testCaseStartedId,
            },
          });

          if (messages.enabled) {
            cy.task(TASK_TEST_STEP_STARTED, pickleStep.id, { log: false });
          }
        })
          .then(() => registry.runStepDefininition(this, text, argument))
          .then((result) => {
            if (result === "pending") {
              messages.stack.push({
                testStepFinished: {
                  testStepId: pickleStep.id,
                  testCaseStartedId,
                  testStepResult: {
                    status: Status.Pending,
                  },
                },
              });

              remainingSteps.shift();

              for (const skippedStep of remainingSteps) {
                const testStepId = assertAndReturn(
                  skippedStep.hook?.id ?? skippedStep.pickleStep?.id,
                  "Expected a step to either be a hook or a pickleStep"
                );

                messages.stack.push({
                  testStepStarted: {
                    testStepId,
                    testCaseStartedId,
                  },
                });

                messages.stack.push({
                  testStepFinished: {
                    testStepId,
                    testCaseStartedId,
                    testStepResult: {
                      status: Status.Skipped,
                    },
                  },
                });
              }

              for (let i = 0, count = remainingSteps.length; i < count; i++) {
                remainingSteps.pop();
              }

              this.skip();
            } else {
              messages.stack.push({
                testStepFinished: {
                  testStepId: pickleStep.id,
                  testCaseStartedId,
                  testStepResult: {
                    status: Status.Passed,
                  },
                },
              });

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
    if ("tags" in node) {
      tagNames.push(...collectTagNames(node.tags));
    }
  }

  return tagNames;
}

export default function createTests(
  registry: Registry,
  source: string,
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[],
  messagesEnabled: boolean,
  omitFiltered: boolean
) {
  const noopNode = { evaluate: () => true };
  const environmentTags = getTags(Cypress.env());
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

  for (const hook of [...registry.beforeHooks, ...registry.afterHooks]) {
    messages.push({
      hook: {
        id: hook.id,
        sourceReference,
      },
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
        omitFiltered,
        messages: {
          enabled: messagesEnabled,
          stack: messages,
        },
      },
      gherkinDocument.feature
    );
  }

  const isHooksAttached = globalThis[INTERNAL_PROPERTY_NAME];

  if (isHooksAttached) {
    return;
  } else {
    globalThis[INTERNAL_PROPERTY_NAME] = true;
  }

  afterEach(function () {
    freeRegistry();

    const properties = retrieveInternalProperties();

    const { testCaseStartedId, remainingSteps } = properties;

    if (remainingSteps.length > 0) {
      const error = assertAndReturn(
        this.currentTest?.err?.message,
        "Expected to find an error message"
      );

      if (HOOK_FAILURE_EXPR.test(error)) {
        return;
      }

      const failedStep = assertAndReturn(
        remainingSteps.shift(),
        "Expected there to be a remaining step"
      );

      const testStepId = assertAndReturn(
        failedStep.hook?.id ?? failedStep.pickleStep?.id,
        "Expected a step to either be a hook or a pickleStep"
      );

      const failedTestStepFinished: messages.IEnvelope = error.includes(
        "Step implementation missing"
      )
        ? {
            testStepFinished: {
              testStepId,
              testCaseStartedId,
              testStepResult: {
                status: Status.Undefined,
              },
            },
          }
        : {
            testStepFinished: {
              testStepId,
              testCaseStartedId,
              testStepResult: {
                status: Status.Failed,
                message: this.currentTest?.err?.message,
              },
            },
          };

      messages.push(failedTestStepFinished);

      for (const skippedStep of remainingSteps) {
        const testStepId = assertAndReturn(
          skippedStep.hook?.id ?? skippedStep.pickleStep?.id,
          "Expected a step to either be a hook or a pickleStep"
        );

        messages.push({
          testStepStarted: {
            testStepId,
            testCaseStartedId,
          },
        });

        messages.push({
          testStepFinished: {
            testStepId,
            testCaseStartedId,
            testStepResult: {
              status: Status.Skipped,
            },
          },
        });
      }
    }

    messages.push({
      testCaseFinished: {
        testCaseStartedId,
      },
    });

    /**
     * Repopulate internal properties in case previous test is retried.
     */
    properties.testCaseStartedId = uuid();
    properties.remainingSteps = properties.allSteps;
  });

  after(function () {
    if (messagesEnabled) {
      cy.task(TASK_APPEND_MESSAGES, messages, { log: false });
    }
  });
}
