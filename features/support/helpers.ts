import path from "path";
import { promises as fs } from "fs";
import { version as cypressVersion } from "cypress/package.json";

export async function writeFile(filePath: string, fileContent: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileContent);
}

export function isPost10() {
  return cypressVersion.startsWith("10.");
}

export function isPre10() {
  return !isPost10();
}
