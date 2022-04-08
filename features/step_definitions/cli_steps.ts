import util from "util";
import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";
import childProcess from "child_process";

function execAsync(
  command: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

When("I run cypress", { timeout: 60 * 1000 }, async function () {
  await this.run();
});

When(
  "I run cypress with {string}",
  { timeout: 60 * 1000 },
  async function (unparsedArgs) {
    // Use user's preferred shell to split args.
    const { stdout } = await execAsync(
      `node -p "JSON.stringify(process.argv)" -- ${unparsedArgs}`
    );

    // Drop 1st arg, which is the path of node.
    const [, ...args] = JSON.parse(stdout);

    await this.run(args);
  }
);

Then("it passes", function () {
  assert.equal(this.lastRun.exitCode, 0, "Expected a zero exit code");
});

Then("it fails", function () {
  assert.notEqual(this.lastRun.exitCode, 0, "Expected a non-zero exit code");
  this.verifiedLastRunError = true;
});

Then("it should appear as if only a single test ran", function () {
  assert.match(this.lastRun.stdout, /All specs passed!\s+\d+ms\s+1\s+1\D/);
});

Then("it should appear as if both tests ran", function () {
  assert.match(this.lastRun.stdout, /All specs passed!\s+\d+ms\s+2\s+2\D/);
});

Then("it should appear to not have ran spec {string}", function (spec) {
  assert.doesNotMatch(
    this.lastRun.stdout,
    new RegExp("Running:\\s+" + rescape(spec))
  );
});

Then(
  "it should appear to have ran spec {string} and {string}",
  function (a, b) {
    for (const spec of [a, b]) {
      assert.match(
        this.lastRun.stdout,
        new RegExp("Running:\\s+" + rescape(spec))
      );
    }
  }
);

Then("I should not see {string} in the output", function (string) {
  if (this.lastRun.stdout.includes(string)) {
    assert.fail(`Expected to not find ${util.inspect(string)}, but did`);
  }
});

/**
 * Shamelessly copied from the RegExp.escape proposal.
 */
const rescape = (s: string) => String(s).replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");

const runScenarioExpr = (scenarioName: string) =>
  new RegExp(`(?:✓|√) ${rescape(scenarioName)}( \\(\\d+ms\\))?\\n`);

const pendingScenarioExpr = (scenarioName: string) =>
  new RegExp(`- ${rescape(scenarioName)}\n`);

Then(
  "it should appear to have run the scenario {string}",
  function (scenarioName) {
    assert.match(this.lastRun.stdout, runScenarioExpr(scenarioName));
  }
);

Then(
  "it should appear to not have run the scenario {string}",
  function (scenarioName) {
    assert.doesNotMatch(this.lastRun.stdout, runScenarioExpr(scenarioName));
  }
);

Then("it should appear to have run the scenarios", function (scenarioTable) {
  for (const { Name: scenarioName } of scenarioTable.hashes()) {
    assert.match(this.lastRun.stdout, runScenarioExpr(scenarioName));
  }
});

Then(
  "it should appear to not have run the scenarios",
  function (scenarioTable) {
    for (const { Name: scenarioName } of scenarioTable.hashes()) {
      assert.doesNotMatch(this.lastRun.stdout, runScenarioExpr(scenarioName));
    }
  }
);

Then("the output should contain", function (content) {
  assert.match(this.lastRun.stdout, new RegExp(rescape(content)));
});

Then(
  "it should appear to have skipped the scenario {string}",
  function (scenarioName) {
    assert.match(this.lastRun.stdout, pendingScenarioExpr(scenarioName));
  }
);
