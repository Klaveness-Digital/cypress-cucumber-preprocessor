import {
  CucumberExpression,
  RegularExpression,
  Expression,
  ParameterTypeRegistry,
  ParameterType,
} from "@cucumber/cucumber-expressions";

import parse from "@cucumber/tag-expressions";

import { assertAndReturn } from "./assertions";

import DataTable from "./data_table";

import { isString } from "./type-guards";

import {
  IHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./types";

interface IStepDefinition<T extends unknown[]> {
  expression: Expression;
  implementation: IStepDefinitionBody<T>;
}

const noopNode = { evaluate: () => true };

function retrieveCurrentTagsOrWarn() {
  const isFeatureSpec = Cypress.spec.name.endsWith(".feature");

  const envTags = Cypress.env("tags");

  const tags = isFeatureSpec
    ? envTags
    : envTags ??
      (cy.log(
        "⚠️ cypress-cucumber-preprocessor: Using Cucumber hooks with non-feature files is supported and you can tag them yourself using the `tags` environment variable. Use an explicit, empty array to remove this warning."
      ),
      []);

  if (!Array.isArray(tags)) {
    throw new Error(
      "cypress-cucumber-preprocessor: Expected an array of tags. This might mean that you have erroneously overriden the environment variable yourself."
    );
  } else if (!tags.every(isString)) {
    throw new Error(
      "cypress-cucumber-preprocessor: Expected an array of strings. This might mean that you have erroneously overriden the environment variable yourself."
    );
  } else {
    return tags;
  }
}

export class Registry {
  private parameterTypeRegistry: ParameterTypeRegistry;

  private preliminaryStepDefinitions: {
    description: string | RegExp;
    implementation: () => void;
  }[] = [];

  private stepDefinitions: IStepDefinition<unknown[]>[];

  constructor() {
    this.defineStep = this.defineStep.bind(this);
    this.runStepDefininition = this.runStepDefininition.bind(this);
    this.defineParameterType = this.defineParameterType.bind(this);
    this.defineBefore = this.defineBefore.bind(this);
    this.defineAfter = this.defineAfter.bind(this);

    this.parameterTypeRegistry = new ParameterTypeRegistry();

    this.stepDefinitions = [];
  }

  public finalize() {
    for (const { description, implementation } of this
      .preliminaryStepDefinitions) {
      if (typeof description === "string") {
        this.stepDefinitions.push({
          expression: new CucumberExpression(
            description,
            this.parameterTypeRegistry
          ),
          implementation,
        });
      } else {
        this.stepDefinitions.push({
          expression: new RegularExpression(
            description,
            this.parameterTypeRegistry
          ),
          implementation,
        });
      }
    }
  }

  public defineStep(description: string | RegExp, implementation: () => void) {
    if (typeof description !== "string" && !(description instanceof RegExp)) {
      throw new Error("Unexpected argument for step definition");
    }

    this.preliminaryStepDefinitions.push({
      description,
      implementation,
    });
  }

  public defineParameterType<T>({
    name,
    regexp,
    transformer,
  }: IParameterTypeDefinition<T>) {
    this.parameterTypeRegistry.defineParameterType(
      new ParameterType(name, regexp, null, transformer, true, false)
    );
  }

  public defineBefore(options: { tags?: string }, fn: IHookBody) {
    const node = options.tags ? parse(options.tags) : noopNode;

    beforeEach(function () {
      if (node.evaluate(retrieveCurrentTagsOrWarn())) {
        fn.call(this);
      }
    });
  }

  public defineAfter(options: { tags?: string }, fn: IHookBody) {
    const node = options.tags ? parse(options.tags) : noopNode;

    afterEach(function () {
      if (node.evaluate(retrieveCurrentTagsOrWarn())) {
        fn.call(this);
      }
    });
  }

  private resolveStepDefintion(text: string) {
    const matchingStepDefinitions = this.stepDefinitions.filter(
      (stepDefinition) => stepDefinition.expression.match(text)
    );

    if (matchingStepDefinitions.length === 0) {
      throw new Error(`Step implementation missing for: ${text}`);
    } else if (matchingStepDefinitions.length > 1) {
      throw new Error(
        `Multiple matching step definitions for: ${text}\n` +
          matchingStepDefinitions
            .map((stepDefinition) => {
              const { expression } = stepDefinition;
              if (expression instanceof RegularExpression) {
                return ` ${expression.regexp}`;
              } else if (expression instanceof CucumberExpression) {
                return ` ${expression.source}`;
              }
            })
            .join("\n")
      );
    } else {
      return matchingStepDefinitions[0];
    }
  }

  public runStepDefininition(
    world: Mocha.Context,
    text: string,
    argument?: DataTable | string
  ) {
    const stepDefinition = this.resolveStepDefintion(text);

    const args = stepDefinition.expression
      .match(text)!
      .map((match) => match.getValue(world));

    if (argument) {
      args.push(argument);
    }

    return stepDefinition.implementation.apply(world, args);
  }
}

declare global {
  namespace globalThis {
    var __cypress_cucumber_preprocessor_registry_dont_use_this:
      | Registry
      | undefined;
  }
}

const globalPropertyName =
  "__cypress_cucumber_preprocessor_registry_dont_use_this";

export function withRegistry(fn: () => void): Registry {
  const registry = new Registry();
  assignRegistry(registry);
  fn();
  freeRegistry();
  return registry;
}

export function assignRegistry(registry: Registry) {
  globalThis[globalPropertyName] = registry;
}

export function freeRegistry() {
  delete globalThis[globalPropertyName];
}

export function getRegistry() {
  return assertAndReturn(
    globalThis[globalPropertyName],
    "Expected to find a global registry (this usually means you are trying to define steps or hooks in support/index.js, which is not supported)"
  );
}
