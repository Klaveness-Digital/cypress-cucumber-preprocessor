import { messages } from "@cucumber/messages";

import * as Methods from "./methods";

import { IHookBody } from "./types";

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

export { default as addCucumberPreprocessorPlugin } from "./add-cucumber-preprocessor-plugin";

/**
 * Everything below exist merely for the purpose of being nice with TypeScript. All of these methods
 * are exclusively used in the browser and the browser field in package.json points to ./methods.ts.
 */
function createUnimplemented() {
  return new Error("Cucumber methods aren't available in a node environment");
}

function createUnimplementation<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args) => {
    throw createUnimplemented();
  };
}

export const Given = createUnimplementation(Methods.Given);
export const When = createUnimplementation(Methods.When);
export const Then = createUnimplementation(Methods.Then);
export const And = createUnimplementation(Methods.And);
export const But = createUnimplementation(Methods.But);
export const defineStep = createUnimplementation(Methods.defineStep);
export const defineParameterType = createUnimplementation(
  Methods.defineParameterType
);
export const Step = createUnimplementation(Methods.Step);

export function defineBefore(options: { tags?: string }, fn: IHookBody): void;
export function defineBefore(fn: IHookBody): void;
export function defineBefore(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
) {
  throw createUnimplemented();
}

export function defineAfter(options: { tags?: string }, fn: IHookBody): void;
export function defineAfter(fn: IHookBody): void;
export function defineAfter(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
) {
  throw createUnimplemented();
}
