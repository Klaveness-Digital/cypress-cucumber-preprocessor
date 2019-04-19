const fs = require("fs");
const path = require("path");

const args = process.argv;

const cucumberJsonDir = args[2] || "./cypress/cucumber-json";
const screenshotsDir = args[3] || "./cypress/screenshots";
const videosDir = args[4] || "./cypress/videos";

const featureToFileMap = {};
const cukeMap = {};
const videosMap = {};
const jsonNames = {};

const jsonPath = path.join(__dirname, "..", cucumberJsonDir);
const screenshotsPath = path.join(__dirname, "..", screenshotsDir);
const videosPath = path.join(__dirname, "..", videosDir);
const files = fs.readdirSync(jsonPath);

const videos = fs.readdirSync(videosPath);
videos.forEach(vid => {
  const arr = vid.split(".");
  const featureName = `${arr[0]}.${arr[1]}`;
  videosMap[featureName] = vid;
});

files.forEach(file => {
  const json = JSON.parse(
    fs.readFileSync(path.join(jsonPath, file)).toString()
  );
  const feature = json[0].uri.split("/").reverse()[0];
  jsonNames[feature] = file;
  cukeMap[feature] = json;
  featureToFileMap[feature] = file;
});

const failingFeatures = fs.readdirSync(screenshotsPath);
failingFeatures.forEach(feature => {
  const screenshots = fs.readdirSync(path.join(screenshotsPath, feature));
  screenshots.forEach(screenshot => {
    const scenarioName = screenshot
      .match(/[\S]+\sScenario\s([\w|\s]+)\([\S]+/)[1]
      .trim();
    const myScenario = cukeMap[feature][0].elements.find(
      e => e.name === scenarioName
    );
    const myStep = myScenario.steps.find(
      step => step.result.status !== "passed"
    );
    const data = fs.readFileSync(
      path.join(screenshotsPath, feature, screenshot)
    );
    if (data) {
      const base64Image = Buffer.from(data, "binary").toString("base64");
      myStep.embeddings.push({ data: base64Image, mime_type: "image/png" });
    }

    // find my video
    const vidData = fs
      .readFileSync(path.join(videosPath, videosMap[feature]))
      .toString("base64");
    if (vidData) {
      const html = `<video controls width="500"><source type="video/mp4" src="data:video/mp4;base64,${vidData}"> </video>`;
      const encodedHtml = Buffer.from(html, "binary").toString("base64");
      myStep.embeddings.push({ data: encodedHtml, mime_type: "text/html" });
    }

    // write me back out again
    fs.writeFileSync(
      path.join(jsonPath, jsonNames[feature]),
      JSON.stringify(cukeMap[feature], null, 2)
    );
  });
});
