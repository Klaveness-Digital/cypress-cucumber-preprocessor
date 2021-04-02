import { messages } from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import { assertAndReturn } from "./assertions";

import DataTable from "./data_table";

import registry from "./registry";

import { traverseGherkinDocument, mapTagName } from "./ast-helpers";

import { YieldType } from "./types";

type Node = ReturnType<typeof parse>;

function createFeature(
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[],
  feature: messages.GherkinDocument.IFeature,
  testFilter: Node
) {
  describe(feature.name || "<unamed feature>", () => {
    if (feature.children) {
      for (const child of feature.children) {
        if (child.scenario) {
          createScenario(gherkinDocument, pickles, child.scenario, testFilter);
        } else if (child.rule) {
          createRule(gherkinDocument, pickles, child.rule, testFilter);
        }
      }
    }
  });
}

function createRule(
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[],
  rule: messages.GherkinDocument.Feature.FeatureChild.IRule,
  testFilter: Node
) {
  describe(rule.name || "<unamed rule>", () => {
    if (rule.children) {
      for (const child of rule.children) {
        if (child.scenario) {
          createScenario(gherkinDocument, pickles, child.scenario, testFilter);
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
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[],
  scenario: messages.GherkinDocument.Feature.IScenario,
  testFilter: Node
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

    const picklesToRun = exampleIds
      .map((exampleId) =>
        assertAndReturn(
          pickles.find(
            (pickle) =>
              pickle.astNodeIds && pickle.astNodeIds.includes(exampleId)
          ),
          `Expected to find a pickle associated with id = ${exampleId}`
        )
      )
      .filter((pickle) =>
        testFilter.evaluate(pickle.tags?.map(mapTagName) || [])
      );

    for (let i = 0; i < picklesToRun.length; i++) {
      const pickle = picklesToRun[i];

      const exampleName = `${assertAndReturn(
        pickle.name,
        "Expected pickle to have a name"
      )} (example #${i + 1})`;

      createPickle(
        gherkinDocument,
        pickles,
        { ...scenario, name: exampleName },
        pickle,
        testFilter
      );
    }
  } else {
    const scenarioId = assertAndReturn(
      scenario.id,
      "Expected scenario to have an id"
    );

    const pickle = assertAndReturn(
      pickles.find(
        (pickle) => pickle.astNodeIds && pickle.astNodeIds.includes(scenarioId)
      ),
      `Expected to find a pickle associated with id = ${scenarioId}`
    );

    createPickle(gherkinDocument, pickles, scenario, pickle, testFilter);
  }
}

function createPickle(
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[],
  scenario: messages.GherkinDocument.Feature.IScenario,
  pickle: messages.IPickle,
  testFilter: Node
) {
  const astIdMap = gherkinDocumentsAstIdMaps.get(gherkinDocument);

  const tags = pickle.tags ? pickle.tags.map(mapTagName) : [];

  if (!testFilter.evaluate(tags)) {
    return;
  }

  it(scenario.name || "<unamed scenario>", { env: { tags } }, function () {
    window.testState = {
      gherkinDocument,
      pickles,
      pickle,
    };

    if (pickle.steps) {
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
            message: (text as unknown) as any[], // This property was wrongfully typed in 3.x.y.
          });
        });

        const argument: DataTable | string | undefined = pickleStep.argument
          ?.dataTable
          ? new DataTable(pickleStep.argument.dataTable)
          : pickleStep.argument?.docString?.content
          ? pickleStep.argument.docString.content
          : undefined;

        cy.then(() => registry.runStepDefininition(this, text, argument));
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
  gherkinDocument: messages.IGherkinDocument,
  pickles: messages.IPickle[]
) {
  const noopNode = { evaluate: () => true };

  const environmentTags = Cypress.env("TAGS");

  const testFilter = collectTagNamesFromGherkinDocument(
    gherkinDocument
  ).includes("@focus")
    ? parse("@focus")
    : environmentTags
    ? parse(environmentTags)
    : noopNode;

  if (gherkinDocument.feature) {
    createFeature(
      gherkinDocument,
      pickles,
      gherkinDocument.feature,
      testFilter
    );
  }
}
