import Parser from "./parser";

export function tagToCypressOptions(tag: string): Cypress.TestConfigOverrides {
  return new Parser(tag).parse();
}

export function looksLikeOptions(tag: string) {
  return tag.includes("(");
}
