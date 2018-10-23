/* eslint-disable no-eval */
const fs = require("fs");
const through = require("through");
const path = require("path");
const browserify = require("@cypress/browserify-preprocessor");
const log = require("debug")("cypress:cucumber");
const glob = require("glob");
const cosmiconfig = require("cosmiconfig");
const chokidar = require("chokidar");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (spec, toRequire) =>
  `
  const {resolveAndRunStepDefinition, defineParameterType, given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition');
  const Given = window.Given = window.given = given;
  const When = window.When = window.when = when;
  const Then = window.Then = window.then = then;
  window.defineParameterType = defineParameterType;
  const { createTestsFromFeature } = require('cypress-cucumber-preprocessor/createTestsFromFeature');
  ${eval(toRequire).join("\n")}
  const {Parser, Compiler} = require('gherkin');
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);
  
  createTestsFromFeature(gherkinAst);
  `;

const stepDefinitionPath = () => {
  const appRoot = process.cwd();

  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  if (loaded && loaded.config && loaded.config.step_definitions) {
    return path.resolve(appRoot, loaded.config.step_definitions);
  }

  // XXX Deprecated, left here for backward compability
  const cypressOptions = JSON.parse(
    fs.readFileSync(`${appRoot}/cypress.json`, "utf-8")
  );
  if (cypressOptions && cypressOptions.fileServerFolder) {
    return `${cypressOptions.fileServerFolder}/support/step_definitions`;
  }

  return `${appRoot}/cypress/support/step_definitions`;
};
const createPattern = () => `${stepDefinitionPath()}/**/*.+(js|ts)`;

const pattern = createPattern();

const getStepDefinitionsPaths = () => [].concat(glob.sync(pattern));

const compile = spec => {
  log("compiling", spec);
  const stepDefinitionsToRequire = getStepDefinitionsPaths().map(
    sdPath => `require('${sdPath}')`
  );
  return createCucumber(spec, stepDefinitionsToRequire);
};

const transform = file => {
  let data = "";

  function write(buf) {
    data += buf;
  }

  function end() {
    if (file.match(".feature$")) {
      log("compiling feature ", file);
      this.queue(compile(data));
    } else {
      this.queue(data);
    }
    this.queue(null);
  }

  return through(write, end);
};

const touch = filename => {
  fs.utimesSync(filename, new Date(), new Date());
};

let watcher;
const preprocessor = (options = browserify.defaultOptions) => file => {
  if (options.browserifyOptions.transform.indexOf(transform) === -1) {
    options.browserifyOptions.transform.unshift(transform);
  }

  if (file.shouldWatch) {
    if (watcher) {
      watcher.close();
    }
    watcher = chokidar
      .watch(stepDefinitionPath(), { ignoreInitial: true })
      .on("all", () => {
        touch(file.filePath);
      });
  }
  return browserify(options)(file);
};

module.exports = {
  default: preprocessor,
  transform
};
