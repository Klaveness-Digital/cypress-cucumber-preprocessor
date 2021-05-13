import { PassThrough, Transform, TransformCallback } from "stream";

import { EventEmitter } from "events";

import { messages } from "@cucumber/messages";

import browserify from "@cypress/browserify-preprocessor";

import debug from "./debug";

import { compile } from "./template";

import { ICypressConfiguration } from "./cypress-configuration";

declare global {
  interface Window {
    testState: {
      gherkinDocument: messages.IGherkinDocument;
      pickles: messages.IPickle[];
      pickle: messages.IPickle;
    };
  }
}

export function transform(
  configuration: ICypressConfiguration,
  filepath: string
) {
  if (!filepath.match(".feature$")) {
    return new PassThrough();
  }

  debug(`compiling ${filepath}`);

  let buffer = Buffer.alloc(0);

  return new Transform({
    transform(chunk: any, encoding: string, done: TransformCallback) {
      buffer = Buffer.concat([buffer, chunk]);
      done();
    },
    async flush(done: TransformCallback) {
      try {
        done(
          null,
          await compile(configuration, buffer.toString("utf8"), filepath)
        );

        debug(`compiled ${filepath}`);
      } catch (e) {
        done(e);
      }
    },
  });
}

// https://docs.cypress.io/api/plugins/preprocessors-api.html#File-object
type ICypressPreprocessorFile = EventEmitter & {
  filePath: string;
  outputPath: string;
  shouldWatch: boolean;
};

function preprendTransformerToOptions(
  configuration: ICypressConfiguration,
  options: any
) {
  let wrappedTransform;

  if (
    !options.browserifyOptions ||
    !Array.isArray(options.browserifyOptions.transform)
  ) {
    wrappedTransform = [transform.bind(null, configuration)];
  } else {
    wrappedTransform = [
      transform.bind(null, configuration),
      ...options.browserifyOptions.transform,
    ];
  }

  return {
    ...options,
    browserifyOptions: {
      ...(options.browserifyOptions || {}),
      transform: wrappedTransform,
    },
  };
}

export function preprocessor(
  configuration: ICypressConfiguration,
  options = browserify.defaultOptions,
  { prependTransform = true }: { prependTransform?: boolean } = {}
) {
  if (prependTransform) {
    options = preprendTransformerToOptions(configuration, options);
  }

  return function (file: ICypressPreprocessorFile) {
    return browserify(options)(file);
  };
}

export { ICypressConfiguration };

export { compile };

export default preprocessor;
