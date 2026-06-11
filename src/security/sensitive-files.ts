import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const requiredGitignoreEntries = [
  ".env",
  ".env.*",
  "!.env.example",
  "node_modules/",
  "dist/",
  "coverage/",
  "secrets/",
  "private/",
  "credentials/",
  "*.pem",
  "*.key"
];

const ignoredDirectories = new Set(["node_modules", "dist", "coverage", ".git"]);
const forbiddenNames = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.staging",
  ".env.test",
  ".env.backup",
  ".env.old"
]);
const forbiddenDirectories = new Set(["secrets", "private", "credentials"]);
const forbiddenExtensions = [".pem", ".key", ".p12", ".pfx", ".jks", ".keystore", ".secret", ".secrets"];

export function findForbiddenFiles(cwd: string, relative = ""): string[] {
  const directory = join(cwd, relative);
  const found: string[] = [];

  if (!existsSync(directory)) {
    return found;
  }

  for (const name of readdirSync(directory)) {
    if (relative === "" && ignoredDirectories.has(name)) {
      continue;
    }

    const relativePath = relative ? `${relative}/${name}` : name;
    const fullPath = join(cwd, relativePath);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (forbiddenDirectories.has(name)) {
        found.push(`${relativePath}/`);
        continue;
      }

      found.push(...findForbiddenFiles(cwd, relativePath));
      continue;
    }

    if (name === ".env.example") {
      continue;
    }

    if (forbiddenNames.has(name) || forbiddenExtensions.some((extension) => name.endsWith(extension))) {
      found.push(relativePath);
    }
  }

  return found;
}
