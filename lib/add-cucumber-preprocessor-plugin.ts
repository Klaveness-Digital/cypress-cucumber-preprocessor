import syncFs, { promises as fs, constants as fsConstants } from "fs";

import path from "path";

import child_process from "child_process";

import chalk from "chalk";

import { messages } from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import { generateMessages } from "@cucumber/gherkin";

import { IdGenerator } from "@cucumber/messages";

import {
  getTestFiles,
  ICypressConfiguration,
} from "@badeball/cypress-configuration";

import {
  HOOK_FAILURE_EXPR,
  TASK_APPEND_MESSAGES,
  TASK_CREATE_STRING_ATTACHMENT,
  TASK_TEST_STEP_STARTED,
} from "./constants";

import { resolve } from "./preprocessor-configuration";

import { notNull } from "./type-guards";

import { getTags } from "./environment-helpers";

export default async function addCucumberPreprocessorPlugin(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) {
  const preprocessor = await resolve();

  const messagesPath = path.join(
    config.projectRoot,
    preprocessor.messages.output
  );

  const jsonPath = path.join(config.projectRoot, preprocessor.json.output);

  on("before:run", async () => {
    if (!preprocessor.messages.enabled) {
      return;
    }

    await fs.rm(messagesPath, { force: true });
  });

  on("after:run", async () => {
    if (!preprocessor.messages.enabled) {
      return;
    }

    try {
      await fs.access(messagesPath, fsConstants.F_OK);
    } catch {
      return;
    }

    const messages = await fs.open(messagesPath, "r");

    try {
      const json = await fs.open(jsonPath, "w");

      try {
        const child = child_process.spawn(preprocessor.json.formatter, {
          stdio: [messages.fd, json.fd, "inherit"],
        });

        await new Promise<void>((resolve, reject) => {
          child.on("exit", (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(
                new Error(
                  `${preprocessor.json.formatter} exited non-successfully`
                )
              );
            }
          });

          child.on("error", reject);
        });
      } finally {
        await json.close();
      }
    } finally {
      await messages.close();
    }
  });

  let currentTestStepStartedId: string;
  let currentSpecMessages: messages.IEnvelope[];

  on("before:spec", () => {
    currentSpecMessages = [];
  });

  on("after:spec", async (_spec, results) => {
    if (!preprocessor.messages.enabled || !currentSpecMessages) {
      return;
    }

    const wasRemainingSkipped = results.tests.some((test) =>
      test.displayError?.match(HOOK_FAILURE_EXPR)
    );

    if (wasRemainingSkipped) {
      console.log(
        chalk.yellow(
          `  Hook failures can't be represented in JSON reports, thus none is created for ${_spec.relative}.`
        )
      );
    } else {
      await fs.writeFile(
        messagesPath,
        currentSpecMessages
          .map((message) => JSON.stringify(message))
          .join("\n") + "\n",
        {
          flag: "a",
        }
      );
    }
  });

  on("after:screenshot", async (details) => {
    if (!preprocessor.messages.enabled || !currentSpecMessages) {
      return details;
    }

    let buffer;

    try {
      buffer = await fs.readFile(details.path);
    } catch {
      return details;
    }

    const message: messages.IEnvelope = {
      attachment: {
        testStepId: currentTestStepStartedId,
        body: buffer.toString("base64"),
        mediaType: "image/png",
        contentEncoding:
          "BASE64" as unknown as messages.Attachment.ContentEncoding,
      },
    };

    currentSpecMessages.push(message);

    return details;
  });

  on("task", {
    [TASK_APPEND_MESSAGES]: (messages: messages.IEnvelope[]) => {
      if (!currentSpecMessages) {
        return;
      }

      currentSpecMessages.push(...messages);

      return true;
    },

    [TASK_TEST_STEP_STARTED]: (testStepStartedId) => {
      if (!currentSpecMessages) {
        return;
      }

      currentTestStepStartedId = testStepStartedId;

      return true;
    },

    [TASK_CREATE_STRING_ATTACHMENT]: ({ data, mediaType, encoding }) => {
      if (!currentSpecMessages) {
        return;
      }

      const message: messages.IEnvelope = {
        attachment: {
          testStepId: currentTestStepStartedId,
          body: data,
          mediaType: mediaType,
          contentEncoding: encoding,
        },
      };

      currentSpecMessages.push(message);

      return true;
    },
  });

  const tags = getTags(config.env);

  if (tags !== null && preprocessor.filterSpecs) {
    const node = parse(tags);

    (config as any).testFiles = getTestFiles(
      config as unknown as ICypressConfiguration
    ).filter((testFile) => {
      const content = syncFs.readFileSync(testFile).toString("utf-8");

      const options = {
        includeSource: false,
        includeGherkinDocument: false,
        includePickles: true,
        newId: IdGenerator.incrementing(),
      };

      const envelopes = generateMessages(content, testFile, options);

      const pickles = envelopes
        .map((envelope) => envelope.pickle)
        .filter(notNull);

      return pickles.some((pickle) =>
        node.evaluate(pickle.tags?.map((tag) => tag.name).filter(notNull) ?? [])
      );
    });
  }

  return config;
}
