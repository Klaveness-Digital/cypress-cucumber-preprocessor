import esbuild from "esbuild";

import { ICypressConfiguration } from "@badeball/cypress-configuration";

import { compile } from "./lib/template";

export { ICypressConfiguration };

export function createEsbuildPlugin(
  configuration: ICypressConfiguration
): esbuild.Plugin {
  return {
    name: "feature",
    setup(build) {
      const fs = require("fs") as typeof import("fs");

      build.onLoad({ filter: /\.feature$/ }, async (args) => {
        const content = await fs.promises.readFile(args.path, "utf8");

        return {
          contents: await compile(configuration, content, args.path),
          loader: "js",
        };
      });
    },
  };
}

export default createEsbuildPlugin;
