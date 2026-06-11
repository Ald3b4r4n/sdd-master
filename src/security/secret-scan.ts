import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { secretPatterns } from "./secret-patterns.js";

export type SecretFinding = {
  file: string;
  line: number;
  type: string;
  value: "[REDACTED]";
};

const ignoredDirectories = new Set(["node_modules", "dist", "coverage", ".git"]);
const skippedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".zip", ".tar", ".gz"];

export function scanForSecrets(cwd: string, relative = ""): SecretFinding[] {
  const directory = join(cwd, relative);
  const findings: SecretFinding[] = [];

  if (!existsSync(directory)) {
    return findings;
  }

  for (const name of readdirSync(directory)) {
    if (relative === "" && ignoredDirectories.has(name)) {
      continue;
    }

    const relativePath = relative ? `${relative}/${name}` : name;
    const fullPath = join(cwd, relativePath);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findings.push(...scanForSecrets(cwd, relativePath));
      continue;
    }

    if (skippedExtensions.some((extension) => name.toLowerCase().endsWith(extension))) {
      continue;
    }

    const content = readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      for (const secretPattern of secretPatterns) {
        if (secretPattern.pattern.test(lines[index])) {
          findings.push({
            file: relativePath,
            line: index + 1,
            type: secretPattern.label,
            value: "[REDACTED]"
          });
        }
      }
    }
  }

  return findings;
}
