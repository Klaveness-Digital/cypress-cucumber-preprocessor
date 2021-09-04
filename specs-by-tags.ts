#!/usr/bin/env node

import fs from "fs";

import util from "util";

import { AstBuilder, Parser, compile } from "@cucumber/gherkin";

import { IdGenerator } from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import { getEnvironment, getTestFiles } from "@badeball/cypress-configuration";

import { assertIsString } from "./lib/assertions";

import { mapTagName } from "./lib/ast-helpers";

export function findByTags(
  tags: string,
  options: {
    argv: string[];
    env: NodeJS.ProcessEnv;
    cwd: string;
  }
) {
  const files = getTestFiles(options);

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
  const { TAGS } = getEnvironment({
    argv: process.argv,
    env: process.env,
    cwd: process.cwd(),
  });

  if (TAGS == null || TAGS === "") {
    process.exit(0);
  }

  assertIsString(
    TAGS,
    `Expected "TAGS" to be a string, got ${util.inspect(TAGS)}`
  );

  const hasSpecArg = process.argv.some((arg) =>
    arg.match(/^(?:-s|--spec(?:=|$))/)
  );

  if (hasSpecArg) {
    console.error("-s / --spec is already defined");
    process.exit(1);
  }

  console.log(
    findByTags(TAGS, {
      argv: process.argv,
      env: process.env,
      cwd: process.cwd(),
    }).join(",")
  );
}
