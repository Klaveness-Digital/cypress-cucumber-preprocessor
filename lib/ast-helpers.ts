import { messages } from "@cucumber/messages";

import { assertAndReturn } from "./assertions";

export function* traverseGherkinDocument(
  gherkinDocument: messages.IGherkinDocument
) {
  yield gherkinDocument;

  if (gherkinDocument.feature) {
    yield* traverseFeature(gherkinDocument.feature);
  }
}

function* traverseFeature(feature: messages.GherkinDocument.IFeature) {
  yield feature;

  if (feature.location) {
    yield feature.location;
  }

  if (feature.tags) {
    for (const tag of feature.tags) {
      yield tag;
    }
  }

  if (feature.children) {
    for (const child of feature.children) {
      yield* traverseFeatureChild(child);
    }
  }
}

function* traverseFeatureChild(
  featureChild: messages.GherkinDocument.Feature.IFeatureChild
) {
  yield featureChild;

  if (featureChild.rule) {
    yield* traverseFeatureRule(featureChild.rule);
  }

  if (featureChild.background) {
    yield* traverseBackground(featureChild.background);
  }

  if (featureChild.scenario) {
    yield* traverseScenario(featureChild.scenario);
  }
}

function* traverseFeatureRule(
  rule: messages.GherkinDocument.Feature.FeatureChild.IRule
) {
  yield rule;

  if (rule.location) {
    yield rule.location;
  }

  if (rule.children) {
    for (const child of rule.children) {
      yield* traverseRuleChild(child);
    }
  }
}

function* traverseRuleChild(
  ruleChild: messages.GherkinDocument.Feature.FeatureChild.IRuleChild
) {
  yield ruleChild;

  if (ruleChild.background) {
    yield* traverseBackground(ruleChild.background);
  }

  if (ruleChild.scenario) {
    yield* traverseScenario(ruleChild.scenario);
  }
}

function* traverseBackground(
  backgorund: messages.GherkinDocument.Feature.IBackground
) {
  yield backgorund;

  if (backgorund.location) {
    yield backgorund.location;
  }

  if (backgorund.steps) {
    for (const step of backgorund.steps) {
      yield* traverseStep(step);
    }
  }
}

function* traverseScenario(
  scenario: messages.GherkinDocument.Feature.IScenario
) {
  yield scenario;

  if (scenario.location) {
    yield scenario.location;
  }

  if (scenario.steps) {
    for (const step of scenario.steps) {
      yield* traverseStep(step);
    }
  }

  if (scenario.examples) {
    for (const example of scenario.examples) {
      yield* traverseExample(example);
    }
  }
}

function* traverseStep(step: messages.GherkinDocument.Feature.IStep) {
  yield step;

  if (step.location) {
    yield step.location;
  }

  if (step.docString) {
    yield* traverseDocString(step.docString);
  }

  if (step.dataTable) {
    yield* traverseDataTable(step.dataTable);
  }
}

function* traverseDocString(
  docString: messages.GherkinDocument.Feature.Step.IDocString
) {
  yield docString;

  if (docString.location) {
    yield docString.location;
  }
}

function* traverseDataTable(
  dataTable: messages.GherkinDocument.Feature.Step.IDataTable
) {
  yield dataTable;

  if (dataTable.location) {
    yield dataTable.location;
  }

  if (dataTable.rows) {
    for (const row of dataTable.rows) {
      yield* traverseRow(row);
    }
  }
}

function* traverseRow(row: messages.GherkinDocument.Feature.ITableRow) {
  yield row;

  if (row.location) {
    yield row.location;
  }

  if (row.cells) {
    for (const cell of row.cells) {
      yield* traverseCell(cell);
    }
  }
}

function* traverseCell(
  cell: messages.GherkinDocument.Feature.TableRow.ITableCell
) {
  yield cell;

  if (cell.location) {
    yield cell.location;
  }
}

function* traverseExample(
  example: messages.GherkinDocument.Feature.Scenario.IExamples
) {
  yield example;

  if (example.location) {
    yield example.location;
  }

  if (example.tableHeader) {
    yield* traverseRow(example.tableHeader);
  }

  if (example.tableBody) {
    for (const row of example.tableBody) {
      yield* traverseRow(row);
    }
  }
}

export function collectTagNames(
  tags: messages.GherkinDocument.Feature.ITag[] | null | undefined
) {
  return (
    tags?.map((tag) =>
      assertAndReturn(tag.name, "Expected tag to have a name")
    ) ?? []
  );
}
