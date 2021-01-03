import { PassThrough, Transform, TransformCallback } from "stream";

import { EventEmitter } from "events";

import { messages } from "@cucumber/messages";

import browserify from "@cypress/browserify-preprocessor";

import debug from "./debug";

import { compile } from "./template";

declare global {
  interface Window {
    testState: {
      gherkinDocument: messages.IGherkinDocument;
      pickles: messages.IPickle[];
      pickle: messages.IPickle;
    };
  }
}

export function transform(filepath: string) {
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
        done(null, await compile(buffer.toString("utf8"), filepath));

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

function preprendTransformerToOptions(options: any) {
  let wrappedTransform;

  if (
    !options.browserifyOptions ||
    !Array.isArray(options.browserifyOptions.transform)
  ) {
    wrappedTransform = [transform];
  } else if (!options.browserifyOptions.transform.includes(transform)) {
    wrappedTransform = [transform, ...options.browserifyOptions.transform];
  } else {
    wrappedTransform = options.browserifyOptions.transform;
  }

  return {
    ...options,
    browserifyOptions: {
      ...(options.browserifyOptions || {}),
      transform: wrappedTransform,
    },
  };
}

export function preprocessor(options = browserify.defaultOptions) {
  options = preprendTransformerToOptions(options);

  return function (file: ICypressPreprocessorFile) {
    return browserify(options)(file);
  };
}

export default preprocessor
