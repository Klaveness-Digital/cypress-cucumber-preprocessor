import {
  CucumberExpression,
  RegularExpression,
  Expression,
  ParameterTypeRegistry,
  ParameterType,
} from "@cucumber/cucumber-expressions";

import parse from "@cucumber/tag-expressions";

import { assertAndReturn, isString } from "./assertions";

import DataTable from "./data_table";

import {
  IHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./types";

interface IStepDefinition<T extends unknown[]> {
  expression: Expression;
  implementation: IStepDefinitionBody<T>;
}

interface IHook {
  node: ReturnType<typeof parse>;
  implementation: IHookBody;
}

function parseHookArguments(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
): IHook {
  const noopNode = { evaluate: () => true };

  if (typeof optionsOrFn === "function") {
    if (maybeFn) {
      throw new Error("Unexpected argument for Before hook");
    }

    return { implementation: optionsOrFn, node: noopNode };
  } else if (typeof optionsOrFn === "object") {
    if (typeof maybeFn !== "function") {
      throw new Error("Unexpected argument for Before hook");
    }

    return {
      node: optionsOrFn.tags ? parse(optionsOrFn.tags) : noopNode,
      implementation: maybeFn,
    };
  } else {
    throw new Error("Unexpected argument for Before hook");
  }
}

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
  public methods: {
    defineStep<T extends unknown[]>(
      description: string | RegExp,
      body: IStepDefinitionBody<T>
    ): void;
    Step(
      world: Mocha.Context,
      description: string,
      argument?: DataTable | string
    ): void;
    defineParameterType<T>(options: IParameterTypeDefinition<T>): void;
    Before(options: { tags?: string }, fn: IHookBody): void;
    Before(fn: IHookBody): void;
    After(options: { tags?: string }, fn: IHookBody): void;
    After(fn: IHookBody): void;
  };

  private parameterTypeRegistry: ParameterTypeRegistry;

  private stepDefinitions: IStepDefinition<unknown[]>[];

  private beforeHooks: IHook[];

  private afterHooks: IHook[];

  constructor() {
    this.methods = {
      defineStep: this.defineStep.bind(this),
      Step: this.runStepDefininition.bind(this),
      defineParameterType: this.defineParameterType.bind(this),
      Before: this.defineBefore.bind(this),
      After: this.defineAfter.bind(this),
    };

    this.parameterTypeRegistry = new ParameterTypeRegistry();

    this.stepDefinitions = [];

    this.beforeHooks = [];

    this.afterHooks = [];
  }

  private defineStep(description: string | RegExp, implementation: () => void) {
    if (typeof description === "string") {
      this.stepDefinitions.push({
        expression: new CucumberExpression(
          description,
          this.parameterTypeRegistry
        ),
        implementation,
      });
    } else if (description instanceof RegExp) {
      this.stepDefinitions.push({
        expression: new RegularExpression(
          description,
          this.parameterTypeRegistry
        ),
        implementation,
      });
    } else {
      throw new Error("Unexpected argument for step definition");
    }
  }

  private defineParameterType<T>({
    name,
    regexp,
    transformer,
    useForSnippets,
    preferForRegexpMatch,
  }: IParameterTypeDefinition<T>) {
    if (typeof useForSnippets !== "boolean") useForSnippets = true;
    if (typeof preferForRegexpMatch !== "boolean") preferForRegexpMatch = false;

    this.parameterTypeRegistry.defineParameterType(
      new ParameterType(
        name,
        regexp,
        null,
        transformer,
        useForSnippets,
        preferForRegexpMatch
      )
    );
  }

  private defineBefore(options: { tags?: string }, fn: IHookBody): void;
  private defineBefore(fn: IHookBody): void;
  private defineBefore(
    optionsOrFn: IHookBody | { tags?: string },
    maybeFn?: IHookBody
  ) {
    const { implementation, node } = parseHookArguments(optionsOrFn, maybeFn);

    beforeEach(function () {
      if (node.evaluate(retrieveCurrentTagsOrWarn())) {
        implementation.call(this);
      }
    });
  }

  private defineAfter(options: { tags?: string }, fn: IHookBody): void;
  private defineAfter(fn: IHookBody): void;
  private defineAfter(
    optionsOrFn: IHookBody | { tags?: string },
    maybeFn?: IHookBody
  ) {
    const { implementation, node } = parseHookArguments(optionsOrFn, maybeFn);

    afterEach(function () {
      if (node.evaluate(retrieveCurrentTagsOrWarn())) {
        implementation.call(this);
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
      .match(text)
      .map((match) => match.getValue(world));

    if (argument) {
      args.push(argument);
    }

    stepDefinition.implementation.apply(world, args);
  }
}

const globalPropertyName =
  "__cypress_cucumber_preprocessor_registry_dont_use_this";

declare global {
  namespace globalThis {
    var __cypress_cucumber_preprocessor_registry_dont_use_this:
      | Registry
      | undefined;
  }
}

const registry =
  globalThis[globalPropertyName] ||
  (globalThis[globalPropertyName] = new Registry());

export default registry;
