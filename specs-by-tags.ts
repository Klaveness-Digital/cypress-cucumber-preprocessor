#!/usr/bin/env node

import fs from "fs";

import util from "util";

import { AstBuilder, Parser, compile } from "@cucumber/gherkin";

import { IdGenerator } from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import { assertAndReturn, assertIsString } from "./lib/assertions";

import { mapTagName } from "./lib/ast-helpers";

import { resolveEnvironment } from "./lib/cypress-configuration";

import { find } from "./lib/cypress-specs";

export { find };

export function findByTags(tags: any) {
  const files = find();

  if (!tags) {
    return files;
  }

  assertIsString(
    tags,
    `Expected "integrationFolder" to be a string, got ${util.inspect(tags)}`
  );

  const testFilter = parse(tags);

  return files
    .filter((file) => file.endsWith(".feature"))
    .filter((file) => {
      const content = fs.readFileSync(file).toString();
      const newId = IdGenerator.incrementing();
      const gherkinDocument = new Parser(new AstBuilder(newId)).parse(content);
      const pickles = compile(gherkinDocument, file, newId);

      return pickles.some((pickle) =>
        testFilter.evaluate(pickle.tags?.map(mapTagName) || [])
      );
    });
}

if (require.main === module) {
  const hasSpecArg = process.argv.some((arg) =>
    arg.match(/^(?:-s|--spec(?:=|$))/)
  );

  if (hasSpecArg) {
    console.error("-s / --spec is already defined");
    process.exit(1);
  }

  const { TAGS } = resolveEnvironment({});

  console.log(findByTags(TAGS).join(","));
}
