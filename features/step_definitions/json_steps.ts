import { Given, Then } from "@cucumber/cucumber";
import { WritableStreamBuffer } from "stream-buffers";
import { Readable } from "stream";
import path from "path";
import { promises as fs } from "fs";
import assert from "assert";
import child_process from "child_process";

function isObject(object: any): object is object {
  return typeof object === "object" && object != null;
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

function* traverseTree(object: any): Generator<object, void, any> {
  if (!isObject(object)) {
    throw new Error(`Expected object, got ${typeof object}`);
  }

  yield object;

  for (const property of Object.values(object)) {
    if (isObject(property)) {
      yield* traverseTree(property);
    }
  }
}

function prepareJsonReport(tree: any) {
  for (const node of traverseTree(tree)) {
    if (hasOwnProperty(node, "duration")) {
      delete node.duration;
    } else if (hasOwnProperty(node, "uri") && typeof node.uri === "string") {
      node.uri = node.uri.replace(/\\/g, "/");
    }
  }

  return tree;
}

Given("I've ensured cucumber-json-formatter is installed", async () => {
  const child = child_process.spawn("which", ["cucumber-json-formatter"], {
    stdio: "ignore",
  });

  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("cucumber-json-formatter must be installed"));
      }
    });
  });
});

Then("there should be no JSON output", async function () {
  await assert.rejects(
    () => fs.readFile(path.join(this.tmpDir, "cucumber-messages.ndjson")),
    {
      code: "ENOENT",
    },
    "Expected there to be no JSON directory"
  );
});

Then(
  "there should be a JSON output similar to {string}",
  async function (fixturePath) {
    const absolutejsonPath = path.join(this.tmpDir, "cucumber-report.json");

    const json = await fs.readFile(absolutejsonPath);

    const absoluteExpectedJsonpath = path.join(
      process.cwd(),
      "features",
      fixturePath
    );

    const actualJsonOutput = prepareJsonReport(JSON.parse(json.toString()));

    if (process.env.WRITE_FIXTURES) {
      await fs.writeFile(
        absoluteExpectedJsonpath,
        JSON.stringify(actualJsonOutput, null, 2)
      );
    } else {
      const expectedJsonOutput = JSON.parse(
        (await fs.readFile(absoluteExpectedJsonpath)).toString()
      );
      assert.deepStrictEqual(actualJsonOutput, expectedJsonOutput);
    }
  }
);
