import { messages } from "@cucumber/messages";

import DataTable from "./data_table";

import {
  IHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./types";

import * as Methods from "./methods";

declare global {
  interface Window {
    testState: {
      gherkinDocument: messages.IGherkinDocument;
      pickles: messages.IPickle[];
      pickle: messages.IPickle;
    };
  }
}

export { resolve as resolvePreprocessorConfiguration } from "./preprocessor-configuration";

export { getStepDefinitionPaths } from "./step-definitions";

export {
  default as addCucumberPreprocessorPlugin,
  beforeRunHandler,
  afterRunHandler,
  beforeSpecHandler,
  afterSpecHandler,
  afterScreenshotHandler,
} from "./add-cucumber-preprocessor-plugin";

/**
 * Everything below exist merely for the purpose of being nice with TypeScript. All of these methods
 * are exclusively used in the browser and the browser field in package.json points to ./methods.ts.
 */
function createUnimplemented() {
  return new Error("Cucumber methods aren't available in a node environment");
}

export { NOT_FEATURE_ERROR } from "./methods";

export function isFeature(): boolean {
  throw createUnimplemented();
}

export function doesFeatureMatch(expression: string): boolean {
  throw createUnimplemented();
}

export function defineStep<T extends unknown[]>(
  description: string | RegExp,
  implementation: IStepDefinitionBody<T>
) {
  throw createUnimplemented();
}

export {
  defineStep as Given,
  defineStep as When,
  defineStep as Then,
  defineStep as And,
  defineStep as But,
};

export function Step(
  world: Mocha.Context,
  text: string,
  argument?: DataTable | string
) {
  throw createUnimplemented();
}

export function defineParameterType<T>(options: IParameterTypeDefinition<T>) {
  throw createUnimplemented();
}

export function attach(data: string | ArrayBuffer, mediaType?: string) {
  throw createUnimplemented();
}

export function Before(options: { tags?: string }, fn: IHookBody): void;
export function Before(fn: IHookBody): void;
export function Before(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
) {
  throw createUnimplemented();
}

export function After(options: { tags?: string }, fn: IHookBody): void;
export function After(fn: IHookBody): void;
export function After(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
) {
  throw createUnimplemented();
}

export { default as DataTable } from "./data_table";
