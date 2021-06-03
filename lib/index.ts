import { messages } from "@cucumber/messages";

declare global {
  interface Window {
    testState: {
      gherkinDocument: messages.IGherkinDocument;
      pickles: messages.IPickle[];
      pickle: messages.IPickle;
    };
  }
}

export {
  resolveConfiguration as resolveCypressConfiguration,
  resolveEnvironment as resolveCypressEnvironment,
} from "./cypress-configuration";

export { resolve as resolvePreprocessorConfiguration } from "./preprocessor-configuration";

export { getStepDefinitionPaths } from "./step-definitions";
