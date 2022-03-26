import path from "path";

import { generateMessages } from "@cucumber/gherkin";

import { IdGenerator } from "@cucumber/messages";

import { ICypressConfiguration } from "@badeball/cypress-configuration";

import { assertAndReturn } from "./assertions";

import { resolve } from "./preprocessor-configuration";

import { getStepDefinitionPaths } from "./step-definitions";

import { notNull } from "./type-guards";

export async function compile(
  this: any,
  configuration: ICypressConfiguration,
  data: string,
  uri: string = this.resourcePath
) {
  const options = {
    includeSource: false,
    includeGherkinDocument: true,
    includePickles: true,
    newId: IdGenerator.uuid(),
  };

  const relativeUri = path.relative(configuration.projectRoot, uri);

  const envelopes = generateMessages(data, relativeUri, options);

  if (envelopes[0].parseError) {
    throw new Error(
      assertAndReturn(
        envelopes[0].parseError.message,
        "Expected parse error to have a description"
      )
    );
  }

  const gherkinDocument = assertAndReturn(
    envelopes.map((envelope) => envelope.gherkinDocument).find(notNull),
    "Expected to find a gherkin document amongst the envelopes."
  );

  const pickles = envelopes.map((envelope) => envelope.pickle).filter(notNull);

  const preprocessor = await resolve();

  const stepDefinitions = await getStepDefinitionPaths(
    {
      cypress: configuration,
      preprocessor,
    },
    uri
  );

  return `
    const { default: createTests } = require("@badeball/cypress-cucumber-preprocessor/lib/create-tests");
    const { withRegistry } = require("@badeball/cypress-cucumber-preprocessor/lib/registry");

    const registry = withRegistry(() => {
      ${stepDefinitions
        .map((stepDefintion) => `require("${stepDefintion}");`)
        .join("\n    ")}
    });

    registry.finalize();

    createTests(
      registry,
      ${JSON.stringify(data)},
      ${JSON.stringify(gherkinDocument)},
      ${JSON.stringify(pickles)},
      ${preprocessor.messages.enabled}
    );
  `;
}
